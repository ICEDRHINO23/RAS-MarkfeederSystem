/* ==========================================================
   RAS MARKFEEDER ERP
   RESULT PROCESSING
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let students = [];
let marks = [];
let results = [];

let academicYears = [];
let exams = [];
let classes = [];

/* ==========================================================
   DOM
========================================================== */

const academicYear =
document.getElementById("academicYear");

const exam =
document.getElementById("exam");

const classSelect =
document.getElementById("class");

const previewBtn =
document.getElementById("previewResults");

const processBtn =
document.getElementById("processResults");

const publishBtn =
document.getElementById("publishResults");

const recalculateBtn =
document.getElementById("recalculateResults");

const resultTable =
document.getElementById("resultTableBody");

/* ==========================================================
   DASHBOARD
========================================================== */

const totalStudents =
document.getElementById("totalStudents");

const processedStudents =
document.getElementById("processedStudents");

const pendingStudents =
document.getElementById("pendingStudents");

const publishedStudents =
document.getElementById("publishedStudents");

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initializeEvents();

    await Promise.all([

        loadAcademicYears(),

        loadExams(),

        loadClasses()

    ]);

});

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents(){

    previewBtn.addEventListener(

        "click",

        previewResults

    );

    processBtn.addEventListener(

        "click",

        processResults

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

    academicYears=data||[];

    academicYear.innerHTML=

    `<option value="">Academic Year</option>`;

    academicYears.forEach(year=>{

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

    exams=data||[];

    exam.innerHTML=

    `<option value="">Select Exam</option>`;

    exams.forEach(item=>{

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

    classes=data||[];

    classSelect.innerHTML=

    `<option value="">Select Class</option>`;

    classes.forEach(item=>{

        classSelect.innerHTML+=`

        <option value="${item.id}">

            Grade ${item.grade}-${item.section}

        </option>

        `;

    });

}
/* ==========================================================
   PREVIEW RESULTS
========================================================== */

async function previewResults() {

    if (
        !academicYear.value ||
        !exam.value ||
        !classSelect.value
    ) {
        alert("Select Academic Year, Exam and Class");
        return;
    }

    resultTable.innerHTML = `
        <tr>
            <td colspan="10" style="text-align:center;padding:40px;">
                Loading...
            </td>
        </tr>
    `;

    /* ---------- Load Students ---------- */

    const { data: studentData, error: studentError } =
        await supabase
            .from("vw_student_details")
            .select("*")
            .eq("class_id", classSelect.value)
            .eq("active", true)
            .order("roll_no");

    if (studentError) {
        console.error(studentError);
        return;
    }

    students = studentData || [];

    /* ---------- Load Marks ---------- */

    const studentIds = students.map(s => s.id);

    const { data: markData, error: markError } =
        await supabase
            .from("marks")
            .select("*")
            .eq("exam_id", exam.value)
            .in("student_id", studentIds);

    if (markError) {
        console.error(markError);
        return;
    }

    marks = markData || [];

    calculateResults();

}
/* ==========================================================
   GRADE
========================================================== */

function calculateGrade(percent){

    if(percent>=91) return "A1";

    if(percent>=81) return "A2";

    if(percent>=71) return "B1";

    if(percent>=61) return "B2";

    if(percent>=51) return "C1";

    if(percent>=41) return "C2";

    if(percent>=33) return "D";

    return "E";

}
/* ==========================================================
   CALCULATE RESULTS
========================================================== */

function calculateResults(){

    results=[];

    students.forEach(student=>{

        const studentMarks=

        marks.filter(

            m=>m.student_id===student.id

        );

        let total=0;

        let maximum=0;

        studentMarks.forEach(mark=>{

            total+=Number(

                mark.marks_obtained||0

            );

            maximum+=Number(

                mark.max_marks||0

            );

        });

        const percentage=

        maximum>0

        ? (total/maximum)*100

        :0;

        const grade=

        calculateGrade(percentage);

        const result=

        percentage>=33

        ?"Pass"

        :"Fail";

        results.push({

            student_id:student.id,

            roll_no:student.roll_no,

            admission_no:student.admission_no,

            student_name:student.student_name,

            total_marks:total,

            max_marks:maximum,

            percentage,

            overall_grade:grade,

            result

        });

    });

    renderResults();

}
/* ==========================================================
   RENDER RESULTS
========================================================== */

function renderResults(){

    resultTable.innerHTML="";

    results.forEach(item=>{

        resultTable.innerHTML+=`

<tr>

<td>${item.roll_no}</td>

<td>${item.admission_no}</td>

<td>${item.student_name}</td>

<td>${item.total_marks}</td>

<td>${item.max_marks}</td>

<td>${item.percentage.toFixed(2)}%</td>

<td>${item.overall_grade}</td>

<td>

<span class="status ${item.result==="Pass"
?"active":"inactive"}">

${item.result}

</span>

</td>

<td>-</td>

<td>

<span class="status pending">

Preview

</span>

</td>

</tr>

`;

    });

    updateDashboard();

}
/* ==========================================================
   DASHBOARD
========================================================== */

function updateDashboard(){

    totalStudents.textContent=

    results.length;

    processedStudents.textContent=0;

    pendingStudents.textContent=

    results.length;

    publishedStudents.textContent=0;

}
