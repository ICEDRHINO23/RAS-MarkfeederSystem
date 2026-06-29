import { supabase } from "../database/supabase.js";

// ==========================
// Elements
// ==========================

const modal = document.getElementById("studentModal");
const addBtn = document.getElementById("addStudentBtn");
const closeBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelStudent");
const form = document.getElementById("studentForm");

// ==========================
// Open Modal
// ==========================

addBtn.onclick = () => {
    modal.style.display = "flex";
};

// ==========================
// Close Modal
// ==========================

closeBtn.onclick = () => {
    modal.style.display = "none";
};

cancelBtn.onclick = () => {
    modal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

// ==========================
// Load Classes
// ==========================

async function loadClasses() {

    const { data } = await supabase
        .from("classes")
        .select("*")
        .eq("active", true)
        .order("class_name");

    const classSelect = document.getElementById("class_id");

    classSelect.innerHTML =
        '<option value="">Select Class</option>';

    data?.forEach(c => {

        classSelect.innerHTML += `
            <option value="${c.id}">
                ${c.class_name}
            </option>
        `;

    });

}

// ==========================
// Load Academic Years
// ==========================

async function loadYears() {

    const { data } = await supabase
        .from("academic_years")
        .select("*")
        .order("year_name");

    const yearSelect =
        document.getElementById("academic_year_id");

    yearSelect.innerHTML =
        '<option value="">Academic Year</option>';

    data?.forEach(y => {

        yearSelect.innerHTML += `
            <option value="${y.id}">
                ${y.year_name}
            </option>
        `;

    });

}

// ==========================
// Save Student
// ==========================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const student = {

        admission_no:
            document.getElementById("admission_no").value,

        roll_no:
            Number(document.getElementById("roll_no").value),

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
            document.getElementById("class_id").value,

        academic_year_id:
            document.getElementById("academic_year_id").value,

        active:
            document.getElementById("active").checked

    };

    const { error } = await supabase
        .from("students")
        .insert(student);

    if (error) {

        alert(error.message);

        return;

    }

    alert("Student Added Successfully");

    form.reset();

    modal.style.display = "none";

    location.reload();

});

// ==========================

loadClasses();

loadYears();
