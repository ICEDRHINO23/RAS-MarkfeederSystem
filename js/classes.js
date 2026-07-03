/* ==========================================================
   RAS MARKFEEDER ERP
   CLASSES.JS
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let classes = [];

let editingClass = null;

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const classTable =
    document.getElementById("classTable");

const classForm =
    document.getElementById("classForm");

const classModal =
    document.getElementById("classModal");

const addClassBtn =
    document.getElementById("addClassBtn");

const closeModal =
    document.getElementById("closeModal");

const cancelClass =
    document.getElementById("cancelClass");

const searchClass =
    document.getElementById("searchClass");

const filterClass =
    document.getElementById("filterClass");

const filterSection =
    document.getElementById("filterSection");

const filterStatus =
    document.getElementById("filterStatus");

const exportClasses =
    document.getElementById("exportClasses");

/* ==========================================================
   DASHBOARD
========================================================== */

const totalClasses =
    document.getElementById("totalClasses");

const totalSections =
    document.getElementById("totalSections");

const totalStudents =
    document.getElementById("totalStudents");

const activeClasses =
    document.getElementById("activeClasses");

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initializeEvents();

    await loadClasses();

});

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    // Add Class
    addClassBtn.addEventListener("click", () => {

        classForm.reset();

        editingClass = null;

        document.getElementById("modalTitle").textContent =
            "Add Class";

        classModal.classList.add("show");

    });

    // Close
    closeModal.addEventListener("click", closeClassModal);

    cancelClass.addEventListener("click", closeClassModal);

    // Outside Click
    window.addEventListener("click", (e) => {

        if (e.target === classModal) {

            closeClassModal();

        }

    });

}

/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeClassModal() {

    classModal.classList.remove("show");

}
