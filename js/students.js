import { supabase } from "../database/supabase.js";

// =============================
// DOM ELEMENTS
// =============================

const tableBody = document.getElementById("studentTable");

const totalStudents = document.getElementById("totalStudents");
const boysCount = document.getElementById("boysCount");
const girlsCount = document.getElementById("girlsCount");
const activeCount = document.getElementById("activeCount");

const modal = document.getElementById("studentModal");
const addBtn = document.getElementById("addStudentBtn");
const closeBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelStudent");
// =============================
// MODAL EVENTS
// =============================

addBtn?.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";
});

cancelBtn?.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
const form = document.getElementById("studentForm");

let students = [];

// =============================
// INITIALIZE
// =============================

document.addEventListener("DOMContentLoaded", async () => {

    await loadClasses();
    await loadYears();
    await loadStudents();

});

// =============================
// LOAD STUDENTS
// =============================

async function loadStudents() {

    const { data, error } = await supabase
        .from("vw_student_details")
        .select("*")
        .order("student_name");

    if (error) {
        console.error(error);
        return;
    }

    students = data;

    renderTable();
    loadCards();

}

function renderTable() {

    tableBody.innerHTML = "";

    students.forEach(student => {

        tableBody.innerHTML += `
        <tr>

            <td>
                <img
                    src="${student.photo_url || '../assets/images/default-user.png'}"
                    class="student-photo">
            </td>

            <td>${student.admission_no}</td>

            <td>${student.roll_no}</td>

            <td>${student.student_name}</td>

            <td>${student.gender}</td>

            <td>${student.class_grade} - ${student.section}</td>

            <td>${student.academic_year}</td>

            <td>${student.mobile ?? ""}</td>

            <td>
                <span class="${student.active ? "status-active" : "status-inactive"}">
                    ${student.active ? "Active" : "Inactive"}
                </span>
            </td>

            <td>

                <button class="action-btn edit-btn">
                    Edit
                </button>

                <button class="action-btn delete-btn">
                    Delete
                </button>

            </td>

        </tr>
        `;

    });

}
function loadCards() {

    totalStudents.textContent = students.length;

    boysCount.textContent =
        students.filter(s => s.gender === "Male").length;

    girlsCount.textContent =
        students.filter(s => s.gender === "Female").length;

    activeCount.textContent =
        students.filter(s => s.active).length;

}
// ==========================
// Load Classes
// ==========================

async function loadClasses() {

    console.log("Loading classes...");

    const classSelect = document.getElementById("class_id");

    const { data, error } = await supabase
        .from("classes")
        .select("*");

    console.log(data);
    console.log(error);

    if (error) return;

    classSelect.innerHTML = `<option value="">Select Class</option>`;

    data.forEach(c => {

        console.log(c);

        classSelect.innerHTML += `
            <option value="${c.id}">
                Grade ${c.grade} - ${c.section}
            </option>
        `;

    });

}

}

// ==========================
// Load Academic Years
// ==========================

async function loadYears() {

    console.log("Loading years...");

    const yearSelect = document.getElementById("academic_year_id");

    const { data, error } = await supabase
        .from("academic_years")
        .select("*");

    console.log(data);
    console.log(error);

    if (error) return;

    yearSelect.innerHTML = `<option value="">Academic Year</option>`;

    data.forEach(y => {

        console.log(y);

        yearSelect.innerHTML += `
            <option value="${y.id}">
                ${y.academic_year}
            </option>
        `;

    });

}
// ==========================
// Save Student
// ==========================

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const student = {

            admission_no:
                document.getElementById("admission_no").value,

            roll_no:
                parseInt(document.getElementById("roll_no").value),

            student_name:
                document.getElementById("student_name").value,

            gender:
                document.getElementById("gender").value,

            dob:
                document.getElementById("dob").value,

            father_name:
                document.getElementById("father_name").value,

            mother_name:
                document.getElementById("mother_name").value,

            mobile:
                document.getElementById("mobile").value,

            address:
                document.getElementById("address").value,

            class_id:
                parseInt(document.getElementById("class_id").value),

            academic_year_id:
                parseInt(document.getElementById("academic_year_id").value),

            active:
                document.getElementById("active").checked

        };

        const { error } = await supabase
            .from("students")
            .insert([student]);

        if (error) {

            console.error(error);

            alert(error.message);

            return;

        }

        alert("Student Added Successfully");

        form.reset();

        modal.style.display = "none";

      await loadStudents();
    });

}
