
/* ==========================================================
   RAS MARKFEEDER ERP
   SEARCH UTILITY
========================================================== */

export function search(data, keyword, fields) {

    keyword = keyword.toLowerCase().trim();

    if (!keyword) return data;

    return data.filter(item =>

        fields.some(field =>

            String(item[field] || "")

                .toLowerCase()

                .includes(keyword)

        )

    );

}
