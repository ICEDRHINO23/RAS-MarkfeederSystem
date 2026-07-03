/* ==========================================================
   FILTER UTILITY
========================================================== */

export function filterData(data, filters) {

    return data.filter(item => {

        return Object.keys(filters).every(key => {

            if (!filters[key]) return true;

            return String(item[key]) === String(filters[key]);

        });

    });

}
