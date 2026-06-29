import { supabase } from "./supabase.js";

export async function getDashboardStats() {

    const [
        students,
        teachers,
        classes,
        subjects,
        exams
    ] = await Promise.all([

        supabase.from("students").select("*", { count: "exact", head: true }),

        supabase.from("teachers").select("*", { count: "exact", head: true }),

        supabase.from("classes").select("*", { count: "exact", head: true }),

        supabase.from("subjects").select("*", { count: "exact", head: true }),

        supabase.from("exams").select("*", { count: "exact", head: true })

    ]);

    return {

        students: students.count || 0,

        teachers: teachers.count || 0,

        classes: classes.count || 0,

        subjects: subjects.count || 0,

        exams: exams.count || 0

    };

}
