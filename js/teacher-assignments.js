/* ==========================================================
   RAS MARKFEEDER ERP
   TEACHER ASSIGNMENT
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let assignments = [];
let teachers = [];
let classes = [];
let subjects = [];
let academicYears = [];

let editingAssignment = null;

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const assignmentTable =
document.getElementById("assignmentTable");

const assignmentForm =
document.getElementById("assignmentForm");

const assignmentModal =
document.getElementById("assignmentModal");

const addAssignmentBtn =
document.getElementById("addAssignmentBtn");

const closeModal =
document.getElementById("closeModal");

const cancelAssignment =
document.getElementById("cancelAssignment");

const searchAssignment =
document.getElementById("searchAssignment");

const teacherSelect =
document.getElementById("teacher_id");

const classSelect =
document.getElementById("class_id");

const subjectSelect =
document.getElementById("subject_id");

const yearSelect =
document.getElementById("academic_year_id");

const classTeacher =
document.getElementById("is_class_teacher");

const active =
document.getElementById("active");

/* Filters */

const filterGrade =
document.getElementById("filterGrade");

const filterSection =
document.getElementById("filterSection");

const filterSubject =
document.getElementById("filterSubject");

const filterYear =
document.getElementById("filterYear");

/* Dashboard */

const totalAssignments =
document.getElementById("totalAssignments");

const classTeacherCount =
document.getElementById("classTeacherCount");

const subjectTeacherCount =
document.getElementById("subjectTeacherCount");

const activeAssignments =
document.getElementById("activeAssignments");

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initializeEvents();

    await Promise.all([

        loadTeachers(),

        loadClasses(),

        loadSubjects(),

        loadAcademicYears()

    ]);

    await loadAssignments();

});

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents(){

    if(addAssignmentBtn){

        addAssignmentBtn.addEventListener("click",()=>{

            editingAssignment=null;

            assignmentForm.reset();

            document.getElementById("modalTitle").textContent="Assign Teacher";

            assignmentModal.classList.add("show");

        });

    }

    if(closeModal){

        closeModal.addEventListener("click",closeAssignmentModal);

    }

    if(cancelAssignment){

        cancelAssignment.addEventListener("click",closeAssignmentModal);

    }

    window.addEventListener("click",(e)=>{

        if(e.target===assignmentModal){

            closeAssignmentModal();

        }

    });

    assignmentForm.addEventListener("submit",saveAssignment);

}

/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeAssignmentModal(){

    assignmentModal.classList.remove("show");

}

/* ==========================================================
   LOAD TEACHERS
========================================================== */

async function loadTeachers(){

    const {data,error}=await supabase

    .from("teachers")

    .select("id,teacher_name")

    .order("teacher_name");

    if(error){

        console.error(error);

        return;

    }

    teachers=data||[];

    teacherSelect.innerHTML=
    `<option value="">Select Teacher</option>`;

    teachers.forEach(t=>{

        teacherSelect.innerHTML+=`

        <option value="${t.id}">

            ${t.teacher_name}

        </option>

        `;

    });

}

/* ==========================================================
   LOAD CLASSES
========================================================== */

async function loadClasses(){

    const {data,error}=await supabase

    .from("classes")

    .select("*")

    .order("grade");

    if(error){

        console.error(error);

        return;

    }

    classes=data||[];

    classSelect.innerHTML=
    `<option value="">Select Class</option>`;

    classes.forEach(c=>{

        classSelect.innerHTML+=`

        <option value="${c.id}">

            Grade ${c.grade} - ${c.section}

        </option>

        `;

    });

}
/* ==========================================================
   LOAD SUBJECTS
========================================================== */

async function loadSubjects() {

    const { data, error } = await supabase

        .from("subjects")

        .select("id,subject_name")

        .order("subject_name");

    if (error) {

        console.error(error);

        return;

    }

    subjects = data || [];

    subjectSelect.innerHTML =
        `<option value="">Select Subject</option>`;

    filterSubject.innerHTML =
        `<option value="">All Subjects</option>`;

    subjects.forEach(subject => {

        subjectSelect.innerHTML += `

            <option value="${subject.id}">
                ${subject.subject_name}
            </option>

        `;

        filterSubject.innerHTML += `

            <option value="${subject.id}">
                ${subject.subject_name}
            </option>

        `;

    });

}

/* ==========================================================
   LOAD ACADEMIC YEARS
========================================================== */

async function loadAcademicYears() {

    const { data, error } = await supabase

        .from("academic_years")

        .select("*")

        .order("id");

    if (error) {

        console.error(error);

        return;

    }

    academicYears = data || [];

    yearSelect.innerHTML =
        `<option value="">Academic Year</option>`;

    filterYear.innerHTML =
        `<option value="">All Years</option>`;

    academicYears.forEach(year => {

        yearSelect.innerHTML += `

            <option value="${year.id}">
                ${year.academic_year}
            </option>

        `;

        filterYear.innerHTML += `

            <option value="${year.id}">
                ${year.academic_year}
            </option>

        `;

    });

}

/* ==========================================================
   LOAD ASSIGNMENTS
========================================================== */

async function loadAssignments() {

    assignmentTable.innerHTML = `

        <tr>

            <td colspan="8">

                Loading Assignments...

            </td>

        </tr>

    `;

    const { data, error } = await supabase

        .from("vw_teacher_assignments")

        .select("*")

        .order("teacher_name");

    if (error) {

        console.error(error);

        assignmentTable.innerHTML = `

            <tr>

                <td colspan="8">

                    Failed to Load Assignments

                </td>

            </tr>

        `;

        return;

    }

    assignments = data || [];

    updateDashboard();

    renderAssignments(assignments);

}

/* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard() {

    totalAssignments.textContent =
        assignments.length;

    classTeacherCount.textContent =
        assignments.filter(a => a.is_class_teacher).length;

    subjectTeacherCount.textContent =
        assignments.filter(a => !a.is_class_teacher).length;

    activeAssignments.textContent =
        assignments.filter(a => a.active).length;

}

/* ==========================================================
   RENDER TABLE
========================================================== */

function renderAssignments(data) {

    if (data.length === 0) {

        assignmentTable.innerHTML = `

            <tr>

                <td colspan="8"
                    style="text-align:center;padding:30px;">

                    No Assignments Found

                </td>

            </tr>

        `;

        return;

    }

    assignmentTable.innerHTML = "";

    data.forEach(a => {

        assignmentTable.innerHTML += `

        <tr>

            <td>${a.teacher_name}</td>

            <td>${a.grade}</td>

            <td>${a.section}</td>

            <td>${a.subject_name}</td>

            <td>${a.academic_year}</td>

            <td>

                <span class="${
                    a.is_class_teacher
                        ? "status active"
                        : "status pending"
                }">

                    ${
                        a.is_class_teacher
                            ? "Yes"
                            : "No"
                    }

                </span>

            </td>

            <td>

                <span class="${
                    a.active
                        ? "status active"
                        : "status inactive"
                }">

                    ${
                        a.active
                            ? "Active"
                            : "Inactive"
                    }

                </span>

            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="action-btn edit"
                        onclick="editAssignment('${a.id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="action-btn delete"
                        onclick="deleteAssignment('${a.id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

        `;

    });

}
/* ==========================================================
   SAVE ASSIGNMENT
========================================================== */

async function saveAssignment(e){

    e.preventDefault();

    const assignment={

        teacher_id:
        teacherSelect.value,

        class_id:
        classSelect.value,

        subject_id:
        subjectSelect.value,

        academic_year_id:
        yearSelect.value,

        is_class_teacher:
        classTeacher.checked,

        active:
        active.checked

    };

    /* ==========================================
       DUPLICATE CHECK
    ========================================== */

    const duplicate=assignments.find(a=>

        a.teacher_id===assignment.teacher_id &&

        a.class_id===assignment.class_id &&

        a.subject_id===assignment.subject_id &&

        a.id!==editingAssignment

    );

    if(duplicate){

        alert("Teacher already assigned.");

        return;

    }

    let error;

    /* ==========================================
       UPDATE
    ========================================== */

    if(editingAssignment){

        ({error}=await supabase

            .from("teacher_assignments")

            .update(assignment)

            .eq("id",editingAssignment));

    }

    /* ==========================================
       INSERT
    ========================================== */

    else{

        ({error}=await supabase

            .from("teacher_assignments")

            .insert([assignment]));

    }

    if(error){

        console.error(error);

        alert(error.message);

        return;

    }

    alert(

        editingAssignment

        ? "Assignment Updated Successfully"

        : "Assignment Added Successfully"

    );

    editingAssignment=null;

    assignmentForm.reset();

    closeAssignmentModal();

    await loadAssignments();

}

/* ==========================================================
   EDIT ASSIGNMENT
========================================================== */

async function editAssignment(id){

    const assignment=

    assignments.find(a=>a.id===id);

    if(!assignment) return;

    editingAssignment=id;

    document.getElementById("modalTitle").textContent=

    "Edit Assignment";

    teacherSelect.value=
    assignment.teacher_id;

    classSelect.value=
    assignment.class_id;

    subjectSelect.value=
    assignment.subject_id;

    yearSelect.value=
    assignment.academic_year_id;

    classTeacher.checked=
    assignment.is_class_teacher;

    active.checked=
    assignment.active;

    assignmentModal.classList.add("show");

}

/* ==========================================================
   DELETE ASSIGNMENT
========================================================== */

async function deleteAssignment(id){

    if(!confirm("Delete this assignment?")){

        return;

    }

    const {error}=await supabase

    .from("teacher_assignments")

    .delete()

    .eq("id",id);

    if(error){

        alert(error.message);

        return;

    }

    await loadAssignments();

}

/* ==========================================================
   SEARCH + FILTER
========================================================== */

function filterAssignments(){

    const keyword=

    searchAssignment.value.toLowerCase();

    const grade=

    filterGrade.value;

    const section=

    filterSection.value;

    const subject=

    filterSubject.value;

    const year=

    filterYear.value;

    const filtered=assignments.filter(a=>{

        const matchSearch=

        (a.teacher_name||"")

        .toLowerCase()

        .includes(keyword);

        const matchGrade=

        !grade||

        String(a.grade)===grade;

        const matchSection=

        !section||

        a.section===section;

        const matchSubject=

        !subject||

        a.subject_id===subject;

        const matchYear=

        !year||

        String(a.academic_year_id)===year;

        return(

            matchSearch&&

            matchGrade&&

            matchSection&&

            matchSubject&&

            matchYear

        );

    });

    renderAssignments(filtered);

}

/* ==========================================================
   EVENTS
========================================================== */

searchAssignment.addEventListener(

    "input",

    filterAssignments

);

filterGrade.addEventListener(

    "change",

    filterAssignments

);

filterSection.addEventListener(

    "change",

    filterAssignments

);

filterSubject.addEventListener(

    "change",

    filterAssignments

);

filterYear.addEventListener(

    "change",

    filterAssignments

);

window.editAssignment=editAssignment;

window.deleteAssignment=deleteAssignment;
/* ==========================================================
   LOAD GRADE & SECTION FILTERS
========================================================== */

function loadGradeFilters() {

    const grades =
        [...new Set(classes.map(c => c.grade))].sort((a, b) => a - b);

    filterGrade.innerHTML =
        `<option value="">All Grades</option>`;

    grades.forEach(g => {

        filterGrade.innerHTML +=
            `<option value="${g}">Grade ${g}</option>`;

    });

}

function loadSectionFilters() {

    const sections =
        [...new Set(classes.map(c => c.section))].sort();

    filterSection.innerHTML =
        `<option value="">All Sections</option>`;

    sections.forEach(section => {

        filterSection.innerHTML +=
            `<option value="${section}">${section}</option>`;

    });

}

/* ==========================================================
   EXPORT TO EXCEL
========================================================== */

function exportToExcel() {

    const exportData = assignments.map(a => ({

        Teacher: a.teacher_name,

        Grade: a.grade,

        Section: a.section,

        Subject: a.subject_name,

        "Academic Year": a.academic_year,

        "Class Teacher":
            a.is_class_teacher ? "Yes" : "No",

        Status:
            a.active ? "Active" : "Inactive"

    }));

    const worksheet =
        XLSX.utils.json_to_sheet(exportData);

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Teacher Assignments"
    );

    XLSX.writeFile(
        workbook,
        "Teacher_Assignments.xlsx"
    );

}

/* ==========================================================
   TOAST
========================================================== */

function showToast(message, type = "success") {

    if (window.showToast) {

        window.showToast(message, type);

    } else {

        alert(message);

    }

}

/* ==========================================================
   REPLACE ALERTS
========================================================== */

/*
Replace:

alert("Assignment Added Successfully");

with

showToast("Assignment Added Successfully");

Replace:

alert("Assignment Updated Successfully");

with

showToast("Assignment Updated Successfully");

Replace:

alert(error.message);

with

showToast(error.message,"error");

*/

/* ==========================================================
   FINAL INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("exportAssignments")) {

        document
            .getElementById("exportAssignments")
            .addEventListener("click", exportToExcel);

    }

});

/* ==========================================================
   LOAD FILTERS AFTER MASTER DATA
========================================================== */

async function initializeFilters() {

    loadGradeFilters();

    loadSectionFilters();

}

/* ==========================================================
   MODIFY DOM LOADED
========================================================== */

/*
After

await Promise.all([
    loadTeachers(),
    loadClasses(),
    loadSubjects(),
    loadAcademicYears()
]);

add

initializeFilters();

before

await loadAssignments();

*/

/* ==========================================================
   END OF FILE
========================================================== */
