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

    console.log("Initializing Events...");

    // Add Teacher Button
    if (addTeacherBtn) {

        addTeacherBtn.addEventListener("click", () => {

            console.log("Add Teacher Clicked");

            teacherForm.reset();

            editingTeacher = null;

            const title = document.getElementById("modalTitle");
            if (title) title.textContent = "Add Teacher";

            teacherModal.classList.add("show");

        });

    }

    // Close Button
    if (closeModal) {

        closeModal.addEventListener("click", closeTeacherModal);

    }

    // Cancel Button
    if (cancelTeacher) {

        cancelTeacher.addEventListener("click", closeTeacherModal);

    }

    // Click Outside Modal
    window.addEventListener("click", (e) => {

        if (e.target === teacherModal) {

            closeTeacherModal();

        }

    });
// Search
if (searchTeacher) {

   searchTeacher.addEventListener("input", filterTeachers);

}
   if (filterDepartment) {

    filterDepartment.addEventListener("change", filterTeachers);

}

if (filterDesignation) {

    filterDesignation.addEventListener("change", filterTeachers);

}

if (filterStatus) {

    filterStatus.addEventListener("change", filterTeachers);

}
    // Form Submit
    if (teacherForm) {

        teacherForm.addEventListener("submit", saveTeacher);

    }

}
/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeTeacherModal() {

    teacherModal.classList.remove("show");

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

loadFilters();

filterTeachers();


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
                    src="${teacher.photo_url || "../assets/images/default-user.png"}"
                    class="teacher-photo"
                    alt="Teacher">
            </td>

            <td>${teacher.employee_id || "-"}</td>

            <td>${teacher.teacher_name || "-"}</td>

            <td>${teacher.designation || "-"}</td>

            <td>${teacher.department || "-"}</td>

            <td>${teacher.qualification || "-"}</td>

            <td>${teacher.mobile || "-"}</td>

            <td>${teacher.email || "-"}</td>

            <td>

                <span class="${teacher.active ? "badge-success" : "badge-danger"}">

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

}/* ==========================================================
   LOAD FILTERS
========================================================== */

function loadFilters() {

    filterDepartment.innerHTML =
        `<option value="">All Departments</option>`;

    filterDesignation.innerHTML =
        `<option value="">All Designations</option>`;

    const departments =
        [...new Set(teachers.map(t => t.department).filter(Boolean))];

    departments.forEach(dept => {

        filterDepartment.innerHTML +=
            `<option value="${dept}">${dept}</option>`;

    });

    const designations =
        [...new Set(teachers.map(t => t.designation).filter(Boolean))];

    designations.forEach(designation => {

        filterDesignation.innerHTML +=
            `<option value="${designation}">${designation}</option>`;

    });

}
/* ==========================================================
   SEARCH + FILTER TEACHERS
========================================================== */

function filterTeachers() {

    const keyword =
        searchTeacher.value.toLowerCase().trim();

    const department =
        filterDepartment.value;

    const designation =
        filterDesignation.value;

    const status =
        filterStatus.value;

    const filtered = teachers.filter(teacher => {

        // Search
        const matchSearch =

            (teacher.teacher_name || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (teacher.employee_id || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (teacher.mobile || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (teacher.email || "")
                .toLowerCase()
                .includes(keyword);

        // Department
        const matchDepartment =
            !department ||
            teacher.department === department;

        // Designation
        const matchDesignation =
            !designation ||
            teacher.designation === designation;

        // Status
        const matchStatus =
            status === "" ||
            String(teacher.active) === status;

        return (
            matchSearch &&
            matchDepartment &&
            matchDesignation &&
            matchStatus
        );

    });

    renderTeachers(filtered);

}/* ==========================================================
   EDIT TEACHER
========================================================== */

async function editTeacher(id) {

    const teacher = teachers.find(t => t.id == id);

    if (!teacher) return;

    editingTeacher = id;
      console.log("Editing Teacher ID:", editingTeacher);
   
    document.getElementById("modalTitle").textContent = "Edit Teacher";

    document.getElementById("employee_id").value =
        teacher.employee_id || "";

    document.getElementById("teacher_name").value =
        teacher.teacher_name || "";

    document.getElementById("gender").value =
        teacher.gender || "";

    document.getElementById("mobile").value =
        teacher.mobile || "";

    document.getElementById("email").value =
        teacher.email || "";

    document.getElementById("department").value =
        teacher.department || "";

    document.getElementById("designation").value =
        teacher.designation || "";

    document.getElementById("qualification").value =
        teacher.qualification || "";

    document.getElementById("joining_date").value =
        teacher.joining_date || "";

    document.getElementById("active").checked =
        teacher.active;

    teacherModal.classList.add("show");

   document.getElementById("dob").value =
    teacher.dob || "";

   document.getElementById("address").value =
    teacher.address || "";
}
   
/* ==========================================================
   SAVE / UPDATE TEACHER
========================================================== */

async function saveTeacher(e) {

    e.preventDefault();

    let photoUrl = null;

    const photoFile =
        document.getElementById("photo").files[0];
         console.log("Photo Input:", document.getElementById("photo"));

         console.log("Selected File:", photoFile);
         
   /* ===========================================
       UPLOAD IMAGE
    =========================================== */

    if (photoFile) {

      const fileExt = photoFile.name.split(".").pop();

   const fileName =
`${crypto.randomUUID()}.${fileExt}`;

      const { data: uploadData, error: uploadError } =
      await supabase.storage
      .from("teacher-photos")
      .upload(fileName, photoFile, {

    cacheControl: "3600",

    upsert: true

});

        if (uploadError) {

            alert(uploadError.message);

            console.error(uploadError);

            return;

        }

const { data: publicUrlData } = supabase.storage
    .from("teacher-photos")
    .getPublicUrl(fileName);

photoUrl = publicUrlData.publicUrl;

console.log("Public URL:", photoUrl);

console.log("Uploaded Image:", photoUrl);
    }

    /* ===========================================
       KEEP OLD PHOTO WHILE EDITING
    =========================================== */

    if (editingTeacher && !photoUrl) {

        const oldTeacher =
            teachers.find(t => t.id === editingTeacher);

        if (oldTeacher) {

            photoUrl = oldTeacher.photo_url;

        }

    }

    /* ===========================================
       CREATE OBJECT
    =========================================== */

    const teacher = {

        employee_id:
            document.getElementById("employee_id").value.trim(),

        teacher_name:
            document.getElementById("teacher_name").value.trim(),

        gender:
            document.getElementById("gender").value,
      dob:
            document.getElementById("dob").value,

      address:
            document.getElementById("address").value.trim(),
        mobile:
            document.getElementById("mobile").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        department:
            document.getElementById("department").value,

        designation:
            document.getElementById("designation").value,

        qualification:
            document.getElementById("qualification").value.trim(),

        joining_date:
            document.getElementById("joining_date").value,

        active:
            document.getElementById("active").checked,

        photo_url:
            photoUrl

    };

    let error;

    /* ===========================================
       UPDATE
    =========================================== */

    if (editingTeacher) {

        ({ error } = await supabase

            .from("teachers")

            .update(teacher)

            .eq("id", editingTeacher));

    }

    /* ===========================================
       INSERT
    =========================================== */

    else {

        ({ error } = await supabase

            .from("teachers")

            .insert([teacher]));

    }

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    alert(

        editingTeacher

            ? "Teacher Updated Successfully"

            : "Teacher Added Successfully"

    );

    editingTeacher = null;

    teacherForm.reset();

    closeTeacherModal();

    await loadTeachers();

}
async function deleteTeacher(id) {

    if (!confirm("Delete this teacher?")) return;

    const { error } = await supabase
        .from("teachers")
        .delete()
        .eq("id", id);

    if (error) {

        alert(error.message);
        return;

    }

    await loadTeachers();

}
window.editTeacher = editTeacher;
window.deleteTeacher = deleteTeacher;
