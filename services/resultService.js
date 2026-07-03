/* ==========================================================
   RAS MARKFEEDER ERP
   RESULT SERVICE
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   PROCESS RESULTS
========================================================== */

export async function processResults(examId, classId) {

    const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", classId)
    .eq("active", true)
    .order("roll_no");

    if (error) throw error;

    for (const student of students) {

        await processStudent(student.id, examId);

    }

    await calculateRanks(examId, classId);

}
/* ==========================================================
   PROCESS SINGLE STUDENT
========================================================== */

async function processStudent(studentId, examId) {

    const { data: marks, error } = await supabase

        .from("vw_student_marks")

        .select("*")

        .eq("student_id", studentId)

        .eq("exam_id", examId);

    if (error) throw error;

    if (!marks.length) return;

    let total = 0;

    let max = 0;

    marks.forEach(mark => {

        total += Number(mark.marks_obtained || 0);

        max += Number(mark.max_marks || 0);

    });

    const percentage =

        max === 0

            ? 0

            : Number(((total / max) * 100).toFixed(2));

    const grade =

        await calculateGrade(percentage);

    const result =

        percentage >= 33

            ? "PASS"

            : "FAIL";

    await supabase

        .from("results")

        .upsert({

            student_id: studentId,

            exam_id: examId,

            total_marks: total,

            max_marks: max,

            percentage,

            overall_grade: grade,

            result

        });

}

/* ==========================================================
   CALCULATE GRADE
========================================================== */

async function calculateGrade(percentage) {

    const { data } = await supabase

        .from("grade_rules")

        .select("grade")

        .lte("min_percentage", percentage)

        .gte("max_percentage", percentage)

        .single();

    return data?.grade || "E";

}

/* ==========================================================
   CALCULATE SCHOOL RANK
========================================================== */

async function calculateRanks(examId, classId)

    const { data } = await supabase

        .from("results")

        .select("*")

        .eq("exam_id", examId)

        .order("percentage", {

            ascending: false

        });

    if (!data) return;

    for (let i = 0; i < data.length; i++) {

        await supabase

            .from("results")

            .update({

                school_rank: i + 1

            })

            .eq("id", data[i].id);

    }

}

/* ==========================================================
   PUBLISH RESULTS
========================================================== */

export async function publishResults(examId) {

    const { error } = await supabase

        .from("results")

        .update({

            published: true

        })

        .eq("exam_id", examId);

    if (error) throw error;

}

/* ==========================================================
   UNPUBLISH RESULTS
========================================================== */

export async function unpublishResults(examId) {

    const { error } = await supabase

        .from("results")

        .update({

            published: false

        })

        .eq("exam_id", examId);

    if (error) throw error;

}
