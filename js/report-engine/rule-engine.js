import { supabase } from "../../database/supabase.js";

/* ==========================================================
   LOAD GRADE
========================================================== */

export async function getGrade(percentage){

    const { data } = await supabase

        .from("grade_rules")

        .select("grade")

        .lte("min_percentage", percentage)

        .gte("max_percentage", percentage)

        .single();

    return data?.grade || "E";

}
