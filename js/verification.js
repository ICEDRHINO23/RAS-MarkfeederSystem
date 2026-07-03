/* ==========================================================
   RAS MARKFEEDER ERP
   VERIFICATION CONTROLLER
========================================================== */

import { supabase } from "../database/supabase.js";

import {

    getSubmittedMarks,
    getMarksForReview,
    verifySubject,
    rejectSubject,
    getVerificationSummary

} from "./services/verificationService.js";

import {

    processResults

} from "./services/resultService.js";

/* ==========================================================
   DOM
========================================================== */

const academicYear =
    document.getElementById("academicYear");

const examSelect =
    document.getElementById("examSelect");

const classSelect =
    document.getElementById("classSelect");

const statusSelect =
    document.getElementById("statusSelect");

const verificationTable =
    document.getElementById("verificationTable");

const reviewModal =
    document.getElementById("reviewModal");

const reviewContent =
    document.getElementById("reviewContent");

const refreshBtn =
    document.getElementById("refreshBtn");

const processBtn =
    document.getElementById("processBtn");

const verifyBtn =
    document.getElementById("verifyBtn");

const rejectBtn =
    document.getElementById("rejectBtn");

const closeModal =
    document.getElementById("closeModal");

let selectedRow = null;

/* ==========================================================
   INIT
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await loadFilters();

    await refreshDashboard();

    await loadVerificationTable();

});

/* ==========================================================
   EVENTS
========================================================== */

refreshBtn.addEventListener("click", async () => {

    await refreshDashboard();

    await loadVerificationTable();

});

processBtn.addEventListener("click", processCurrentClass);

verifyBtn.addEventListener("click", verifyCurrent);

rejectBtn.addEventListener("click", rejectCurrent);

closeModal.addEventListener("click", () => {

    reviewModal.style.display = "none";

});

statusSelect.addEventListener("change", loadVerificationTable);

examSelect.addEventListener("change", loadVerificationTable);

classSelect.addEventListener("change", loadVerificationTable);
/* ==========================================================
   LOAD FILTERS
========================================================== */

async function loadFilters() {

    await loadAcademicYears();

    await loadExams();

    await loadClasses();

}

/* ==========================================================
   DASHBOARD
========================================================== */

async function refreshDashboard() {

    const summary =
        await getVerificationSummary();

    document.getElementById("totalSubjects").textContent =
        summary.total;

    document.getElementById("submittedSubjects").textContent =
        summary.submitted;

    document.getElementById("verifiedSubjects").textContent =
        summary.verified;

    document.getElementById("pendingSubjects").textContent =
        summary.draft;

}

/* ==========================================================
   TABLE
========================================================== */

async function loadVerificationTable() {

    const rows = await getSubmittedMarks({

        examId: examSelect.value,

        classId: classSelect.value

    });

    verificationTable.innerHTML = "";

    rows.forEach(row => {

        verificationTable.innerHTML += `

<tr>

<td>${row.teacher_name}</td>

<td>${row.class_name}</td>

<td>${row.subject_name}</td>

<td>${row.exam_name}</td>

<td>${row.student_count ?? 0}</td>

<td>${row.completion ?? 0}%</td>

<td>${row.status}</td>

<td>

<button
class="btn-primary review-btn"

data-exam="${row.exam_id}"

data-class="${row.class_id}"

data-subject="${row.subject_id}">

Review

</button>

</td>

</tr>

`;

    });

    document
        .querySelectorAll(".review-btn")
        .forEach(btn => {

            btn.addEventListener(

                "click",

                openReview

            );

        });

}
/* ==========================================================
   REVIEW
========================================================== */

async function openReview(e) {

    const button = e.target;

    selectedRow = {

        examId: Number(button.dataset.exam),

        classId: button.dataset.class,

        subjectId: button.dataset.subject

    };

    const marks = await getMarksForReview(

        selectedRow.examId,

        selectedRow.classId,

        selectedRow.subjectId

    );

    reviewContent.innerHTML = "";

    marks.forEach(student => {

        reviewContent.innerHTML += `

<div class="review-row">

<span>${student.roll_no}</span>

<span>${student.student_name}</span>

<span>${student.marks_obtained}</span>

<span>${student.grade}</span>

</div>

`;

    });

    reviewModal.style.display = "flex";

}
/* ==========================================================
   VERIFY
========================================================== */

async function verifyCurrent() {

    if (!selectedRow) return;

    const {

        data: { user }

    } = await supabase.auth.getUser();

    await verifySubject(

        selectedRow.examId,

        selectedRow.subjectId,

        selectedRow.classId,

        user.id

    );

    await processResults(

        selectedRow.examId,

        selectedRow.classId

    );

    reviewModal.style.display = "none";

    await refreshDashboard();

    await loadVerificationTable();

    alert("Verification completed.");

}

/* ==========================================================
   REJECT
========================================================== */

async function rejectCurrent() {

    if (!selectedRow) return;

    await rejectSubject(

        selectedRow.examId,

        selectedRow.subjectId

    );

    reviewModal.style.display = "none";

    await refreshDashboard();

    await loadVerificationTable();

}

/* ==========================================================
   PROCESS BUTTON
========================================================== */

async function processCurrentClass() {

    if (!examSelect.value || !classSelect.value) {

        alert("Please select Exam and Class.");

        return;

    }

    await processResults(

        Number(examSelect.value),

        classSelect.value

    );

    alert("Results processed successfully.");

}
