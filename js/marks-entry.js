/* ==========================================================
   RAS MARKFEEDER ERP
   MARKS ENTRY
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   GLOBAL STATE
========================================================== */

let currentUser = null;
let currentTeacher = null;

let assignments = [];
let exams = [];
let students = [];
let existingMarks = [];

let markingScheme = null;

let examLocked = false;
let hasUnsavedChanges = false;

/* ==========================================================
   DOM ELEMENTS
========================================================== */

/* Filters */

const academicYear =
    document.getElementById("academicYear");

const examSelect =
    document.getElementById("examSelect");

const classSelect =
    document.getElementById("classSelect");

const subjectSelect =
    document.getElementById("subjectSelect");

/* Teacher */

const teacherName =
    document.getElementById("teacherName");

/* Buttons */

const loadStudentsBtn =
    document.getElementById("loadStudentsBtn");

const saveDraftBtn =
    document.getElementById("saveDraftBtn");

const submitMarksBtn =
    document.getElementById("submitMarksBtn");

/* Dashboard */

const assignedClasses =
    document.getElementById("assignedClasses");

const assignedSubjects =
    document.getElementById("assignedSubjects");

const studentCount =
    document.getElementById("studentCount");

const completionPercent =
    document.getElementById("completionPercent");

/* Exam Information */

const maxMarks =
    document.getElementById("maxMarks");

const passMarks =
    document.getElementById("passMarks");

const entryType =
    document.getElementById("entryType");

const examStatus =
    document.getElementById("examStatus");

/* Progress */

const progressText =
    document.getElementById("progressText");

const progressFill =
    document.getElementById("progressFill");

/* Table */

const marksTable =
    document.getElementById("marksTable");

/* ==========================================================
   APPLICATION START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);

/* ==========================================================
   INITIALIZE
========================================================== */

async function initialize() {

    try {

        initializeEvents();

        await loadAcademicYears();

        await loadExams();

        await loadTeacherAssignments();

    }

    catch (error) {

        console.error(error);

        alert("Unable to initialize Marks Entry.");

    }

}

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    loadStudentsBtn.addEventListener(
        "click",
        loadStudents
    );

    saveDraftBtn.addEventListener(
        "click",
        saveDraft
    );

    submitMarksBtn.addEventListener(
        "click",
        submitMarksEntry
    );

    classSelect.addEventListener(
        "change",
        loadSubjectsForClass
    );

    subjectSelect.addEventListener(
        "change",
        loadExamInformation
    );

    examSelect.addEventListener(
        "change",
        loadExamInformation
    );

    window.addEventListener(
        "beforeunload",
        warnUnsavedChanges
    );

}

/* ==========================================================
   BEFORE UNLOAD
========================================================== */

function warnUnsavedChanges(event) {

    if (!hasUnsavedChanges) return;

    event.preventDefault();

    event.returnValue = "";

}
/* ==========================================================
   LOAD LOGGED-IN TEACHER
========================================================== */

async function loadTeacherAssignments() {

    try {

        /* Current Auth User */

        const {

            data: { user },

            error: authError

        } = await supabase.auth.getUser();

        if (authError || !user) {

            window.location.href = "../login.html";

            return;

        }

        currentUser = user;

        /* ERP User */

        const {

            data: profile,

            error: profileError

        } = await supabase

            .from("users")

            .select("*")

            .eq("auth_user_id", user.id)

            .single();

        if (profileError) throw profileError;

        teacherName.textContent = profile.full_name;

        currentTeacher = profile.id;

        /* Teacher Assignments */

        const {

            data,

            error

        } = await supabase

            .from("vw_teacher_assignments")

            .select("*")

            .eq("teacher_id", currentTeacher)

            .eq("active", true)

            .order("class_name");

        if (error) throw error;

        assignments = data || [];

        populateAssignments();

        updateDashboard();

    }

    catch (err) {

        console.error(err);

        alert("Unable to load teacher assignments.");

    }

}

/* ==========================================================
   POPULATE CLASSS & SUBJECTS
========================================================== */

function populateAssignments() {

    classSelect.innerHTML =

        `<option value="">Select Class</option>`;

    subjectSelect.innerHTML =

        `<option value="">Select Subject</option>`;

    /* Classes */

    const classes = [

        ...new Map(

            assignments.map(item => [

                item.class_id,

                item

            ])

        ).values()

    ];

    classes.forEach(item => {

        classSelect.innerHTML += `

<option value="${item.class_id}">

${item.class_name} ${item.section}

</option>

`;

    });

}

/* ==========================================================
   LOAD SUBJECTS FOR SELECTED CLASS
========================================================== */

function loadSubjectsForClass() {

    subjectSelect.innerHTML =

        `<option value="">Select Subject</option>`;

    if (!classSelect.value) return;

    assignments

        .filter(

            item =>

                item.class_id === classSelect.value

        )

        .forEach(item => {

            subjectSelect.innerHTML += `

<option value="${item.subject_id}">

${item.subject_name}

</option>

`;

        });

}

/* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard() {

    assignedClasses.textContent =

        new Set(

            assignments.map(

                item => item.class_id

            )

        ).size;

    assignedSubjects.textContent =

        new Set(

            assignments.map(

                item => item.subject_id

            )

        ).size;

}
/* ==========================================================
   LOAD ACADEMIC YEARS
========================================================== */

async function loadAcademicYears() {

    const { data, error } = await supabase

        .from("academic_years")

        .select("*")

        .eq("active", true)

        .order("academic_year", { ascending: false });

    if (error) {

        console.error(error);

        return;

    }

    academicYear.innerHTML =

        `<option value="">Select Academic Year</option>`;

    data.forEach(year => {

        academicYear.innerHTML += `

<option value="${year.academic_year}">

${year.academic_year}

</option>

`;

    });

}

/* ==========================================================
   LOAD EXAMS
========================================================== */

async function loadExams() {

    const { data, error } = await supabase

        .from("exams")

        .select("*")

        .eq("active", true)

        .order("display_order");

    if (error) {

        console.error(error);

        return;

    }

    exams = data || [];

    examSelect.innerHTML =

        `<option value="">Select Examination</option>`;

    exams.forEach(exam => {

        examSelect.innerHTML += `

<option value="${exam.id}">

${exam.exam_name}

</option>

`;

    });

}

/* ==========================================================
   LOAD EXAM INFORMATION
========================================================== */

async function loadExamInformation() {

    if (
        !examSelect.value ||
        !subjectSelect.value
    ) {

        return;

    }

    const { data, error } = await supabase

        .from("marking_scheme")

        .select("*")

        .eq("exam_id", Number(examSelect.value))

        .eq("subject_id", subjectSelect.value)

        .single();

    if (error) {

        console.error(error);

        return;

    }

    markingScheme = data;

    maxMarks.textContent =
        data.max_marks;

    passMarks.textContent =
        data.pass_marks;

    entryType.textContent =
        data.entry_type;

    await checkExamLock();

}

/* ==========================================================
   CHECK EXAM LOCK
========================================================== */

async function checkExamLock() {

    const { data, error } = await supabase

        .from("exams")

        .select("lock_marks")

        .eq("id", Number(examSelect.value))

        .single();

    if (error) {

        console.error(error);

        return;

    }

    examLocked = data.lock_marks;

    if (examLocked) {

        lockMarksEntry();

    }

    else {

        unlockMarksEntry();

    }

}
/* ==========================================================
   LOAD STUDENTS
========================================================== */

async function loadStudents() {

    if (
        !examSelect.value ||
        !classSelect.value ||
        !subjectSelect.value
    ) {

        alert("Please select Academic Year, Exam, Class and Subject.");

        return;

    }

    marksTable.innerHTML = `

<tr>

<td colspan="8" class="empty-state">

Loading students...

</td>

</tr>

`;

    const { data, error } = await supabase

        .from("students")

        .select("*")

        .eq("class_id", classSelect.value)

        .eq("active", true)

        .order("roll_no");

    if (error) {

        console.error(error);

        alert("Unable to load students.");

        return;

    }

    students = data || [];

    studentCount.textContent = students.length;

    existingMarks = await loadExistingMarks();

    renderMarksGrid(existingMarks);

}

/* ==========================================================
   LOAD EXISTING MARKS
========================================================== */

async function loadExistingMarks() {

    const { data, error } = await supabase

        .from("marks")

        .select("*")

        .eq("exam_id", Number(examSelect.value))

        .eq("subject_id", subjectSelect.value);

    if (error) {

        console.error(error);

        return [];

    }

    return data || [];

}

/* ==========================================================
   LOCK MARK ENTRY
========================================================== */

function lockMarksEntry() {

    document
        .querySelectorAll(".mark-input,.remark-input")
        .forEach(input => {

            input.disabled = true;

        });

    loadStudentsBtn.disabled = true;

    submitMarksBtn.disabled = true;

    examStatus.textContent = "LOCKED";

    examStatus.style.color = "#dc2626";

}

/* ==========================================================
   UNLOCK MARK ENTRY
========================================================== */

function unlockMarksEntry() {

    document
        .querySelectorAll(".mark-input,.remark-input")
        .forEach(input => {

            input.disabled = false;

        });

    loadStudentsBtn.disabled = false;

    submitMarksBtn.disabled = false;

    examStatus.textContent = "OPEN";

    examStatus.style.color = "#16a34a";

}
/* ==========================================================
   RENDER MARKS GRID
========================================================== */

function renderMarksGrid(existingMarks = []) {

    marksTable.innerHTML = "";

    if (students.length === 0) {

        marksTable.innerHTML = `

<tr>

<td colspan="8" class="empty-state">

No students found.

</td>

</tr>

`;

        return;

    }

    students.forEach(student => {

        const saved = existingMarks.find(
            mark => mark.student_id === student.id
        );

        const savedMark =
            saved?.marks_obtained ?? "";

        const savedGrade =
            saved?.grade ?? "--";

        const savedRemark =
            saved?.remarks ?? "";

        const savedStatus =
            saved ? "✅ Saved" : "⏳ Pending";

        const rowClass =
            saved ? "row-saved" : "";

        marksTable.innerHTML += `

<tr
class="${rowClass}"
data-student="${student.id}">

    <td>${student.roll_no}</td>

    <td>${student.admission_no}</td>

    <td>${student.student_name}</td>

    <td>${markingScheme.max_marks}</td>

    <td>

        <input
            type="number"
            class="mark-input"
            data-id="${student.id}"
            value="${savedMark}"
            min="0"
            max="${markingScheme.max_marks}"
            ${examLocked ? "disabled" : ""}
        >

    </td>

    <td class="grade-cell">

        ${savedGrade}

    </td>

    <td>

        <input
            type="text"
            class="remark-input"
            value="${savedRemark}"
            placeholder="Remarks"
            ${examLocked ? "disabled" : ""}
        >

    </td>

    <td class="save-status">

        ${savedStatus}

    </td>

</tr>

`;

    });

    attachInputEvents();

    updateProgress();

}
/* ==========================================================
   ATTACH INPUT EVENTS
========================================================== */

function attachInputEvents() {

    document
        .querySelectorAll(".mark-input")
        .forEach(input => {

            input.addEventListener(
                "input",
                validateMark
            );

            input.addEventListener(
                "blur",
                autoSaveMark
            );

        });

    document
        .querySelectorAll(".remark-input")
        .forEach(input => {

            input.addEventListener(
                "blur",
                autoSaveMark
            );

        });

}
/* ==========================================================
   VALIDATE MARK
========================================================== */

function validateMark(e) {

    if (examLocked) return;

    hasUnsavedChanges = true;

    const input = e.target;

    const row = input.closest("tr");

    const gradeCell = row.querySelector(".grade-cell");

    const value = Number(input.value);

    const max = Number(markingScheme.max_marks);

    if (input.value === "") {

        row.classList.remove("row-error");

        input.style.borderColor = "";

        gradeCell.textContent = "--";

        return;

    }

    if (value < 0 || value > max) {

        row.classList.add("row-error");

        input.style.borderColor = "#dc2626";

        gradeCell.textContent = "--";

        return;

    }

    row.classList.remove("row-error");

    input.style.borderColor = "#16a34a";

    gradeCell.textContent = calculateGrade(value, max);

}

/* ==========================================================
   GRADE CALCULATION
========================================================== */

function calculateGrade(mark, max) {

    const percentage = (mark / max) * 100;

    if (percentage >= 91) return "A1";
    if (percentage >= 81) return "A2";
    if (percentage >= 71) return "B1";
    if (percentage >= 61) return "B2";
    if (percentage >= 51) return "C1";
    if (percentage >= 41) return "C2";
    if (percentage >= 33) return "D";

    return "E";

}

/* ==========================================================
   AUTO SAVE
========================================================== */

async function autoSaveMark(e) {

    if (examLocked) return;

    const row = e.target.closest("tr");

    const studentId = row.dataset.student;

    const marks = row.querySelector(".mark-input").value;



    const remarks = row.querySelector(".remark-input").value;

    const grade = row.querySelector(".grade-cell").textContent;

    const statusCell = row.querySelector(".save-status");

          if (marks === "" || grade === "--") {

    statusCell.textContent = "❌ Invalid";

    return;

}
    statusCell.textContent = "💾 Saving...";

    const assignment = assignments.find(a =>
        a.class_id === classSelect.value &&
        a.subject_id === subjectSelect.value
    );

    if (!assignment) {

        statusCell.textContent = "❌ Assignment Missing";

        return;

    }

    const payload = {

        student_id: studentId,

        exam_id: Number(examSelect.value),

        subject_id: subjectSelect.value,

        teacher_assignment_id: assignment.id,

        marking_scheme_id: markingScheme.id,

        entered_by: currentUser.id,

        marks_obtained: Number(marks),

        grade: grade,

        remarks: remarks,

        status: "Draft"

    };

  try {

    const { error } = await supabase

        .from("marks")

        .upsert(payload, {

            onConflict: "student_id,exam_id,subject_id"

        });

    if (error) throw error;

    row.classList.remove("row-error");

    row.classList.add("row-saved");

    statusCell.textContent = "✅ Saved";

    hasUnsavedChanges = false;

    updateProgress();

} catch (err) {

    console.error(err);

    row.classList.add("row-error");

    statusCell.textContent = "❌ Error";

}
}
/* ==========================================================
   SAVE DRAFT
========================================================== */

async function saveDraft() {

    if (examLocked) {

        alert("This examination has been locked.");

        return;

    }

   

}

/* ==========================================================
   FINAL SUBMIT
========================================================== */

async function submitMarksEntry() {

    if (examLocked) {

        alert("This examination has already been locked.");

        return;

    }

    

    const emptyMarks = [...document.querySelectorAll(".mark-input")]

        .filter(input => input.value.trim() === "");

    if (emptyMarks.length > 0) {

        alert(

            `${emptyMarks.length} student(s) still have no marks entered.`

        );

        emptyMarks[0].focus();

        return;

    }

    const ok = confirm(

        "Are you sure you want to submit the marks?\n\nAfter submission, editing will not be allowed until the Exam Department reopens it."

    );

    if (!ok) return;

    const { error } = await supabase

        .from("marks")

        .update({

            status: "Submitted"

        })

        .eq("exam_id", Number(examSelect.value))

        .eq("subject_id", subjectSelect.value);

    if (error) {

        console.error(error);

        alert("Unable to submit marks.");

        return;

    }

    document

        .querySelectorAll(".save-status")

        .forEach(cell => {

            cell.textContent = "📨 Submitted";

            cell.classList.add("submitted");

        });

    lockMarksEntry();

    alert("Marks submitted successfully.");

}

/* ==========================================================
   UPDATE PROGRESS
========================================================== */

function updateProgress() {

    const saved = document.querySelectorAll(".row-saved").length;

    const total = students.length;

    const percent =

        total === 0

            ? 0

            : Math.round((saved / total) * 100);

    completionPercent.textContent = percent + "%";

    progressText.textContent =

        `${saved} / ${total} Students`;

    progressFill.style.width =

        percent + "%";

}

/* ==========================================================
   KEYBOARD NAVIGATION
========================================================== */

document.addEventListener("keydown", e => {

    if (e.key !== "Enter") return;

    if (!e.target.classList.contains("mark-input")) return;

    e.preventDefault();

    const inputs = [

        ...document.querySelectorAll(".mark-input")

    ];

    const index =

        inputs.indexOf(e.target);

    if (index < inputs.length - 1) {

        inputs[index + 1].focus();

        inputs[index + 1].select();

    }

});

/* ==========================================================
   PAGE READY
========================================================== */

console.log(

    "RAS Markfeeder ERP - Marks Entry Loaded"

);
/* ==========================================================
   EXCEL PASTE
========================================================== */

document.addEventListener("paste", handleExcelPaste);

function handleExcelPaste(e) {

    const active = document.activeElement;

    if (!active.classList.contains("mark-input")) return;

    e.preventDefault();

    const clipboard =

        e.clipboardData.getData("text");

    const rows = clipboard

        .trim()

        .split(/\r?\n/);

    const inputs = [

        ...document.querySelectorAll(".mark-input")

    ];

    const startIndex =

        inputs.indexOf(active);

    rows.forEach((value, index) => {

        const input = inputs[startIndex + index];

        if (!input) return;

        input.value = value.trim();

        input.dispatchEvent(

            new Event("input")

        );

        input.dispatchEvent(

            new Event("blur")

        );

    });

}
