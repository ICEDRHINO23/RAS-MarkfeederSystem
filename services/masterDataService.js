/* ==========================================================
   RAS MARKFEEDER ERP
   MASTER DATA SERVICE
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   ACADEMIC YEARS
========================================================== */

export async function getAcademicYears() {

    const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .eq("active", true)
        .order("academic_year", { ascending: false });

    if (error) throw error;

    return data || [];

}

/* ==========================================================
   CLASSES
========================================================== */

export async function getClasses() {

    const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("active", true)
        .order("class_name")
        .order("section");

    if (error) throw error;

    return data || [];

}

/* ==========================================================
   SUBJECTS
========================================================== */

export async function getSubjects() {

    const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("active", true)
        .order("subject_name");

    if (error) throw error;

    return data || [];

}

/* ==========================================================
   EXAMS
========================================================== */

export async function getExams() {

    const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("active", true)
        .order("display_order");

    if (error) throw error;

    return data || [];

}

/* ==========================================================
   TEACHERS
========================================================== */

export async function getTeachers() {

    const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("active", true)
        .order("teacher_name");

    if (error) throw error;

    return data || [];

}

/* ==========================================================
   CLASS SECTIONS
========================================================== */

export async function getSections(classId) {

    const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId);

    if (error) throw error;

    return data || [];

}

/* ==========================================================
   POPULATE SELECT
========================================================== */

export function populateSelect(
    selectElement,
    data,
    valueField,
    textField,
    placeholder = "Select"
) {

    if (!selectElement) return;

    selectElement.innerHTML =
        `<option value="">${placeholder}</option>`;

    data.forEach(item => {

        selectElement.innerHTML += `

<option value="${item[valueField]}">

${item[textField]}

</option>

`;

    });

}

/* ==========================================================
   POPULATE CLASS SELECT
========================================================== */

export function populateClassSelect(
    selectElement,
    classes
) {

    if (!selectElement) return;

    selectElement.innerHTML =
        `<option value="">Select Class</option>`;

    classes.forEach(cls => {

        selectElement.innerHTML += `

<option value="${cls.id}">

${cls.class_name} ${cls.section}

</option>

`;

    });

}
