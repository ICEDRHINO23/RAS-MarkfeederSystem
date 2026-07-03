/* ==========================================================
   RAS MARKFEEDER ERP
   SUBJECTS.JS
========================================================== */

import {
    loadData,
    insertData,
    updateData,
    deleteData
} from "../utils/crud.js";

import {
    openModal,
    closeModal,
    initializeModal
} from "../utils/modal.js";

import {
    success,
    error
} from "../utils/alerts.js";

import {
    exportExcel
} from "../utils/excel.js";

import {
    search
} from "../utils/search.js";

import {
    filterData
} from "../utils/filters.js";

import {
    showLoader,
    showEmpty,
    showError
} from "../utils/loader.js";

import {
    required,
    clearErrors
} from "../utils/validation.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let subjects = [];

let editingSubject = null;

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const subjectTable =
    document.getElementById("subjectTable");

const subjectForm =
    document.getElementById("subjectForm");

const subjectModal =
    document.getElementById("subjectModal");

const addSubjectBtn =
    document.getElementById("addSubjectBtn");

const closeModalBtn =
    document.getElementById("closeModal");

const cancelSubject =
    document.getElementById("cancelSubject");

const searchSubject =
    document.getElementById("searchSubject");

const filterType =
    document.getElementById("filterType");

const exportSubjects =
    document.getElementById("exportSubjects");

/* Dashboard */

const totalSubjects =
    document.getElementById("totalSubjects");

const scholasticSubjects =
    document.getElementById("scholasticSubjects");

const coScholasticSubjects =
    document.getElementById("coScholasticSubjects");

const activeSubjects =
    document.getElementById("activeSubjects");

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    initializeModal(subjectModal);

    initializeEvents();

    await loadSubjects();

});

/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    addSubjectBtn.addEventListener("click", () => {

        editingSubject = null;

        subjectForm.reset();

        document.getElementById("active").checked = true;

        document.getElementById("modalTitle").textContent =
            "Add Subject";

        openModal(subjectModal);

    });

    closeModalBtn.addEventListener("click", () => {

        closeModal(subjectModal);

    });

    cancelSubject.addEventListener("click", () => {

        closeModal(subjectModal);

    });

    subjectForm.addEventListener(

        "submit",

        saveSubject

    );

    searchSubject.addEventListener(

        "input",

        searchSubjects

    );

    filterType.addEventListener(

        "change",

        applyFilters

    );

    exportSubjects.addEventListener(

        "click",

        exportSubjectList

    );

}
/* ==========================================================
   LOAD SUBJECTS
========================================================== */

async function loadSubjects() {

    showLoader(subjectTable, 7);

    try {

        subjects = await loadData("subjects");

        subjects.sort((a, b) =>
            a.subject_name.localeCompare(b.subject_name)
        );

        updateDashboard();

        renderSubjects(subjects);

        loadFilters();

    }

    catch (err) {

        console.error(err);

        showError(

            subjectTable,

            err.message,

            7

        );

    }

}

/* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard() {

    totalSubjects.textContent =
        subjects.length;

    scholasticSubjects.textContent =
        subjects.filter(s =>
            s.subject_type === "Scholastic"
        ).length;

    coScholasticSubjects.textContent =
        subjects.filter(s =>
            s.subject_type === "Co-Scholastic"
        ).length;

    activeSubjects.textContent =
        subjects.filter(s =>
            s.active
        ).length;

}

/* ==========================================================
   RENDER TABLE
========================================================== */

function renderSubjects(data) {

    if (!data.length) {

        showEmpty(subjectTable, 7);

        return;

    }

    subjectTable.innerHTML = "";

    data.forEach(subject => {

        subjectTable.innerHTML += `

<tr>

<td>

${subject.subject_code}

</td>

<td>

${subject.subject_name}

</td>

<td>

${subject.subject_type}

</td>

<td>

${subject.max_marks}

</td>

<td>

${subject.pass_marks}

</td>

<td>

<span class="${subject.active
? "badge-success"
: "badge-danger"}">

${subject.active
? "Active"
: "Inactive"}

</span>

</td>

<td>

<div class="action-buttons">

<button

class="edit-btn"

onclick="editSubject('${subject.id}')">

<i class="fa-solid fa-pen"></i>

</button>

<button

class="delete-btn"

onclick="deleteSubject('${subject.id}')">

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

    filterType.innerHTML = `

<option value="">

All Types

</option>

<option value="Scholastic">

Scholastic

</option>

<option value="Co-Scholastic">

Co-Scholastic

</option>

`;

}
/* ==========================================================
   SEARCH
========================================================== */

function searchSubjects() {

    const filtered = search(

        subjects,

        searchSubject.value,

        [

            "subject_code",

            "subject_name",

            "subject_type"

        ]

    );

    renderSubjects(filtered);

}

/* ==========================================================
   FILTER
========================================================== */

function applyFilters() {

    const filtered = filterData(

        subjects,

        {

            subject_type: filterType.value

        }

    );

    renderSubjects(filtered);

}

/* ==========================================================
   SAVE SUBJECT
========================================================== */

async function saveSubject(e) {

    e.preventDefault();

    clearErrors();

    const payload = {

        subject_code:

            document.getElementById("subject_code").value.trim(),

        subject_name:

            document.getElementById("subject_name").value.trim(),

        subject_type:

            document.getElementById("subject_type").value,

        max_marks:

            Number(document.getElementById("max_marks").value),

        pass_marks:

            Number(document.getElementById("pass_marks").value),

        active:

            document.getElementById("active").checked

    };

    if (!required(payload.subject_code)) {

        error("Subject Code is required");

        return;

    }

    if (!required(payload.subject_name)) {

        error("Subject Name is required");

        return;

    }

    try {

        if (editingSubject) {

            await updateData(

                "subjects",

                editingSubject,

                payload

            );

            success("Subject Updated Successfully");

        }

        else {

            await insertData(

                "subjects",

                payload

            );

            success("Subject Added Successfully");

        }

        editingSubject = null;

        subjectForm.reset();

        closeModal(subjectModal);

        await loadSubjects();

    }

    catch (err) {

        console.error(err);

        error(err.message);

    }

}

/* ==========================================================
   EDIT SUBJECT
========================================================== */

async function editSubject(id) {

    const subject =

        subjects.find(

            s => s.id === id

        );

    if (!subject) return;

    editingSubject = id;

    document.getElementById("modalTitle").textContent =

        "Edit Subject";

    document.getElementById("subject_code").value =

        subject.subject_code;

    document.getElementById("subject_name").value =

        subject.subject_name;

    document.getElementById("subject_type").value =

        subject.subject_type;

    document.getElementById("max_marks").value =

        subject.max_marks;

    document.getElementById("pass_marks").value =

        subject.pass_marks;

    document.getElementById("active").checked =

        subject.active;

    openModal(subjectModal);

}

/* ==========================================================
   DELETE SUBJECT
========================================================== */

async function deleteSubject(id) {

    if (!confirm("Delete this subject?"))

        return;

    try {

        await deleteData(

            "subjects",

            id

        );

        success("Subject Deleted");

        await loadSubjects();

    }

    catch (err) {

        console.error(err);

        error(err.message);

    }

}

/* ==========================================================
   GLOBAL FUNCTIONS
========================================================== */

window.editSubject = editSubject;

window.deleteSubject = deleteSubject;
/* ==========================================================
   EXPORT SUBJECTS
========================================================== */

function exportSubjectList() {

    const rows = subjects.map(subject => ({

        "Subject Code": subject.subject_code,

        "Subject Name": subject.subject_name,

        "Subject Type": subject.subject_type,

        "Maximum Marks": subject.max_marks,

        "Pass Marks": subject.pass_marks,

        "Status": subject.active ? "Active" : "Inactive"

    }));

    exportExcel(

        rows,

        "Subjects"

    );

}

/* ==========================================================
   RESET FORM
========================================================== */

function resetSubjectForm() {

    editingSubject = null;

    subjectForm.reset();

    document.getElementById("active").checked = true;

    document.getElementById("max_marks").value = 100;

    document.getElementById("pass_marks").value = 35;

    document.getElementById("modalTitle").textContent =

        "Add Subject";

}

/* ==========================================================
   REFRESH
========================================================== */

async function refreshSubjects() {

    await loadSubjects();

}

/* ==========================================================
   ESC KEY
========================================================== */

document.addEventListener("keydown", e => {

    if (e.key === "Escape") {

        closeModal(subjectModal);

    }

});

/* ==========================================================
   DEBUG
========================================================== */

console.log(

    "RAS Markfeeder ERP :: Subjects Module Loaded"

);
