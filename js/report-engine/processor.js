import { supabase } from "../../database/supabase.js";

import { calculateTotals } from "./calculator.js";
import { calculateGrade } from "./grading.js";
import { calculateRanks } from "./ranking.js";

/* ==========================================================
   PROCESS RESULTS
========================================================== */

export async function processResults(examId) {

    console.log("Processing Results...");

    const { data: students, error } = await supabase

        .from("students")

        .select("*")

        .eq("active", true);

    if (error) {

        console.error(error);

        return;

    }

    for (const student of students) {

        await processStudent(student.id, examId);

    }

    await calculateRanks(examId);

    console.log("Result Processing Completed");

}
async function processStudent(studentId, examId){

    const { data: marks } = await supabase

        .from("vw_student_marks")

        .select("*")

        .eq("student_id", studentId)

        .eq("exam_id", examId);

    if(!marks.length) return;

    const total =
        calculateTotals(marks);

    const percentage =
        total.percentage;

    const grade =
        calculateGrade(percentage);

    const result =
        percentage>=33
            ?"PASS"
            :"FAIL";

    await supabase

        .from("results")

        .upsert({

            student_id:studentId,

            exam_id:examId,

            total_marks:total.total,

            max_marks:total.max,

            percentage,

            overall_grade:grade,

            result

        });

}
