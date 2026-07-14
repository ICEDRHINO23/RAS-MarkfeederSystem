import { supabase } from "../database/supabase.js";

let gradingScale = [];

/* ==========================================
   LOAD GRADING SCALE
========================================== */

export async function initializeGrades() {

    const { data, error } = await supabase

        .from("grading_scale")

        .select("*")

        .eq("active", true)

        .order("minimum_percentage", {

            ascending: false

        });

    if (error) {

        console.error(error);

        return;

    }

    gradingScale = data || [];

}

/* ==========================================
   GRADE
========================================== */

export function getGrade(percentage) {

    for (const item of gradingScale) {

        if (

            percentage >= item.minimum_percentage &&

            percentage <= item.maximum_percentage

        ) {

            return {

                grade: item.grade,

                gradePoint: item.grade_point,

                remarks: item.remarks

            };

        }

    }

    return {

        grade: "NA",

        gradePoint: 0,

        remarks: ""

    };

}
