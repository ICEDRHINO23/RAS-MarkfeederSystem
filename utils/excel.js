// ==========================================
// RAS ERP - Excel Utility
// ==========================================

export function exportStudentsToExcel(students, fileName = "Students.xlsx") {

    if (!students || students.length === 0) {

        alert("No students found to export.");

        return;

    }

    const rows = [];

    // ==========================================
    // HEADER
    // ==========================================

    rows.push(["ACADEMIC HEIGHTS PUBLIC SCHOOL"]);
    rows.push(["RAS MARKFEEDER ERP"]);
    rows.push(["Student Master Report"]);
    rows.push([
        "Generated On :",
        new Date().toLocaleString()
    ]);

    rows.push([]);

    // ==========================================
    // COLUMN HEADERS
    // ==========================================

    rows.push([
        "Admission No",
        "Roll No",
        "Student Name",
        "Gender",
        "Class",
        "Section",
        "Academic Year",
        "Date of Birth",
        "Father Name",
        "Mother Name",
        "Mobile",
        "Address",
        "Status"
    ]);

    // ==========================================
    // DATA
    // ==========================================

    students.forEach(student => {

        rows.push([

            student.admission_no,

            student.roll_no,

            student.student_name,

            student.gender,

            student.class_grade,

            student.section,

            student.academic_year,

            student.dob || "",

            student.father_name || "",

            student.mother_name || "",

            student.mobile || "",

            student.address || "",

            student.active ? "Active" : "Inactive"

        ]);

    });

    // ==========================================
    // CREATE WORKBOOK
    // ==========================================

    const workbook = XLSX.utils.book_new();

    const worksheet =
        XLSX.utils.aoa_to_sheet(rows);

    // ==========================================
    // COLUMN WIDTHS
    // ==========================================

    worksheet["!cols"] = [

        { wch: 18 },
        { wch: 10 },
        { wch: 30 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 16 },
        { wch: 15 },
        { wch: 25 },
        { wch: 25 },
        { wch: 18 },
        { wch: 40 },
        { wch: 12 }

    ];

    // ==========================================
    // FREEZE HEADER
    // ==========================================

    worksheet["!freeze"] = {
        xSplit: 0,
        ySplit: 6
    };

    // ==========================================
    // AUTO FILTER
    // ==========================================

    worksheet["!autofilter"] = {
        ref: "A6:M6"
    };

    // ==========================================
    // ADD SHEET
    // ==========================================

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Students"

    );

    // ==========================================
    // DOWNLOAD
    // ==========================================

    XLSX.writeFile(

        workbook,

        fileName

    );

}
