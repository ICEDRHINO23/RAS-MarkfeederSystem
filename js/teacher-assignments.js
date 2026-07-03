/* ==========================================================
   RAS MARKFEEDER ERP
   TEACHER ASSIGNMENTS
========================================================== */

import { supabase } from "../database/supabase.js";

import {
    loadData,
    insertData,
    updateData,
    deleteData
} from "../utils/crud.js";

import {
    openModal,
    closeModal,
    initializeModal
} from "../utils/modal.js";

import {
    success,
    error
} from "../utils/alerts.js";

import { exportExcel } from "../utils/excel.js";

import { search } from "../utils/search.js";

import { filterData } from "../utils/filters.js";

import {
    showLoader,
    showEmpty,
    showError
} from "../utils/loader.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let assignments = [];

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

const closeModalBtn =
    document.getElementById("closeModal");

const cancelAssignment =
    document.getElementById("cancelAssignment");

const searchInput =
    document.getElementById("searchInput");

const teacherFilter =
    document.getElementById("teacherFilter");

const classFilter =
    document.getElementById("classFilter");

const subjectFilter =
    document.getElementById("subjectFilter");

const exportBtn =
    document.getElementById("exportBtn");

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        initializeModal(assignmentModal);

        initializeEvents();

        await loadDropdowns();

        await loadAssignments();

    }

);

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents(){

    addAssignmentBtn.addEventListener(

        "click",

        ()=>{

            editingAssignment = null;

            assignmentForm.reset();

            document.getElementById("active").checked = true;

            document.getElementById("modalTitle").textContent =
                "Add Teacher Assignment";

            openModal(assignmentModal);

        }

    );

    closeModalBtn.addEventListener(

        "click",

        ()=>closeModal(assignmentModal)

    );

    cancelAssignment.addEventListener(

        "click",

        ()=>closeModal(assignmentModal)

    );

    assignmentForm.addEventListener(

        "submit",

        saveAssignment

    );

    searchInput.addEventListener(

        "input",

        searchAssignments

    );

    teacherFilter.addEventListener(

        "change",

        applyFilters

    );

    classFilter.addEventListener(

        "change",

        applyFilters

    );

    subjectFilter.addEventListener(

        "change",

        applyFilters

    );

    exportBtn.addEventListener(

        "click",

        exportAssignments

    );

}

/* ==========================================================
   LOAD DROPDOWNS
========================================================== */

async function loadDropdowns(){

    await loadTeachers();

    await loadClasses();

    await loadSubjects();

}
/* ==========================================================
   LOAD TEACHERS
========================================================== */

async function loadTeachers() {

    const teacherSelect =
        document.getElementById("teacher_id");

    teacherSelect.innerHTML =
        `<option value="">Select Teacher</option>`;

    teacherFilter.innerHTML =
        `<option value="">All Teachers</option>`;

    const { data, error } = await supabase
        .from("teachers")
        .select("id, teacher_name")
        .eq("active", true)
        .order("teacher_name");

    if (error) {

        console.error(error);

        return;

    }

    data.forEach(teacher => {

        teacherSelect.innerHTML += `

<option value="${teacher.id}">

${teacher.teacher_name}

</option>

`;

        teacherFilter.innerHTML += `

<option value="${teacher.teacher_name}">

${teacher.teacher_name}

</option>

`;

    });

}

/* ==========================================================
   LOAD CLASSES
========================================================== */

async function loadClasses() {

    const classSelect =
        document.getElementById("class_id");

    classSelect.innerHTML =
        `<option value="">Select Class</option>`;

    classFilter.innerHTML =
        `<option value="">All Classes</option>`;

    const { data, error } = await supabase
        .from("classes")
        .select("id,class_name,section")
        .eq("active", true)
        .order("class_name");

    if (error) {

        console.error(error);

        return;

    }

    data.forEach(cls => {

        classSelect.innerHTML += `

<option value="${cls.id}">

${cls.class_name} ${cls.section}

</option>

`;

        classFilter.innerHTML += `

<option value="${cls.class_name}">

${cls.class_name}

</option>

`;

    });

}

/* ==========================================================
   LOAD SUBJECTS
========================================================== */

async function loadSubjects() {

    const subjectSelect =
        document.getElementById("subject_id");

    subjectSelect.innerHTML =
        `<option value="">Select Subject</option>`;

    subjectFilter.innerHTML =
        `<option value="">All Subjects</option>`;

    const { data, error } = await supabase
        .from("subjects")
        .select("id,subject_name")
        .eq("active", true)
        .order("subject_name");

    if (error) {

        console.error(error);

        return;

    }

    data.forEach(subject => {

        subjectSelect.innerHTML += `

<option value="${subject.id}">

${subject.subject_name}

</option>

`;

        subjectFilter.innerHTML += `

<option value="${subject.subject_name}">

${subject.subject_name}

</option>

`;

    });

}

/* ==========================================================
   LOAD ASSIGNMENTS
========================================================== */

async function loadAssignments() {

    showLoader(assignmentTable, 8);

    try {

        assignments = await loadData(

            "vw_teacher_assignments"

        );

        updateDashboard();

        renderAssignments(assignments);

    }

    catch (err) {

        console.error(err);

        showError(

            assignmentTable,

            err.message,

            8

        );

    }

}

/* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard() {

    document.getElementById("totalAssignments").textContent =
        assignments.length;

    document.getElementById("teacherCount").textContent =
        new Set(
            assignments.map(a => a.teacher_name)
        ).size;

    document.getElementById("classCount").textContent =
        new Set(
            assignments.map(a => a.class_name)
        ).size;

    document.getElementById("classTeacherCount").textContent =
        assignments.filter(
            a => a.is_class_teacher
        ).length;

}

/* ==========================================================
   RENDER TABLE
========================================================== */

function renderAssignments(data) {

    if (!data.length) {

        showEmpty(assignmentTable, 8);

        return;

    }

    assignmentTable.innerHTML = "";

    data.forEach(item => {

        assignmentTable.innerHTML += `

<tr>

<td>${item.teacher_name}</td>

<td>${item.class_name}</td>

<td>${item.section}</td>

<td>${item.subject_name}</td>

<td>${item.academic_year}</td>

<td>

${item.is_class_teacher
? "✔"
: "-"}

</td>

<td>

<span class="${
item.active
? "badge-success"
: "badge-danger"
}">

${item.active
? "Active"
: "Inactive"}

</span>

</td>

<td>

<div class="action-buttons">

<button
class="edit-btn"
onclick="editAssignment('${item.id}')">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-btn"
onclick="deleteAssignment('${item.id}')">

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

async function saveAssignment(e) {

    e.preventDefault();

    const assignment = {

        teacher_id:
            document.getElementById("teacher_id").value,

        class_id:
            document.getElementById("class_id").value,

        subject_id:
            document.getElementById("subject_id").value,

        academic_year:
            document.getElementById("academic_year").value,

        is_class_teacher:
            document.getElementById("is_class_teacher").checked,

        active:
            document.getElementById("active").checked

    };

    try {

        if (editingAssignment) {

            await updateData(

                "teacher_assignments",

                editingAssignment,

                assignment

            );

            success("Assignment Updated Successfully");

        } else {

            await insertData(

                "teacher_assignments",

                assignment

            );

            success("Assignment Added Successfully");

        }

        editingAssignment = null;

        assignmentForm.reset();

        closeModal(assignmentModal);

        await loadAssignments();

    } catch (err) {

        console.error(err);

        error(err.message);

    }

}

/* ==========================================================
   EDIT ASSIGNMENT
========================================================== */

async function editAssignment(id) {

    const item = assignments.find(a => a.id === id);

    if (!item) return;

    editingAssignment = id;

    document.getElementById("modalTitle").textContent =
        "Edit Teacher Assignment";

    document.getElementById("teacher_id").value =
        item.teacher_id;

    document.getElementById("class_id").value =
        item.class_id;

    document.getElementById("subject_id").value =
        item.subject_id;

    document.getElementById("academic_year").value =
        item.academic_year;

    document.getElementById("is_class_teacher").checked =
        item.is_class_teacher;

    document.getElementById("active").checked =
        item.active;

    openModal(assignmentModal);

}

/* ==========================================================
   DELETE ASSIGNMENT
========================================================== */

async function deleteAssignment(id) {

    if (!confirm("Delete this assignment?"))
        return;

    try {

        await deleteData(

            "teacher_assignments",

            id

        );

        success("Assignment Deleted");

        await loadAssignments();

    } catch (err) {

        console.error(err);

        error(err.message);

    }

}

/* ==========================================================
   SEARCH
========================================================== */

function searchAssignments() {

    const filtered = search(

        assignments,

        searchInput.value,

        [

            "teacher_name",

            "class_name",

            "section",

            "subject_name",

            "academic_year"

        ]

    );

    renderAssignments(filtered);

}

/* ==========================================================
   FILTERS
========================================================== */

function applyFilters() {

    const filtered = assignments.filter(item => {

        return (

            (!teacherFilter.value ||
                item.teacher_name === teacherFilter.value)

            &&

            (!classFilter.value ||
                item.class_name === classFilter.value)

            &&

            (!subjectFilter.value ||
                item.subject_name === subjectFilter.value)

        );

    });

    renderAssignments(filtered);

}

/* ==========================================================
   EXPORT
========================================================== */

function exportAssignments() {

    const rows = assignments.map(item => ({

        Teacher: item.teacher_name,

        Class: item.class_name,

        Section: item.section,

        Subject: item.subject_name,

        "Academic Year": item.academic_year,

        "Class Teacher":
            item.is_class_teacher ? "Yes" : "No",

        Status:
            item.active ? "Active" : "Inactive"

    }));

    exportExcel(

        rows,

        "Teacher Assignments"

    );

}

/* ==========================================================
   GLOBAL
========================================================== */

window.editAssignment = editAssignment;

window.deleteAssignment = deleteAssignment;

console.log(
    "Teacher Assignments Module Loaded Successfully"
);
