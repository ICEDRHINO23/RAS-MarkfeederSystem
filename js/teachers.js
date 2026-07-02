/* ==========================================================
   RAS MARKFEEDER ERP
   TEACHERS.JS
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let teachers = [];

let editingTeacher = null;

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const teacherTable =
    document.getElementById("teacherTable");

const teacherForm =
    document.getElementById("teacherForm");

const teacherModal =
    document.getElementById("teacherModal");

const addTeacherBtn =
    document.getElementById("addTeacherBtn");

const closeModal =
    document.getElementById("closeModal");

const cancelTeacher =
    document.getElementById("cancelTeacher");

const searchTeacher =
    document.getElementById("searchTeacher");

const filterDepartment =
    document.getElementById("filterDepartment");

const filterDesignation =
    document.getElementById("filterDesignation");

const filterStatus =
    document.getElementById("filterStatus");

const exportTeachers =
    document.getElementById("exportTeachers");

/* Dashboard */

const totalTeachers =
    document.getElementById("totalTeachers");

const maleTeachers =
    document.getElementById("maleTeachers");

const femaleTeachers =
    document.getElementById("femaleTeachers");

const activeTeachers =
    document.getElementById("activeTeachers");
/* ==========================================================
   INITIALIZE PAGE
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initializeEvents();

    await loadTeachers();

});


/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    // Open Modal

    addTeacherBtn.addEventListener("click", () => {

        teacherForm.reset();

        editingTeacher = null;

        document.getElementById("modalTitle").textContent =
            "Add Teacher";

        teacherModal.style.display = "flex";

    });

    // Close Button

    closeModal.addEventListener("click", closeTeacherModal);

    // Cancel Button

    cancelTeacher.addEventListener("click", closeTeacherModal);

    // Click Outside

    window.addEventListener("click", (e) => {

        if (e.target === teacherModal) {

            closeTeacherModal();

        }

    });

}


/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeTeacherModal() {

    teacherModal.style.display = "none";

}
/* ==========================================================
   LOAD TEACHERS
========================================================== */

async function loadTeachers() {

    teacherTable.innerHTML = `

        <tr>

            <td colspan="10">

                Loading Teachers...

            </td>

        </tr>

    `;

    const { data, error } = await supabase

        .from("teachers")

        .select("*")

        .order("teacher_name");

    if (error) {

        console.error(error);

        teacherTable.innerHTML = `

            <tr>

                <td colspan="10">

                    Failed to load teachers

                </td>

            </tr>

        `;

        return;

    }

    teachers = data || [];

    updateDashboard();

    renderTeachers(teachers);

    loadFilters();

}
/* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard() {

    totalTeachers.textContent = teachers.length;

    maleTeachers.textContent =
        teachers.filter(t => t.gender === "Male").length;

    femaleTeachers.textContent =
        teachers.filter(t => t.gender === "Female").length;

    activeTeachers.textContent =
        teachers.filter(t => t.active).length;

}
/* ==========================================================
   RENDER TEACHERS TABLE
========================================================== */

function renderTeachers(data) {

    if (data.length === 0) {

        teacherTable.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;padding:30px;">
                    No Teachers Found
                </td>
            </tr>
        `;

        return;
    }

    teacherTable.innerHTML = "";

    data.forEach((teacher) => {

        teacherTable.innerHTML += `

        <tr>

            <td>

                <img
                    src="${teacher.photo_url || '../assets/images/default-user.png'}"
                    class="teacher-photo"
                    alt="Teacher">

            </td>

            <td>${teacher.employee_id}</td>

            <td>${teacher.teacher_name}</td>

            <td>${teacher.gender}</td>

            <td>${teacher.department || "-"}</td>

            <td>${teacher.designation}</td>

            <td>${teacher.mobile}</td>

            <td>${teacher.joining_date}</td>

            <td>

                <span class="${teacher.active ? 'badge-success' : 'badge-danger'}">

                    ${teacher.active ? "Active" : "Inactive"}

                </span>

            </td>

            <td>

                <button
                    class="btn btn-sm btn-primary"
                    onclick="editTeacher('${teacher.id}')">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="btn btn-sm btn-danger"
                    onclick="deleteTeacher('${teacher.id}')">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}
