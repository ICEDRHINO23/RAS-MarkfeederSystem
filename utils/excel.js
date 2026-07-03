/* ==========================================================
   RAS MARKFEEDER ERP
   EXCEL EXPORT UTILITY
========================================================== */

/* ==========================================================
   EXPORT JSON TO EXCEL
========================================================== */

export function exportExcel(data, fileName = "Export") {

    if (!data || data.length === 0) {

        console.warn("No data to export.");

        return;

    }

    const worksheet =
        XLSX.utils.json_to_sheet(data);

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Sheet1"

    );

    XLSX.writeFile(

        workbook,

        `${fileName}.xlsx`

    );

}

/* ==========================================================
   EXPORT TABLE
========================================================== */

export function exportTable(tableId, fileName = "Export") {

    const table =
        document.getElementById(tableId);

    if (!table) return;

    const workbook =
        XLSX.utils.table_to_book(table);

    XLSX.writeFile(

        workbook,

        `${fileName}.xlsx`

    );

}

/* ==========================================================
   EXPORT WITH HEADERS
========================================================== */

export function exportCustom(headers, rows, fileName) {

    const worksheet =
        XLSX.utils.aoa_to_sheet([

            headers,

            ...rows

        ]);

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Sheet1"

    );

    XLSX.writeFile(

        workbook,

        `${fileName}.xlsx`

    );

}
