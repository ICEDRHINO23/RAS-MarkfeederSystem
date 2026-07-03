/* ==========================================================
   RAS MARKFEEDER ERP
   EXAMS MODULE
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

import {
    showLoader,
    showEmpty,
    showError
} from "../utils/loader.js";

/* ==========================================================
   GLOBALS
========================================================== */

let exams = [];

let editingExam = null;

/* ==========================================================
   DOM
========================================================== */

const examTable =
    document.getElementById("examTable");

const examModal =
    document.getElementById("examModal");

const examForm =
    document.getElementById("examForm");

const addExamBtn =
    document.getElementById("addExamBtn");

const closeModalBtn =
    document.getElementById("closeModal");

const cancelExam =
    document.getElementById("cancelExam");

const searchExam =
    document.getElementById("searchExam");

const filterYear =
    document.getElementById("filterYear");

const filterStatus =
    document.getElementById("filterStatus");

const exportExams =
    document.getElementById("exportExams");

/* ==========================================================
   INIT
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        initializeModal(examModal);

        initializeEvents();

        await loadAcademicYears();

        await loadClasses();

        await loadExams();

    }

);
/* ==========================================================
   LOAD ACADEMIC YEARS
========================================================== */

async function loadAcademicYears(){

    const yearSelect =
        document.getElementById("academic_year");

    yearSelect.innerHTML="";

    filterYear.innerHTML=
        `<option value="">All Academic Years</option>`;

    const {data,error}=await supabase

        .from("academic_years")

        .select("*")

        .order("academic_year");

    if(error){

        console.error(error);

        return;

    }

    data.forEach(y=>{

        yearSelect.innerHTML+=`
<option value="${y.academic_year}">
${y.academic_year}
</option>`;

        filterYear.innerHTML+=`
<option value="${y.academic_year}">
${y.academic_year}
</option>`;

    });

}

/* ==========================================================
   LOAD CLASSES
========================================================== */

async function loadClasses(){

    const classSelect =
        document.getElementById("class_id");

    classSelect.innerHTML="";

    const {data,error}=await supabase

        .from("classes")

        .select("id,class_name,section")

        .eq("active",true)

        .order("class_name");

    if(error){

        console.error(error);

        return;

    }

    data.forEach(cls=>{

        classSelect.innerHTML+=`
<option value="${cls.id}">
${cls.class_name} ${cls.section}
</option>`;

    });

}

/* ==========================================================
   LOAD EXAMS
========================================================== */

async function loadExams(){

    showLoader(examTable,8);

    try{

        exams=await loadData("exams");

        updateDashboard();

        renderExams(exams);

    }

    catch(err){

        console.error(err);

        showError(

            examTable,

            err.message,

            8

        );

    }

}
/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    addExamBtn.addEventListener("click", () => {

        editingExam = null;

        examForm.reset();

        document.getElementById("active").checked = true;

        document.getElementById("modalTitle").textContent =
            "Add Exam";

        openModal(examModal);

    });

    closeModalBtn.addEventListener("click", () => {

        closeModal(examModal);

    });

    cancelExam.addEventListener("click", () => {

        closeModal(examModal);

    });

    examForm.addEventListener("submit", saveExam);

    searchExam.addEventListener("input", searchExams);

    filterYear.addEventListener("change", applyFilters);

    filterStatus.addEventListener("change", applyFilters);

    exportExams.addEventListener("click", exportExamList);

}

/* ==========================================================
   DASHBOARD
========================================================== */

function updateDashboard() {

    document.getElementById("totalExams").textContent =
        exams.length;

    document.getElementById("activeExams").textContent =
        exams.filter(e => e.active).length;

    document.getElementById("lockedExams").textContent =
        exams.filter(e => e.lock_marks).length;

    document.getElementById("completedExams").textContent =
        exams.filter(e => e.status === "Completed").length;

}

/* ==========================================================
   TABLE
========================================================== */

function renderExams(data) {

    if (!data.length) {

        showEmpty(examTable, 8);

        return;

    }

    examTable.innerHTML = "";

    data.forEach(exam => {

        examTable.innerHTML += `

<tr>

<td>${exam.exam_name}</td>

<td>${exam.academic_year}</td>

<td>${exam.class_id ?? "-"}</td>

<td>${exam.start_date ?? "-"}</td>

<td>${exam.end_date ?? "-"}</td>

<td>

<span class="status-${exam.status.toLowerCase()}">

${exam.status}

</span>

</td>

<td>

<span class="${exam.lock_marks ? "locked":"unlocked"}">

${exam.lock_marks ? "Locked":"Open"}

</span>

</td>

<td>

<div class="action-buttons">

<button
class="edit-btn"
onclick="editExam(${exam.id})">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-btn"
onclick="deleteExam(${exam.id})">

<i class="fa-solid fa-trash"></i>

</button>

</div>

</td>

</tr>

`;

    });

}

/* ==========================================================
   SAVE
========================================================== */

async function saveExam(e){

    e.preventDefault();

    const payload={

        exam_name:
        document.getElementById("exam_name").value,

        display_order:
        Number(document.getElementById("display_order").value)||0,

        academic_year:
        document.getElementById("academic_year").value,

        class_id:
        document.getElementById("class_id").value,

        start_date:
        document.getElementById("start_date").value,

        end_date:
        document.getElementById("end_date").value,

        status:
        document.getElementById("status").value,

        lock_marks:
        document.getElementById("lock_marks").checked,

        active:
        document.getElementById("active").checked

    };

    try{

        if(editingExam){

            await updateData(

                "exams",

                editingExam,

                payload

            );

            success("Exam Updated");

        }else{

            await insertData(

                "exams",

                payload

            );

            success("Exam Added");

        }

        editingExam=null;

        examForm.reset();

        closeModal(examModal);

        await loadExams();

    }

    catch(err){

        console.error(err);

        error(err.message);

    }

}

/* ==========================================================
   EDIT
========================================================== */

function editExam(id){

    const exam=

        exams.find(e=>e.id===id);

    if(!exam) return;

    editingExam=id;

    document.getElementById("modalTitle").textContent="Edit Exam";

    document.getElementById("exam_name").value=exam.exam_name;

    document.getElementById("display_order").value=exam.display_order;

    document.getElementById("academic_year").value=exam.academic_year;

    document.getElementById("class_id").value=exam.class_id;

    document.getElementById("start_date").value=exam.start_date||"";

    document.getElementById("end_date").value=exam.end_date||"";

    document.getElementById("status").value=exam.status;

    document.getElementById("lock_marks").checked=exam.lock_marks;

    document.getElementById("active").checked=exam.active;

    openModal(examModal);

}

/* ==========================================================
   DELETE
========================================================== */

async function deleteExam(id){

    if(!confirm("Delete this exam?")) return;

    await deleteData("exams",id);

    success("Exam Deleted");

    await loadExams();

}

/* ==========================================================
   SEARCH / FILTER
========================================================== */

function searchExams(){

    const filtered=search(

        exams,

        searchExam.value,

        [

            "exam_name",

            "academic_year",

            "status"

        ]

    );

    renderExams(filtered);

}

function applyFilters(){

    const filtered=exams.filter(e=>{

        return(

            (!filterYear.value ||

            e.academic_year===filterYear.value)

            &&

            (!filterStatus.value ||

            e.status===filterStatus.value)

        );

    });

    renderExams(filtered);

}

/* ==========================================================
   EXPORT
========================================================== */

function exportExamList(){

    exportExcel(

        exams,

        "Exams"

    );

}

/* ==========================================================
   GLOBAL
========================================================== */

window.editExam=editExam;

window.deleteExam=deleteExam;

console.log("Exams Module Loaded");
