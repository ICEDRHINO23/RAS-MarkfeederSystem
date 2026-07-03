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
/* ==========================================================
   LOAD CLASSES
========================================================== */

async function loadClasses() {

    classTable.innerHTML = `

        <tr>

            <td colspan="7">

                Loading Classes...

            </td>

        </tr>

    `;
const { data, error } = await supabase

    .from("classes")

    .select(`
        *,
        teachers (
            teacher_name
        )
    `)

    .order("class_name");

    if (error) {

        console.error(error);

        classTable.innerHTML = `

            <tr>

                <td colspan="7">

                    Failed to load classes

                </td>

            </tr>

        `;

        return;

    }

    classes = data || [];

    updateDashboard();

    renderClasses(classes);

    loadFilters();

}

/* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard() {

    totalClasses.textContent = classes.length;

    totalSections.textContent =
        [...new Set(classes.map(c => c.section))].length;

    totalStudents.textContent =
        classes.reduce((sum, c) => sum + (c.strength || 0), 0);

    activeClasses.textContent =
        classes.filter(c => c.active).length;

}
/* ==========================================================
   RENDER CLASSES TABLE
========================================================== */

function renderClasses(data) {

    if (data.length === 0) {

        classTable.innerHTML = `

            <tr>

                <td colspan="7" style="text-align:center;padding:30px;">

                    No Classes Found

                </td>

            </tr>

        `;

        return;

    }

    classTable.innerHTML = "";

    data.forEach(cls => {

        classTable.innerHTML += `

            <tr>

                <td>${cls.class_name}</td>

                <td>${cls.section}</td>

                <td>${cls.class_name}</td>

                <td>${cls.teachers?.teacher_name || "-"}</td>

                <td>${cls.strength || 0}</td>

                <td>

                    <span class="${cls.active ? "badge-success" : "badge-danger"}">

                        ${cls.active ? "Active" : "Inactive"}

                    </span>

                </td>

                <td>

                    <div class="action-buttons">

                        <button

                            class="edit-btn"

                            onclick="editClass('${cls.id}')">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button

                            class="delete-btn"

                            onclick="deleteClass('${cls.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });

}
/* ==========================================================
   LOAD FILTERS
========================================================== */

function loadFilters() {

    filterClass.innerHTML =
        `<option value="">All Classes</option>`;

    filterSection.innerHTML =
        `<option value="">All Sections</option>`;

    const classList = [
        ...new Set(
            classes.map(c => c.class_name).filter(Boolean)
        )
    ];

    classList.forEach(cls => {

        filterClass.innerHTML +=
            `<option value="${cls}">${cls}</option>`;

    });

    const sectionList = [
        ...new Set(
            classes.map(c => c.section).filter(Boolean)
        )
    ];

    sectionList.forEach(sec => {

        filterSection.innerHTML +=
            `<option value="${sec}">${sec}</option>`;

    });

}
