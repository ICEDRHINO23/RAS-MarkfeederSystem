import { supabase } from "../database/supabase.js";

export async function getStudentsByClass(classId) {

    const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("class_id", classId)
        .eq("active", true)
        .order("roll_no");

    if (error) throw error;

    return data;
}
