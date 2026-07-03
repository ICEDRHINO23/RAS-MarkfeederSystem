/* ==========================================================
   RAS MARKFEEDER ERP
   CLASSES.JS
   PART 1 - INITIALIZATION
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

const classTable = document.getElementById("classTable");
const classForm = document.getElementById("classForm");
const classModal = document.getElementById("classModal");

const addClassBtn = document.getElementById("addClassBtn");
const closeModal = document.getElementById("closeModal");
const cancelClass = document.getElementById("cancelClass");

const searchClass = document.getElementById("searchClass");
const filterClass = document.getElementById("filterClass");
const filterSection = document.getElementById("filterSection");
const filterStatus = document.getElementById("filterStatus");
const exportClasses = document.getElementById("exportClasses");

/* Dashboard */

const totalClasses = document.getElementById("totalClasses");
const totalSections = document.getElementById("totalSections");
const totalStudents = document.getElementById("totalStudents");
const activeClasses = document.getElementById("activeClasses");

/* ==========================================================
   PAGE INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initializeEvents();

    await loadTeachersDropdown();

    await loadClasses();

});

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    if (addClassBtn) {

        addClassBtn.addEventListener("click", openAddModal);

    }

    if (closeModal) {

        closeModal.addEventListener("click", closeClassModal);

    }

    if (cancelClass) {

        cancelClass.addEventListener("click", closeClassModal);

    }

    window.addEventListener("click", (e) => {

        if (e.target === classModal) {

            closeClassModal();

        }

    });

}

/* ==========================================================
   OPEN ADD MODAL
========================================================== */

function openAddModal() {

    editingClass = null;

    classForm.reset();

    document.getElementById("modalTitle").textContent =
        "Add Class";

    classModal.classList.add("show");

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
            <td colspan="6" style="text-align:center;padding:20px;">
                Loading...
            </td>
        </tr>
    `;

    const { data, error } = await supabase
        .from("classes")
        .select(`
            *,
            teachers:class_teacher(
                teacher_name
            )
        `)
        .order("class_name")
        .order("section");

    if (error) {

        console.error(error);

        classTable.innerHTML = `
            <tr>
                <td colspan="6">
                    Failed to load classes
                </td>
            </tr>
        `;

        return;

    }

    classes = data || [];

    console.log("Classes Loaded", classes);

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
        classes.reduce(
            (sum, c) => sum + (c.strength || 0),
            0
        );

    activeClasses.textContent =
        classes.filter(c => c.active).length;

}
/* ==========================================================
   PART 2
   RENDER TABLE
========================================================== */

function renderClasses(data) {

    if (!data.length) {

        classTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:30px;">
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

    const classNames =
        [...new Set(classes.map(c => c.class_name))];

    classNames.forEach(c => {

        filterClass.innerHTML +=
            `<option value="${c}">${c}</option>`;

    });

    const sections =
        [...new Set(classes.map(c => c.section))];

    sections.forEach(s => {

        filterSection.innerHTML +=
            `<option value="${s}">${s}</option>`;

    });

}

/* ==========================================================
   SEARCH
========================================================== */

function searchClasses() {

    const keyword =
        searchClass.value.toLowerCase().trim();

    const filtered = classes.filter(c =>

        (c.class_name || "")
        .toLowerCase()
        .includes(keyword)

        ||

        (c.section || "")
        .toLowerCase()
        .includes(keyword)

        ||

        (c.teachers?.teacher_name || "")
        .toLowerCase()
        .includes(keyword)

    );

    renderClasses(filtered);

}

/* ==========================================================
   FILTERS
========================================================== */

function applyFilters() {

    let filtered = [...classes];

    if (filterClass.value) {

        filtered =
            filtered.filter(c =>
                c.class_name === filterClass.value);

    }

    if (filterSection.value) {

        filtered =
            filtered.filter(c =>
                c.section === filterSection.value);

    }

    if (filterStatus.value !== "") {

        filtered =
            filtered.filter(c =>
                String(c.active) === filterStatus.value);

    }

    renderClasses(filtered);

}

/* ==========================================================
   FILTER EVENTS
========================================================== */

if (searchClass) {

    searchClass.addEventListener(
        "input",
        searchClasses
    );

}

if (filterClass) {

    filterClass.addEventListener(
        "change",
        applyFilters
    );

}

if (filterSection) {

    filterSection.addEventListener(
        "change",
        applyFilters
    );

}

if (filterStatus) {

    filterStatus.addEventListener(
        "change",
        applyFilters
    );

}
