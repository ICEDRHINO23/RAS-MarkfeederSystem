import { supabase } from "../database/supabase.js";
import { exportExcel } from "../utils/excel.js";
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
const form = document.getElementById("studentForm");
const exportBtn =
    document.getElementById("exportExcel");

exportBtn.addEventListener("click", () => {

    exportExcel(

        students,

        "Students"

    );

});
let students = [];
let editingStudentId = null;
// =============================
// MODAL EVENTS
// =============================

addBtn?.addEventListener("click", () => {

    editingStudentId = null;

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

// =============================
// INITIALIZE
// =============================

document.addEventListener("DOMContentLoaded", async () => {

    await loadClasses();
    await loadYears();
    await loadStudents();

    // Filter events
    document.getElementById("filterClass")
        .addEventListener("change", filterStudents);

    document.getElementById("filterYear")
        .addEventListener("change", filterStudents);
    
    document.getElementById("searchStudent")
    .addEventListener("input", filterStudents);
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
// =============================
// RENDER TABLE
// =============================
function renderTable(data = students) {

    tableBody.innerHTML = "";

  data.forEach(student => {

        tableBody.innerHTML += `
        <tr>

            <td>
           <img
    src="${student.photo_url || '../assets/images/default-user.png'}"
    class="student-photo"
    alt="Student"
    onerror="this.src='../assets/images/default-user.png'">
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

                <button
                    class="action-btn edit-btn"
                    data-id="${student.id}">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button
                    class="action-btn delete-btn"
                    data-id="${student.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>

            </td>

        </tr>
        `;

    });

}
tableBody.addEventListener("click", async (e) => {

    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {

        await editStudent(editBtn.dataset.id);

    }

    if (deleteBtn) {

        await deleteStudent(deleteBtn.dataset.id);

    }

});
// =============================
// FILTER STUDENTS
// =============================

function filterStudents() {

    const classId =
        document.getElementById("filterClass").value;

    const yearId =
        document.getElementById("filterYear").value;

    const keyword =
        document.getElementById("searchStudent")
        .value
        .toLowerCase()
        .trim();

    const filtered = students.filter(student => {

        const classMatch =
            !classId ||
            String(student.class_id) === classId;

        const yearMatch =
            !yearId ||
            String(student.academic_year_id) === yearId;

        const searchMatch =

            !keyword ||

            student.student_name
                ?.toLowerCase()
                .includes(keyword) ||

            student.admission_no
                ?.toLowerCase()
                .includes(keyword) ||

            String(student.roll_no)
                .includes(keyword) ||

            (student.mobile || "")
                .includes(keyword);

        return classMatch &&
               yearMatch &&
               searchMatch;

    });

    renderTable(filtered);

}
 // =============================
// LOAD CARDS
// =============================   


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
    const filterClass = document.getElementById("filterClass");

    const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("active", true)
        .order("grade")
        .order("section");

    if (error) {
        console.error(error);
        return;
    }

    classSelect.innerHTML =
        `<option value="">Select Class</option>`;

    filterClass.innerHTML =
        `<option value="">All Classes</option>`;

    data.forEach(cls => {

        const text =
            `Grade ${cls.grade} - ${cls.section}`;

        classSelect.innerHTML +=
            `<option value="${cls.id}">
                ${text}
            </option>`;

        filterClass.innerHTML +=
            `<option value="${cls.id}">
                ${text}
            </option>`;

    });

}

// ==========================
// Load Academic Years
// ==========================
async function loadYears() {

    console.log("Loading Academic Years...");

    const yearSelect = document.getElementById("academic_year_id");
    const filterYear = document.getElementById("filterYear");

    const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .order("id");

    if (error) {
        console.error(error);
        return;
    }

    // Modal Dropdown
    yearSelect.innerHTML = `<option value="">Academic Year</option>`;

    // Filter Dropdown
    filterYear.innerHTML = `<option value="">Academic Year</option>`;

    data.forEach(y => {

        const option = `
            <option value="${y.id}">
                ${y.academic_year}
            </option>
        `;

        yearSelect.innerHTML += option;
        filterYear.innerHTML += option;

    });

}
async function deleteStudent(id) {

    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Student deleted successfully.");

    await loadStudents();

}
async function editStudent(id) {

    editingStudentId = id;

    const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    document.getElementById("admission_no").value = student.admission_no;
    document.getElementById("roll_no").value = student.roll_no;
    document.getElementById("student_name").value = student.student_name;
    document.getElementById("gender").value = student.gender;
    document.getElementById("dob").value = student.dob || "";
    document.getElementById("father_name").value = student.father_name || "";
    document.getElementById("mother_name").value = student.mother_name || "";
    document.getElementById("mobile").value = student.mobile || "";
    document.getElementById("address").value = student.address || "";
    document.getElementById("class_id").value = student.class_id;
    document.getElementById("academic_year_id").value = student.academic_year_id;
    document.getElementById("active").checked = student.active;

    modal.classList.add("show");
}
// ==========================
// Save Student
// ==========================

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();
        const photoFile =
    document.getElementById("photo").files[0];



let photoUrl = "";

// Keep existing photo when editing
if (editingStudentId) {

    const existing = students.find(
        s => s.id === editingStudentId
    );

    photoUrl = existing?.photo_url || "";

}

// Upload new photo only if selected
if (photoFile) {

    const extension =
        photoFile.name.split(".").pop();

    const fileName =
        document.getElementById("admission_no").value +
        "." +
        extension;

    const { error: uploadError } =
        await supabase.storage
            .from("student-photos")
            .upload(fileName, photoFile, {
                upsert: true
            });

    if (uploadError) {

        alert(uploadError.message);

        return;

    }

    const { data } =
        supabase.storage
            .from("student-photos")
            .getPublicUrl(fileName);

    photoUrl = data.publicUrl;

}

        
        const student = {

            admission_no:
                document.getElementById("admission_no").value,

            roll_no:
                parseInt(document.getElementById("roll_no").value),

            student_name:
                document.getElementById("student_name").value,

                photo_url: photoUrl,

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
                parseInt(document.getElementById("academic_year_id").value),

            active:
                document.getElementById("active").checked

        };

      let error;

if (editingStudentId) {

    ({ error } = await supabase
        .from("students")
        .update(student)
        .eq("id", editingStudentId));

} else {

    ({ error } = await supabase
        .from("students")
        .insert([student]));

}

        if (error) {

            console.error(error);

            alert(error.message);

            return;

        }

alert(
    editingStudentId
        ? "Student Updated Successfully"
        : "Student Added Successfully"
);
form.reset();

editingStudentId = null;

modal.classList.remove("show");

await loadStudents();

});
}


