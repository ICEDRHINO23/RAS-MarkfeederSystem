/* ==========================================================
   RAS MARKFEEDER ERP
   SUBJECTS.JS
========================================================== */

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

import {
    exportExcel
} from "../utils/excel.js";

import {
    search
} from "../utils/search.js";

import {
    filterData
} from "../utils/filters.js";

import {
    showLoader,
    showEmpty,
    showError
} from "../utils/loader.js";

import {
    required,
    clearErrors
} from "../utils/validation.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let subjects = [];

let editingSubject = null;

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const subjectTable =
    document.getElementById("subjectTable");

const subjectForm =
    document.getElementById("subjectForm");

const subjectModal =
    document.getElementById("subjectModal");

const addSubjectBtn =
    document.getElementById("addSubjectBtn");

const closeModalBtn =
    document.getElementById("closeModal");

const cancelSubject =
    document.getElementById("cancelSubject");

const searchSubject =
    document.getElementById("searchSubject");

const filterType =
    document.getElementById("filterType");

const exportSubjects =
    document.getElementById("exportSubjects");

/* Dashboard */

const totalSubjects =
    document.getElementById("totalSubjects");

const scholasticSubjects =
    document.getElementById("scholasticSubjects");

const coScholasticSubjects =
    document.getElementById("coScholasticSubjects");

const activeSubjects =
    document.getElementById("activeSubjects");

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initializeModal(subjectModal);

    initializeEvents();

    await loadSubjects();

});

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    addSubjectBtn.addEventListener("click", () => {

        editingSubject = null;

        subjectForm.reset();

        document.getElementById("active").checked = true;

        document.getElementById("modalTitle").textContent =
            "Add Subject";

        openModal(subjectModal);

    });

    closeModalBtn.addEventListener("click", () => {

        closeModal(subjectModal);

    });

    cancelSubject.addEventListener("click", () => {

        closeModal(subjectModal);

    });

    subjectForm.addEventListener(

        "submit",

        saveSubject

    );

    searchSubject.addEventListener(

        "input",

        searchSubjects

    );

    filterType.addEventListener(

        "change",

        applyFilters

    );

    exportSubjects.addEventListener(

        "click",

        exportSubjectList

    );

}
