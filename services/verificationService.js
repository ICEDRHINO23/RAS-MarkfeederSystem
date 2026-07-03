/* ==========================================================
   RAS MARKFEEDER ERP
   VERIFICATION SERVICE
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   GET SUBMITTED MARKS
========================================================== */

export async function getSubmittedMarks(filters = {}) {

    let query = supabase
        .from("vw_teacher_assignments")
        .select("*");

    if (filters.classId) {
        query = query.eq("class_id", filters.classId);
    }

    if (filters.examId) {
        query = query.eq("exam_id", filters.examId);
    }

    if (filters.teacherId) {
        query = query.eq("teacher_id", filters.teacherId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];

}

/* ==========================================================
   LOAD MARKS FOR REVIEW
========================================================== */

export async function getMarksForReview(
    examId,
    classId,
    subjectId
) {

    const { data, error } = await supabase

        .from("vw_student_marks")

        .select("*")

        .eq("exam_id", examId)

        .eq("class_id", classId)

        .eq("subject_id", subjectId)

        .order("roll_no");

    if (error) throw error;

    return data || [];

}

/* ==========================================================
   VERIFY SUBJECT
========================================================== */

export async function verifySubject(
    examId,
    subjectId,
    classId,
    verifiedBy
) {

    const { error } = await supabase

        .from("marks")

        .update({

            status: "Verified",

            verified_by: verifiedBy

        })

        .eq("exam_id", examId)

        .eq("subject_id", subjectId);

    if (error) throw error;

}

/* ==========================================================
   REJECT SUBJECT
========================================================== */

export async function rejectSubject(
    examId,
    subjectId
) {

    const { error } = await supabase

        .from("marks")

        .update({

            status: "Draft",

            verified_by: null

        })

        .eq("exam_id", examId)

        .eq("subject_id", subjectId);

    if (error) throw error;

}

/* ==========================================================
   DASHBOARD COUNTS
========================================================== */

export async function getVerificationSummary() {

    const { data, error } = await supabase

        .from("marks")

        .select("status");

    if (error) throw error;

    const summary = {

        total: data.length,

        draft: 0,

        submitted: 0,

        verified: 0,

        published: 0

    };

    data.forEach(row => {

        switch (row.status) {

            case "Draft":
                summary.draft++;
                break;

            case "Submitted":
                summary.submitted++;
                break;

            case "Verified":
                summary.verified++;
                break;

            case "Published":
                summary.published++;
                break;

        }

    });

    return summary;

}
