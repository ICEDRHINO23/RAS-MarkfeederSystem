import { supabase } from "./supabase.js";

// ===============================
// Students
// ===============================

export async function getStudents() {
    const { data, error } = await supabase
        .from("vw_student_details")
        .select("*")
        .order("class_grade")
        .order("section")
        .order("roll_no");

    if (error) throw error;

    return data;
}

export async function getStudent(id) {
    const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    return data;
}

export async function addStudent(student) {
    const { data, error } = await supabase
        .from("students")
        .insert(student)
        .select();

    if (error) throw error;

    return data;
}

export async function updateStudent(id, student) {
    const { data, error } = await supabase
        .from("students")
        .update(student)
        .eq("id", id)
        .select();

    if (error) throw error;

    return data;
}

export async function deleteStudent(id) {
    const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

    if (error) throw error;
}
