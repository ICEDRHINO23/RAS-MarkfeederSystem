/* ==========================================================
   RAS MARKFEEDER ERP
   MARKS ENTRY
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let currentTeacher = null;
let assignments = [];
let exams = [];
let students = [];
let markingScheme = null;

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const academicYear = document.getElementById("academicYear");
const examSelect = document.getElementById("examSelect");
const classSelect = document.getElementById("classSelect");
const subjectSelect = document.getElementById("subjectSelect");

const teacherName = document.getElementById("teacherName");

const loadStudentsBtn =
    document.getElementById("loadStudentsBtn");

const marksTable =
    document.getElementById("marksTable");

const progressText =
    document.getElementById("progressText");

const progressFill =
    document.getElementById("progressFill");

/* Dashboard */

const assignedClasses =
    document.getElementById("assignedClasses");

const assignedSubjects =
    document.getElementById("assignedSubjects");

const studentCount =
    document.getElementById("studentCount");

const completionPercent =
    document.getElementById("completionPercent");

/* Exam Info */

const maxMarks =
    document.getElementById("maxMarks");

const passMarks =
    document.getElementById("passMarks");

const entryType =
    document.getElementById("entryType");

const examStatus =
    document.getElementById("examStatus");

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        initializeEvents();

        await loadAcademicYears();

        await loadExams();

        await loadTeacherAssignments();

    }

);

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents(){

    loadStudentsBtn.addEventListener(

        "click",

        loadStudents

    );

    examSelect.addEventListener(

        "change",

        loadMarkingScheme

    );

}

/* ==========================================================
   LOAD ACADEMIC YEARS
========================================================== */

async function loadAcademicYears(){

    const { data, error } = await supabase

        .from("academic_years")

        .select("*")

        .order("academic_year");

    if(error){

        console.error(error);

        return;

    }

    academicYear.innerHTML="";

    data.forEach(year=>{

        academicYear.innerHTML += `

<option value="${year.academic_year}">

${year.academic_year}

</option>

`;

    });

}

/* ==========================================================
   LOAD EXAMS
========================================================== */

async function loadExams(){

    const { data,error } = await supabase

        .from("exams")

        .select("*")

        .eq("active",true)

        .order("display_order");

    if(error){

        console.error(error);

        return;

    }

    exams=data;

    examSelect.innerHTML=`
<option value="">
Select Examination
</option>`;

    data.forEach(exam=>{

        examSelect.innerHTML += `

<option value="${exam.id}">

${exam.exam_name}

</option>

`;

    });
/* ==========================================================
   LOAD LOGGED-IN TEACHER
========================================================== */

async function loadTeacherAssignments() {

    try {

        /* Logged-in Supabase user */

        const {

            data: { user },

            error: authError

        } = await supabase.auth.getUser();

        if (authError || !user) {

            alert("Login session expired.");

            window.location.href = "../login.html";

            return;

        }

        /* ERP User */

        const {

            data: profile,

            error: profileError

        } = await supabase

            .from("users")

            .select("teacher_id,full_name,role")

            .eq("auth_user_id", user.id)

            .single();

        if (profileError) {

            console.error(profileError);

            alert("Unable to load user profile.");

            return;

        }

        teacherName.textContent = profile.full_name;

        currentTeacher = profile.teacher_id;

        /* Teacher Assignments */

        const {

            data,

            error

        } = await supabase

            .from("vw_teacher_assignments")

            .select("*")

            .eq("teacher_id", currentTeacher)

            .eq("active", true);

        if (error) {

            console.error(error);

            return;

        }

        assignments = data || [];

        populateAssignments();

        updateDashboard();

    }

    catch (err) {

        console.error(err);

    }

}
  /* ==========================================================
   POPULATE CLASS & SUBJECT
========================================================== */

function populateAssignments() {

    classSelect.innerHTML =

        `<option value="">Select Class</option>`;

    subjectSelect.innerHTML =

        `<option value="">Select Subject</option>`;

    const classes = [

        ...new Map(

            assignments.map(a => [

                a.class_id,

                a

            ])

        ).values()

    ];

    classes.forEach(cls => {

        classSelect.innerHTML += `

<option value="${cls.class_id}">

${cls.class_name} ${cls.section}

</option>

`;

    });

    const subjects = [

        ...new Map(

            assignments.map(a => [

                a.subject_id,

                a

            ])

        ).values()

    ];

    subjects.forEach(subject => {

        subjectSelect.innerHTML += `

<option value="${subject.subject_id}">

${subject.subject_name}

</option>

`;

    });

}
  /* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard() {

    assignedClasses.textContent =

        new Set(

            assignments.map(

                a => a.class_id

            )

        ).size;

    assignedSubjects.textContent =

        new Set(

            assignments.map(

                a => a.subject_id

            )

        ).size;

}
}
/* ==========================================================
   CASCADING DROPDOWNS
========================================================== */

classSelect.addEventListener("change", loadSubjectsForClass);

subjectSelect.addEventListener("change", loadExamInformation);

loadStudentsBtn.addEventListener("click", loadStudents);
/* ==========================================================
   LOAD SUBJECTS FOR CLASS
========================================================== */

function loadSubjectsForClass() {

    subjectSelect.innerHTML = `
<option value="">Select Subject</option>`;

    const classId = classSelect.value;

    const subjects = assignments.filter(

        a => a.class_id === classId

    );

    subjects.forEach(subject => {

        subjectSelect.innerHTML += `

<option value="${subject.subject_id}">

${subject.subject_name}

</option>

`;

    });

}
/* ==========================================================
   LOAD MARKING SCHEME
========================================================== */

async function loadExamInformation() {

    if (

        !examSelect.value ||

        !subjectSelect.value

    ) return;

    const { data, error } = await supabase

        .from("marking_scheme")

        .select("*")

        .eq("exam_id", examSelect.value)

        .eq("subject_id", subjectSelect.value)

        .single();

    if (error) {

        console.error(error);

        return;

    }

    markingScheme = data;

    maxMarks.textContent =
        data.max_marks;

    passMarks.textContent =
        data.pass_marks;

    entryType.textContent =
        data.entry_type;

    examStatus.textContent =
        "OPEN";

}
/* ==========================================================
   LOAD STUDENTS
========================================================== */

async function loadStudents() {

    if (

        !classSelect.value ||

        !subjectSelect.value ||

        !examSelect.value

    ) {

        alert("Please complete all selections.");

        return;

    }

    marksTable.innerHTML = `

<tr>

<td colspan="8">

Loading Students...

</td>

</tr>

`;

    const { data, error } = await supabase

        .from("students")

        .select("*")

        .eq("class_id", classSelect.value)

        .eq("active", true)

        .order("roll_no");

    if (error) {

        console.error(error);

        return;

    }

students = data || [];

studentCount.textContent =
    students.length;

const existingMarks =
    await loadExistingMarks();

renderMarksGrid(existingMarks);

}
/* ==========================================================
   LOAD EXISTING MARKS
========================================================== */

async function loadExistingMarks() {

    const { data, error } = await supabase

        .from("marks")

        .select("*")

        .eq("exam_id", Number(examSelect.value))

        .eq("subject_id", subjectSelect.value);

    if (error) {

        console.error(error);

        return [];

    }

    return data || [];

}
/* ==========================================================
   RENDER GRID
========================================================== */

function renderMarksGrid() {

    marksTable.innerHTML = "";

    students.forEach(student => {

        marksTable.innerHTML += `

<tr
data-student="${student.id}">

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

${markingScheme.max_marks}

</td>

<td>

<input

type="number"

class="mark-input"

max="${markingScheme.max_marks}"

data-id="${student.id}"

>

</td>

<td class="grade-cell">

--

</td>

<td>

<input

type="text"

class="remark-input"

>

</td>

<td class="save-status">

⏳

</td>

</tr>

`;

    });

    attachInputEvents();

}
/* ==========================================================
   INPUT EVENTS
========================================================== */

function attachInputEvents() {

    document

        .querySelectorAll(".mark-input")

        .forEach(input => {

            input.addEventListener(

                "input",

                validateMark

            );

            input.addEventListener(

                "blur",

                autoSaveMark

            );

        });

}
/* ==========================================================
   VALIDATE MARK
========================================================== */

function validateMark(e) {

    const input = e.target;

    const value = Number(input.value);

    const max = Number(markingScheme.max_marks);

    const row = input.closest("tr");

    if (input.value === "") {

        row.classList.remove("row-error");

        row.querySelector(".grade-cell").textContent = "--";

        return;

    }

  /* ==========================================================
   CALCULATE GRADE
========================================================== */

function calculateGrade(mark, max) {

    const percentage = (mark / max) * 100;

    if (percentage >= 91) return "A1";

    if (percentage >= 81) return "A2";

    if (percentage >= 71) return "B1";

    if (percentage >= 61) return "B2";

    if (percentage >= 51) return "C1";

    if (percentage >= 41) return "C2";

    if (percentage >= 33) return "D";

    return "E";

}
 /* ==========================================================
   AUTO SAVE (UPSERT)
========================================================== */

async function autoSaveMark(e) {

    const input = e.target;

    if (input.value === "") return;

    const row = input.closest("tr");

    const studentId = row.dataset.student;

    const remarks = row.querySelector(".remark-input").value;

    const grade =
        row.querySelector(".grade-cell").textContent;

    const statusCell =
        row.querySelector(".save-status");

    statusCell.innerHTML = "💾 Saving...";

    const assignment = assignments.find(a =>

        a.class_id === classSelect.value &&

        a.subject_id === subjectSelect.value

    );

    if (!assignment) {

        statusCell.innerHTML = "❌";

        return;

    }

    /* Check Existing */

    const { data: existing } = await supabase

        .from("marks")

        .select("id")

        .eq("student_id", studentId)

        .eq("exam_id", Number(examSelect.value))

        .eq("subject_id", subjectSelect.value)

        .maybeSingle();

    const payload = {

        student_id: studentId,

        exam_id: Number(examSelect.value),

        subject_id: subjectSelect.value,

        teacher_assignment_id: assignment.id,

        marking_scheme_id: markingScheme.id,

        marks_obtained: Number(input.value),

        grade,

        remarks,

        entered_by: currentTeacher,

        status: "Draft"

    };

    let error;

    if (existing) {

        ({ error } = await supabase

            .from("marks")

            .update(payload)

            .eq("id", existing.id));

    }

    else {

        ({ error } = await supabase

            .from("marks")

            .insert(payload));

    }

    if (error) {

        console.error(error);

        row.classList.add("row-error");

        statusCell.innerHTML = "❌";

        return;

    }

    row.classList.remove("row-error");

    row.classList.add("row-saved");

    statusCell.innerHTML = "✅";

    updateProgress();

}
  /* ==========================================================
   UPDATE PROGRESS
========================================================== */

function updateProgress(){

    const saved=

        document.querySelectorAll(

            ".row-saved"

        ).length;

    const total=students.length;

    const percent=

        total===0

        ?0

        :Math.round(saved*100/total);

    completionPercent.textContent=

        percent+"%";

    progressText.textContent=

        `${saved} / ${total} Students`;

    progressFill.style.width=

        percent+"%";

}
  /* ==========================================================
   KEYBOARD NAVIGATION
========================================================== */

document.addEventListener("keydown",(e)=>{

    if(e.key!=="Enter") return;

    if(!e.target.classList.contains("mark-input")) return;

    e.preventDefault();

    const inputs=[

        ...document.querySelectorAll(".mark-input")

    ];

    const index=

        inputs.indexOf(e.target);

    if(index<inputs.length-1){

        inputs[index+1].focus();

    }

});
  

    if (value > max || value < 0) {

        row.classList.add("row-error");

        input.style.borderColor = "#dc2626";

        row.querySelector(".grade-cell").textContent = "--";

        return;

    }

    row.classList.remove("row-error");

    input.style.borderColor = "#22c55e";

    row.querySelector(".grade-cell").textContent =
        calculateGrade(value, max);

}
