/* ==========================================================
   RAS MARKFEEDER ERP
   RESULT ENGINE
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   LOAD GRADING SCALE
========================================================== */

export async function loadGradingScale() {

    const { data, error } = await supabase
        .from("grading_scale")
        .select("*")
        .order("minimum_percentage", { ascending: false });

    if (error) {
        console.error("Failed to load grading scale", error);
        return [];
    }

    return data || [];
}

/* ==========================================================
   LOAD STUDENT MARKS
========================================================== */

export async function loadStudentMarks(studentId, examId) {

    const { data, error } = await supabase
        .from("marks")
        .select("*")
        .eq("student_id", studentId)
        .eq("exam_id", examId);

    if (error) {
        console.error(error);
        return [];
    }

    return data || [];
}

/* ==========================================================
   CALCULATE TOTALS
========================================================== */

export function calculateTotals(marks) {

    let obtained = 0;
    let maximum = 0;

    marks.forEach(mark => {

        obtained += Number(mark.marks_obtained || 0);
        maximum += Number(mark.max_marks || 0);

    });

    return {

        obtained,
        maximum

    };

}

/* ==========================================================
   CALCULATE PERCENTAGE
========================================================== */

export function calculatePercentage(obtained, maximum) {

    if (maximum === 0)
        return 0;

    return Number(

        ((obtained / maximum) * 100)

        .toFixed(2)

    );

}
/* ==========================================================
   CALCULATE GRADE
========================================================== */

export function calculateGrade(

    percentage,

    gradingScale

){

    for(const grade of gradingScale){

        if(

            percentage >= grade.minimum_percentage &&

            percentage <= grade.maximum_percentage

        ){

            return grade.grade;

        }

    }

    return "NA";

}

/* ==========================================================
   PASS / FAIL
========================================================== */

export function calculateResult(

    percentage,

    passingPercentage=33

){

    return percentage>=passingPercentage

    ? "Pass"

    : "Fail";

}
/* ==========================================================
   PROCESS RESULT
========================================================== */

export async function processResult({

    studentId,

    examId

}){

    const marks=

    await loadStudentMarks(

        studentId,

        examId

    );

    const gradingScale=

    await loadGradingScale();

    const totals=

    calculateTotals(marks);

    const percentage=

    calculatePercentage(

        totals.obtained,

        totals.maximum

    );

    const grade=

    calculateGrade(

        percentage,

        gradingScale

    );

    const result=

    calculateResult(

        percentage

    );

    return{

        total_marks:

        totals.obtained,

        max_marks:

        totals.maximum,

        percentage,

        overall_grade:grade,

        result,

        marks

    };

}
