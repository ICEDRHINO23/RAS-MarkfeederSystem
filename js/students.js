import { supabase } from "../database/supabase.js";

// ==========================
// DOM
// ==========================

const table = document.getElementById("studentTable");

const totalStudents = document.getElementById("totalStudents");
const boysCount = document.getElementById("boysCount");
const girlsCount = document.getElementById("girlsCount");
const activeCount = document.getElementById("activeCount");

const classFilter = document.getElementById("filterClass");
const yearFilter = document.getElementById("filterYear");

// ==========================
// INITIALIZE
// ==========================

loadStudents();
loadClasses();
loadAcademicYears();

// ==========================
// LOAD STUDENTS
// ==========================

async function loadStudents() {

    const { data, error } = await supabase
        .from("vw_student_details")
        .select("*")
        .order("student_name");

    if (error) {

        console.error(error);
        return;

    }

    renderStudents(data);

}

// ==========================
// RENDER TABLE
// ==========================

function renderStudents(students) {

    table.innerHTML = "";

    let boys = 0;
    let girls = 0;
    let active = 0;

    students.forEach(student => {

        if (student.gender === "Male") boys++;
        if (student.gender === "Female") girls++;
        if (student.active) active++;

        table.innerHTML += `

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

<span class="${student.active ? "status-active":"status-inactive"}">

${student.active ? "Active":"Inactive"}

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

    totalStudents.textContent = students.length;
    boysCount.textContent = boys;
    girlsCount.textContent = girls;
    activeCount.textContent = active;

}

// ==========================
// LOAD CLASSES
// ==========================

async function loadClasses() {

    const { data } = await supabase

        .from("classes")

        .select("*")

        .order("grade");

    data?.forEach(c => {

        classFilter.innerHTML +=

`<option value="${c.id}">
${c.grade} - ${c.section}
</option>`;

    });

}

// ==========================
// LOAD YEARS
// ==========================

async function loadAcademicYears() {

    const { data } = await supabase

        .from("academic_years")

        .select("*")

        .order("academic_year");

    data?.forEach(y => {

        yearFilter.innerHTML +=

`<option value="${y.id}">
${y.academic_year}
</option>`;

    });

}
