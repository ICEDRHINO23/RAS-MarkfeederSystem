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
