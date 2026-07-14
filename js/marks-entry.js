/* ==========================================================
   RAS MARKFEEDER ERP
   MARKS ENTRY
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let students = [];
let assignments = [];
let marks = [];
let exams = [];
let subjects = [];
let classes = [];
let academicYears = [];

let selectedAssignment = null;

/* ==========================================================
   DOM
========================================================== */

const academicYear = document.getElementById("academicYear");
const exam = document.getElementById("exam");
const assignmentSelect =
    document.getElementById("assignment");

const totalMarks = document.getElementById("totalMarks");
const rememberMarks = document.getElementById("rememberMarks");

const loadStudentsBtn = document.getElementById("loadStudents");
const applyAllBtn = document.getElementById("applyAll");

const marksTableBody =
document.getElementById("marksTableBody");

/* ==========================================================
   DASHBOARD
========================================================== */

const studentCount =
document.getElementById("studentCount");

const savedCount =
document.getElementById("savedCount");

const absentCount =
document.getElementById("absentCount");

const pendingCount =
document.getElementById("pendingCount");

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initializeEvents();

   await Promise.all([
    loadAcademicYears(),
    loadExams(),
    loadAssignments()
]);

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents(){

    loadStudentsBtn.addEventListener(

        "click",

        loadStudents

    );

    applyAllBtn.addEventListener(

        "click",

        applyTotalMarks

    );

}

/* ==========================================================
   LOAD ACADEMIC YEARS
========================================================== */

async function loadAcademicYears(){

    const {data,error}=await supabase

    .from("academic_years")

    .select("*")

    .order("id");

    if(error){

        console.error(error);

        return;

    }

    academicYears=data;

    academicYear.innerHTML=

    `<option value="">Academic Year</option>`;

    data.forEach(year=>{

        academicYear.innerHTML+=`

        <option value="${year.id}">

            ${year.academic_year}

        </option>

        `;

    });

}

/* ==========================================================
   LOAD EXAMS
========================================================== */

async function loadExams(){

    const {data,error}=await supabase

    .from("exams")

    .select("*")

    .order("exam_name");

    if(error){

        console.error(error);

        return;

    }

    exams=data;

    exam.innerHTML=

    `<option value="">Select Exam</option>`;

    data.forEach(item=>{

        exam.innerHTML+=`

        <option value="${item.id}">

            ${item.exam_name}

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

    classes=data;

    classSelect.innerHTML=

    `<option value="">Select Class</option>`;

    data.forEach(item=>{

        classSelect.innerHTML+=`

        <option value="${item.id}">

            Grade ${item.grade}-${item.section}

        </option>

        `;

    });

}

/* ==========================================================
   LOAD SUBJECTS
========================================================== */

async function loadSubjects(){

    const {data,error}=await supabase

    .from("subjects")

    .select("*")

    .order("subject_name");

    if(error){

        console.error(error);

        return;

    }

    subjects=data;

    subject.innerHTML=

    `<option value="">Select Subject</option>`;

    data.forEach(item=>{

        subject.innerHTML+=`

        <option value="${item.id}">

            ${item.subject_name}

        </option>

        `;

    });

}
/* ==========================================================
   LOAD TEACHER ASSIGNMENTS
========================================================== */

async function loadAssignments() {

    /*
       TODO:
       Replace this with logged-in teacher ID
       after authentication is completed.
    */

    const teacherId =
        localStorage.getItem("teacher_id");

    if (!teacherId) {

        console.warn("Teacher not logged in.");

        return;

    }

    const { data, error } = await supabase

        .from("vw_teacher_assignments")

        .select("*")

        .eq("teacher_id", teacherId)

        .eq("active", true)

        .order("grade");

    if (error) {

        console.error(error);

        return;

    }

    assignments = data || [];

    assignmentSelect.innerHTML =

        `<option value="">Select Assignment</option>`;

    assignments.forEach(item => {

        assignmentSelect.innerHTML += `

            <option value="${item.id}">

                Grade ${item.grade}-${item.section}

                •

                ${item.subject_name}

            </option>

        `;

    });

}

/* ==========================================================
   LOAD REMEMBERED TOTAL MARKS
========================================================== */

async function loadDefaultMarks() {

    const assignmentId =
        assignmentSelect.value;

    if (!assignmentId || !exam.value)
        return;

    const { data } = await supabase

        .from("mark_defaults")

        .select("*")

        .eq("teacher_assignment_id", assignmentId)

        .eq("exam_id", exam.value)

        .single();

    if (data) {

        totalMarks.value =
            data.total_marks;

    } else {

        totalMarks.value = "";

    }

}

/* ==========================================================
   ASSIGNMENT CHANGED
========================================================== */

assignmentSelect.addEventListener(

    "change",

    loadDefaultMarks

);

exam.addEventListener(

    "change",

    loadDefaultMarks

);

/* ==========================================================
   LOAD STUDENTS
========================================================== */

async function loadStudents() {

    if (!assignmentSelect.value) {

        alert("Select Assignment");

        return;

    }

    const assignment =

        assignments.find(

            a => a.id === assignmentSelect.value

        );

    if (!assignment) return;

    const { data, error } = await supabase

        .from("vw_student_details")

        .select("*")

        .eq("class_id", assignment.class_id)

        .eq("active", true)

        .order("roll_no");

    if (error) {

        console.error(error);

        return;

    }

    students = data || [];

    renderStudents();

}

/* ==========================================================
   RENDER STUDENTS
========================================================== */

function renderStudents() {

    if (students.length === 0) {

        marksTableBody.innerHTML = `

            <tr>

                <td colspan="9">

                    No Students Found

                </td>

            </tr>

        `;

        return;

    }

    marksTableBody.innerHTML = "";

    students.forEach(student => {

        marksTableBody.innerHTML += `

<tr>

<td>

${student.roll_no}

</td>

<td>

${student.admission_no}

</td>

<td>

${student.student_name}

</td>

<td>

<select class="attendance">

<option>Present</option>

<option>Absent</option>

<option>Medical</option>

<option>Leave</option>

</select>

</td>

<td>

<input

type="number"

class="total"

value="${totalMarks.value}"

>

</td>

<td>

<input

type="number"

class="obtained"

min="0"

>

</td>

<td class="percentage">

0%

</td>

<td class="grade">

-

</td>

<td>

<input

type="text"

class="remarks"

>

</td>

</tr>

`;

    });

    studentCount.textContent =
        students.length;

}
   /* ==========================================================
   APPLY TOTAL MARKS TO ALL
========================================================== */

function applyTotalMarks() {

    const total = Number(totalMarks.value);

    if (!total || total <= 0) {

        alert("Enter Total Marks");

        return;

    }

    document.querySelectorAll(".total").forEach(input => {

        input.value = total;

    });

    calculateStatistics();

}

/* ==========================================================
   GRADE CALCULATION
========================================================== */

function getGrade(percent) {

    if (percent >= 91) return "A1";

    if (percent >= 81) return "A2";

    if (percent >= 71) return "B1";

    if (percent >= 61) return "B2";

    if (percent >= 51) return "C1";

    if (percent >= 41) return "C2";

    if (percent >= 33) return "D";

    return "E";

}

/* ==========================================================
   CALCULATE ROW
========================================================== */

function calculateRow(row) {

    const attendance = row.querySelector(".attendance").value;

    const total = Number(
        row.querySelector(".total").value
    );

    const obtainedInput =
        row.querySelector(".obtained");

    let obtained =
        Number(obtainedInput.value);

    const percentageCell =
        row.querySelector(".percentage");

    const gradeCell =
        row.querySelector(".grade");

    if (attendance !== "Present") {

        obtainedInput.value = 0;

        percentageCell.textContent = "-";

        gradeCell.textContent = "AB";

        calculateStatistics();

        return;

    }

    if (obtained > total) {

        obtainedInput.style.border =
            "2px solid red";

        return;

    }

    obtainedInput.style.border = "";

    const percentage =
        total > 0
            ? (obtained / total) * 100
            : 0;

    percentageCell.textContent =
        percentage.toFixed(1) + "%";

    gradeCell.textContent =
        getGrade(percentage);

    calculateStatistics();

}

/* ==========================================================
   KEYBOARD NAVIGATION
========================================================== */

function enableKeyboardNavigation() {

    const inputs =
        document.querySelectorAll(".obtained");

    inputs.forEach((input, index) => {

        input.addEventListener("keydown", e => {

            if (e.key === "Enter") {

                e.preventDefault();

                if (inputs[index + 1]) {

                    inputs[index + 1].focus();

                    inputs[index + 1].select();

                }

            }

        });

    });

}

/* ==========================================================
   EVENTS AFTER TABLE LOAD
========================================================== */

function attachRowEvents() {

    document.querySelectorAll("tbody tr")
        .forEach(row => {

            row.querySelector(".attendance")
                .addEventListener(
                    "change",
                    () => calculateRow(row)
                );

            row.querySelector(".total")
                .addEventListener(
                    "input",
                    () => calculateRow(row)
                );

            row.querySelector(".obtained")
                .addEventListener(
                    "input",
                    () => calculateRow(row)
                );

        });

    enableKeyboardNavigation();

}

/* ==========================================================
   LIVE STATISTICS
========================================================== */

function calculateStatistics() {

    const rows =
        document.querySelectorAll("#marksTableBody tr");

    let highest = 0;

    let lowest = 999999;

    let total = 0;

    let count = 0;

    let absent = 0;

    rows.forEach(row => {

        const attendance =
            row.querySelector(".attendance")?.value;

        const obtained =
            Number(
                row.querySelector(".obtained")?.value
            );

        if (attendance !== "Present") {

            absent++;

            return;

        }

        highest = Math.max(highest, obtained);

        lowest = Math.min(lowest, obtained);

        total += obtained;

        count++;

    });

    document.getElementById("highestMarks")
        .textContent = highest;

    document.getElementById("lowestMarks")
        .textContent =
        count ? lowest : 0;

    document.getElementById("averageMarks")
        .textContent =
        count
        ? (total / count).toFixed(2)
        : 0;

    document.getElementById("absentCount")
        .textContent = absent;

}

/* ==========================================================
   MODIFY renderStudents()
========================================================== */

/*
At the END of renderStudents()

add

attachRowEvents();

calculateStatistics();

*/
                          /* ==========================================================
   SAVE DEFAULT TOTAL MARKS
========================================================== */

async function saveDefaultMarks() {

    if (!rememberMarks.checked) return;

    const assignmentId = assignmentSelect.value;

    if (!assignmentId || !exam.value || !totalMarks.value) return;

    const { error } = await supabase

        .from("mark_defaults")

        .upsert({

            teacher_assignment_id: assignmentId,

            exam_id: Number(exam.value),

            total_marks: Number(totalMarks.value)

        },{

            onConflict:
            "teacher_assignment_id,exam_id"

        });

    if(error){

        console.error(error);

    }

}

/* ==========================================================
   SAVE MARKS
========================================================== */

async function saveMarks(status="Draft"){

    const assignment = assignments.find(

        a => a.id === assignmentSelect.value

    );

    if(!assignment){

        alert("Select Assignment");

        return;

    }

    await saveDefaultMarks();

    const rows =

    document.querySelectorAll("#marksTableBody tr");

    const saveData=[];

    rows.forEach(row=>{

        const studentId=

        row.dataset.studentId;

        if(!studentId) return;

        saveData.push({

            student_id:studentId,

            exam_id:Number(exam.value),

            teacher_assignment_id:assignment.id,

            subject_id:assignment.subject_id,

            marks_obtained:Number(

                row.querySelector(".obtained").value||0

            ),

            max_marks:Number(

                row.querySelector(".total").value||0

            ),

            attendance:

            row.querySelector(".attendance").value,

            grade:

            row.querySelector(".grade").textContent,

            remarks:

            row.querySelector(".remarks").value,

            status:status,

            entered_by:

            localStorage.getItem("teacher_id")

        });

    });

    const {error}=await supabase

    .from("marks")

    .upsert(saveData,{

        onConflict:

        "student_id,exam_id,subject_id"

    });

    if(error){

        console.error(error);

        alert(error.message);

        return;

    }

    document.getElementById("saveStatus")

    .className="status active";

    document.getElementById("saveStatus")

    .textContent=status;

}

/* ==========================================================
   SAVE BUTTON
========================================================== */

document.getElementById("saveDraft")

.addEventListener("click",()=>{

    saveMarks("Draft");

});

/* ==========================================================
   SUBMIT BUTTON
========================================================== */

document.getElementById("submitMarks")

.addEventListener("click",async()=>{

    if(

        !confirm(

            "Submit marks? After submission editing may be restricted."

        )

    ) return;

    await saveMarks("Submitted");

});

/* ==========================================================
   AUTO SAVE
========================================================== */

let autoSaveTimer;

document.addEventListener("input",()=>{

    clearTimeout(autoSaveTimer);

    autoSaveTimer=setTimeout(()=>{

        saveMarks("Draft");

    },5000);

});

/* ==========================================================
   LOAD PREVIOUS MARKS
========================================================== */

async function loadExistingMarks(){

    const assignment=

    assignments.find(

        a=>a.id===assignmentSelect.value

    );

    if(!assignment) return;

    const {data}=await supabase

    .from("marks")

    .select("*")

    .eq("exam_id",exam.value)

    .eq("subject_id",assignment.subject_id)

    .eq(

        "teacher_assignment_id",

        assignment.id

    );

    if(!data) return;

    data.forEach(mark=>{

        const row=document.querySelector(

            `tr[data-student-id="${mark.student_id}"]`

        );

        if(!row) return;

        row.querySelector(".obtained").value=

        mark.marks_obtained;

        row.querySelector(".total").value=

        mark.max_marks;

        row.querySelector(".attendance").value=

        mark.attendance;

        row.querySelector(".remarks").value=

        mark.remarks;

        calculateRow(row);

    });

}

/* ==========================================================
   MODIFY renderStudents()
========================================================== */

/*

When creating each row

change

<tr>

to

<tr data-student-id="${student.id}">

At the END of renderStudents()

add

loadExistingMarks();

attachRowEvents();

calculateStatistics();

*/

/* ==========================================================
   CTRL + S
========================================================== */

document.addEventListener("keydown",(e)=>{

    if(e.ctrlKey && e.key==="s"){

        e.preventDefault();

        saveMarks("Draft");

    }

});
