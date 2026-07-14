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

        loadClasses(),

        loadSubjects()

    ]);

});

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
