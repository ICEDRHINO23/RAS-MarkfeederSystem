import { requireAuth } from "./session.js";
import { getDashboardStats } from "../database/dashboard.js";

(async () => {

    const user = await requireAuth("Admin");

    if (!user) return;

    document.getElementById("adminName").textContent =
        user.full_name;

    const stats = await getDashboardStats();

    document.getElementById("studentCount").textContent =
        stats.students;

    document.getElementById("teacherCount").textContent =
        stats.teachers;

    document.getElementById("classCount").textContent =
        stats.classes;

    document.getElementById("subjectCount").textContent =
        stats.subjects;

})();
