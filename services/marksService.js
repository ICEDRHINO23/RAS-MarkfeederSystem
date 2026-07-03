/* ==========================================================
   RAS MARKFEEDER ERP
   MARKS SERVICE
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   GET MARKS
========================================================== */

export async function getExistingMarks(
    examId,
    classId,
    subjectId
) {

    const { data, error } = await supabase
        .from("marks")
        .select(`
            *,
            students (
                id,
                admission_no,
                roll_no,
                student_name
            )
        `)
        .eq("exam_id", examId)
        .eq("subject_id", subjectId);

    if (error) throw error;

    return data || [];

}

/* ==========================================================
   SAVE SINGLE MARK
========================================================== */

export async function saveMark(payload) {

    const { error } = await supabase
        .from("marks")
        .upsert(payload, {
            onConflict: "student_id,exam_id,subject_id"
        });

    if (error) throw error;

    return true;

}

/* ==========================================================
   SAVE BULK MARKS
========================================================== */

export async function saveBulkMarks(payload) {

    const { error } = await supabase
        .from("marks")
        .upsert(payload, {
            onConflict: "student_id,exam_id,subject_id"
        });

    if (error) throw error;

    return true;

}

/* ==========================================================
   SUBMIT MARKS
========================================================== */

export async function submitMarks(
    examId,
    classId,
    subjectId
) {

    const { error } = await supabase

        .from("marks")

        .update({

            status: "Submitted"

        })

        .eq("exam_id", examId)

        .eq("subject_id", subjectId);

    if (error) throw error;

}

/* ==========================================================
   LOCK EXAM
========================================================== */

export async function lockExam(examId) {

    const { error } = await supabase

        .from("exams")

        .update({

            lock_marks: true

        })

        .eq("id", examId);

    if (error) throw error;

}

/* ==========================================================
   UNLOCK EXAM
========================================================== */

export async function unlockExam(examId) {

    const { error } = await supabase

        .from("exams")

        .update({

            lock_marks: false

        })

        .eq("id", examId);

    if (error) throw error;

}

/* ==========================================================
   CALCULATE PROGRESS
========================================================== */

export async function calculateProgress(
    examId,
    classId,
    subjectId
) {

    const { count } = await supabase

        .from("marks")

        .select("*", {

            count: "exact",

            head: true

        })

        .eq("exam_id", examId)

        .eq("subject_id", subjectId)

        .eq("status", "Submitted");

    return count || 0;

}

/* ==========================================================
   DELETE DRAFTS
========================================================== */

export async function deleteDrafts(
    examId,
    subjectId
) {

    const { error } = await supabase

        .from("marks")

        .delete()

        .eq("exam_id", examId)

        .eq("subject_id", subjectId)

        .eq("status", "Draft");

    if (error) throw error;

}

/* ==========================================================
   CHECK LOCK STATUS
========================================================== */

export async function isExamLocked(examId) {

    const { data, error } = await supabase

        .from("exams")

        .select("lock_marks")

        .eq("id", examId)

        .single();

    if (error) throw error;

    return data.lock_marks;

}
/* ==========================================================
   CHECK COMPLETION
========================================================== */

export async function canSubmitMarks(
    examId,
    classId,
    subjectId
) {

    const { count: totalStudents, error: studentError } =
        await supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .eq("class_id", classId)
            .eq("active", true);

    if (studentError) throw studentError;

    const { count: savedMarks, error: marksError } =
        await supabase
            .from("marks")
            .select("*", { count: "exact", head: true })
            .eq("exam_id", examId)
            .eq("subject_id", subjectId);

    if (marksError) throw marksError;

    return totalStudents === savedMarks;

}

/* ==========================================================
   SUBMIT MARKS
========================================================== */

export async function submitMarks(
    examId,
    classId,
    subjectId
) {

    const ready =
        await canSubmitMarks(
            examId,
            classId,
            subjectId
        );

    if (!ready) {

        throw new Error(
            "Marks entry is incomplete."
        );

    }

    const { error } = await supabase

        .from("marks")

        .update({

            status: "Submitted"

        })

        .eq("exam_id", examId)

        .eq("subject_id", subjectId);

    if (error) throw error;

    return true;

}
