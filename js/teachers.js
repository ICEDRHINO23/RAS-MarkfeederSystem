import { supabase } from "../database/supabase.js";

// =====================================
// DOM ELEMENTS
// =====================================

const tableBody = document.getElementById("teacherTable");

const totalTeachers = document.getElementById("totalTeachers");
const maleTeachers = document.getElementById("maleTeachers");
const femaleTeachers = document.getElementById("femaleTeachers");
const activeTeachers = document.getElementById("activeTeachers");

const modal = document.getElementById("teacherModal");

const addBtn = document.getElementById("addTeacherBtn");

const closeBtn = document.getElementById("closeModal");

const cancelBtn = document.getElementById("cancelTeacher");

const form = document.getElementById("teacherForm");

let teachers = [];

let editingTeacherId = null;


// =====================================
// INITIALIZE
// =====================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadTeachers();

});


// =====================================
// MODAL EVENTS
// =====================================

addBtn?.addEventListener("click", () => {

    editingTeacherId = null;

    form.reset();

    modal.classList.add("show");

});

closeBtn?.addEventListener("click", () => {

    modal.classList.remove("show");

});

cancelBtn?.addEventListener("click", () => {

    modal.classList.remove("show");

});

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.classList.remove("show");

    }

});


// =====================================
// LOAD TEACHERS
// =====================================

async function loadTeachers() {

    const { data, error } = await supabase

        .from("teachers")

        .select("*")

        .order("teacher_name");

    if (error) {

        console.error(error);

        return;

    }

    teachers = data;

    renderTable(teachers);

    loadCards();

}
// =====================================
// DASHBOARD CARDS
// =====================================

function loadCards() {

    totalTeachers.textContent = teachers.length;

    maleTeachers.textContent =
        teachers.filter(t => t.gender === "Male").length;

    femaleTeachers.textContent =
        teachers.filter(t => t.gender === "Female").length;

    activeTeachers.textContent =
        teachers.filter(t => t.active).length;

}
// =====================================
// RENDER TABLE
// =====================================

function renderTable(data = teachers) {

    tableBody.innerHTML = "";

    data.forEach(teacher => {

        tableBody.innerHTML += `

        <tr>

            <td>

                <img
                    src="${teacher.photo_url || '../assets/images/default-user.png'}"
                    class="teacher-photo">

            </td>

            <td>${teacher.teacher_code ?? ""}</td>

            <td>${teacher.employee_id ?? ""}</td>

            <td>${teacher.teacher_name}</td>

            <td>${teacher.gender}</td>

            <td>${teacher.department ?? ""}</td>

            <td>${teacher.designation ?? ""}</td>

            <td>${teacher.mobile ?? ""}</td>

            <td>${teacher.email ?? ""}</td>

            <td>

                <span class="${teacher.active ? 'status-active' : 'status-inactive'}">

                    ${teacher.active ? "Active" : "Inactive"}

                </span>

            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    data-id="${teacher.id}"
                    title="Edit">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="action-btn delete-btn"
                    data-id="${teacher.id}"
                    title="Delete">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}
// =====================================
// TABLE EVENTS
// =====================================

tableBody.addEventListener("click", async (e) => {

    const editBtn = e.target.closest(".edit-btn");

    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {

        await editTeacher(editBtn.dataset.id);

    }

    if (deleteBtn) {

        await deleteTeacher(deleteBtn.dataset.id);

    }

});
// =====================================
// DELETE TEACHER
// =====================================

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

    alert("Teacher deleted successfully.");

    await loadTeachers();

}
// =====================================
// EDIT TEACHER
// =====================================

async function editTeacher(id) {

    editingTeacherId = id;

    const teacher =
        teachers.find(t => String(t.id) === String(id));

    if (!teacher) return;

    document.getElementById("teacher_code").value =
        teacher.teacher_code || "";

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

    document.getElementById("active").checked =
        teacher.active;

    modal.classList.add("show");

}// =====================================
// SAVE TEACHER
// =====================================

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        let photoUrl = "";

        // ===============================
        // Upload Photo
        // ===============================

        const fileInput = document.getElementById("photo");

        const file = fileInput.files[0];

        if (file) {

            const fileName =
                `${Date.now()}_${file.name}`;

            const { error: uploadError } =
                await supabase.storage
                    .from("teacher-photos")
                    .upload(fileName, file, {
                        upsert: true
                    });

            if (uploadError) {

                alert(uploadError.message);

                return;

            }

            const { data } =
                supabase.storage
                    .from("teacher-photos")
                    .getPublicUrl(fileName);

            photoUrl = data.publicUrl;

        }

        const teacher = {

            teacher_code:
                document.getElementById("teacher_code").value,

            employee_id:
                document.getElementById("employee_id").value,

            teacher_name:
                document.getElementById("teacher_name").value,

            gender:
                document.getElementById("gender").value,

            dob:
                document.getElementById("dob").value,

            qualification:
                document.getElementById("qualification").value,

            department:
                document.getElementById("department").value,

            designation:
                document.getElementById("designation").value,

            joining_date:
                document.getElementById("joining_date").value,

            email:
                document.getElementById("email").value,

            mobile:
                document.getElementById("mobile").value,

            address:
                document.getElementById("address").value,

            username:
                document.getElementById("username").value,

            password:
                document.getElementById("password").value,

            active:
                document.getElementById("active").checked

        };

        if (photoUrl !== "") {

            teacher.photo_url = photoUrl;

        }

        let error;

        if (editingTeacherId) {

            ({ error } = await supabase
                .from("teachers")
                .update(teacher)
                .eq("id", editingTeacherId));

        } else {

            ({ error } = await supabase
                .from("teachers")
                .insert([teacher]));

        }

        if (error) {

            alert(error.message);

            return;

        }

        alert(editingTeacherId
            ? "Teacher Updated Successfully"
            : "Teacher Added Successfully");

        form.reset();

        editingTeacherId = null;

        modal.classList.remove("show");

        await loadTeachers();

    });

}
// =====================================
// SEARCH
// =====================================

document
    .getElementById("searchTeacher")
    ?.addEventListener("keyup", filterTeachers);

function filterTeachers() {

    const keyword =
        document
            .getElementById("searchTeacher")
            .value
            .toLowerCase();

    const filtered = teachers.filter(t =>

        (t.teacher_name || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (t.teacher_code || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (t.employee_id || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (t.mobile || "")
            .includes(keyword)

    );

    renderTable(filtered);
function applyFilters() {

    const department =
        document.getElementById("filterDepartment").value;

    const designation =
        document.getElementById("filterDesignation").value;

    const status =
        document.getElementById("filterStatus").value;

    const filtered = teachers.filter(t => {

        const departmentMatch =
            !department ||
            t.department === department;

        const designationMatch =
            !designation ||
            t.designation === designation;

        const statusMatch =
            status === "" ||
            String(t.active) === status;

        return departmentMatch &&
               designationMatch &&
               statusMatch;

    });

    renderTable(filtered);

}
}
document
    .getElementById("filterDepartment")
    ?.addEventListener("change", applyFilters);
document
    .getElementById("filterDesignation")
    ?.addEventListener("change", applyFilters);
document
    .getElementById("filterStatus")
    ?.addEventListener("change", applyFilters);

