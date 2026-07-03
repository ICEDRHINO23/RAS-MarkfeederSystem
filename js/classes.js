/* =========================================================
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
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initializeEvents();

    classForm.addEventListener("submit", saveClass);

    if (searchClass) {
        searchClass.addEventListener("input", searchClasses);
    }

    await loadTeachersDropdown();

    await loadClasses();

});
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
            <td colspan="7" style="text-align:center;padding:20px;">
                Loading Classes...
            </td>
        </tr>
    `;

    const { data, error } = await supabase
        .from("classes")
        .select(`
            *,
            teachers:class_teacher (
                teacher_name
            )
        `)
        .order("class_name", { ascending: true })
        .order("section", { ascending: true });

    if (error) {

        console.error("Load Classes Error:", error);

        classTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;color:red;padding:20px;">
                    Failed to load classes
                </td>
            </tr>
        `;

        return;
    }

    classes = data || [];

    console.log("Classes Loaded:", classes);

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
/* ==========================================================
   SEARCH CLASSES
========================================================== */

function searchClasses() {

    const keyword = searchClass.value
        .toLowerCase()
        .trim();

    const filtered = classes.filter(c =>

        (c.class_name || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (c.section || "")
            .toLowerCase()
            .includes(keyword)

        ||

        String(c.strength || "")
            .includes(keyword)

    );

    renderClasses(filtered);

}
/* ==========================================================
   SAVE / UPDATE CLASS
========================================================== */

async function saveClass(e) {

    e.preventDefault();

    const cls = {

        class_name:
            document.getElementById("class_name").value.trim(),

        section:
            document.getElementById("section").value.trim(),

        class_teacher:
            document.getElementById("class_teacher").value || null,

        strength:
            Number(document.getElementById("strength").value) || 0,

        active:
            document.getElementById("active").checked

    };

    const isEdit = !!editingClass;

    let error;

    if (isEdit) {

        ({ error } = await supabase

            .from("classes")

            .update(cls)

            .eq("id", editingClass));

    } else {

        ({ error } = await supabase

            .from("classes")

            .insert([cls]));

    }

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    alert(

        isEdit

            ? "Class Updated Successfully"

            : "Class Added Successfully"

    );

    editingClass = null;

    classForm.reset();

    closeClassModal();

    await loadClasses();

}
/* ==========================================================
   EDIT CLASS
========================================================== */

async function editClass(id) {

    console.log("Editing Class:", id);

    const cls = classes.find(c => c.id === id);

    if (!cls) return;

    editingClass = id;
      await loadTeachersDropdown();
   
    document.getElementById("modalTitle").textContent =
        "Edit Class";

    document.getElementById("class_name").value =
        cls.class_name;

    document.getElementById("section").value =
        cls.section;

    document.getElementById("strength").value =
        cls.strength;

    document.getElementById("active").checked =
        cls.active;

    document.getElementById("class_teacher").value =
        cls.class_teacher || "";

    classModal.classList.add("show");

}
/* ==========================================================
   DELETE CLASS
========================================================== */

async function deleteClass(id) {

    if (!confirm("Are you sure you want to delete this class?")) {
        return;
    }

    const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    await loadClasses();

}

/* ==========================================================
   LOAD TEACHERS DROPDOWN
========================================================== */

async function loadTeachersDropdown() {

    const teacherSelect = document.getElementById("class_teacher");

    // Clear existing options
    teacherSelect.innerHTML = `
        <option value="">Select Class Teacher</option>
    `;

    const { data, error } = await supabase
        .from("teachers")
        .select("id, teacher_name")
        .order("teacher_name", { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(teacher => {

        const option = document.createElement("option");

        option.value = teacher.id;
        option.textContent = teacher.teacher_name;

        teacherSelect.appendChild(option);

    });

}
/* ==========================================================
   GLOBAL FUNCTIONS
========================================================== */

window.editClass = editClass;
window.deleteClass = deleteClass;

