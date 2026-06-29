import { supabase } from "../database/supabase.js";

// ======================================================
// RAS MARKFEEDER ERP
// Dashboard
// ======================================================

const studentCount = document.getElementById("studentCount");
const teacherCount = document.getElementById("teacherCount");
const examCount = document.getElementById("examCount");
const reportCount = document.getElementById("reportCount");

document.addEventListener("DOMContentLoaded", async () => {

    await Promise.all([
        loadStudents(),
        loadTeachers(),
        loadExams(),
        loadReports()
    ]);

});

// ======================================================
// Students
// ======================================================

async function loadStudents() {

    const { count, error } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("Students :", error.message);
        studentCount.textContent = "0";
        return;
    }

    studentCount.textContent = count;

}

// ======================================================
// Teachers
// ======================================================

async function loadTeachers() {

    const { count, error } = await supabase
        .from("teachers")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("Teachers :", error.message);
        teacherCount.textContent = "0";
        return;
    }

    teacherCount.textContent = count;

}

// ======================================================
// Exams
// ======================================================

async function loadExams() {

    if (!examCount) return;

    const { count, error } = await supabase
        .from("exams")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("Exams :", error.message);
        examCount.textContent = "0";
        return;
    }

    examCount.textContent = count;

}

// ======================================================
// Reports
// ======================================================

async function loadReports() {

    if (!reportCount) return;

    const { count, error } = await supabase
        .from("results")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("Reports :", error.message);
        reportCount.textContent = "0";
        return;
    }

    reportCount.textContent = count;

}

// ======================================================
// Dashboard Refresh
// ======================================================

export async function refreshDashboard() {

    await Promise.all([
        loadStudents(),
        loadTeachers(),
        loadExams(),
        loadReports()
    ]);

}

console.log("✅ Dashboard Loaded");
