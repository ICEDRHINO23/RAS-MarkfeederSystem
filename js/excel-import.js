/* ==========================================================
   RAS MARKFEEDER ERP
   EXCEL IMPORT
========================================================== */

import { supabase } from "../database/supabase.js";

const fileInput =
    document.getElementById("excelFile");

const importBtn =
    document.getElementById("importExcelBtn");

importBtn.addEventListener("click", () => {

    fileInput.click();

});

fileInput.addEventListener("change", readExcel);

/* ==========================================================
   READ EXCEL
========================================================== */

function readExcel(e) {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        const data = new Uint8Array(event.target.result);

        const workbook =
            XLSX.read(data, {
                type:"array"
            });

        const sheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const students =
            XLSX.utils.sheet_to_json(sheet);

        console.log(students);

        previewStudents(students);

    };

    reader.readAsArrayBuffer(file);

}

/* ==========================================================
   PREVIEW
========================================================== */

function previewStudents(students){

    alert(

        `${students.length} students found in Excel.`

    );

}
