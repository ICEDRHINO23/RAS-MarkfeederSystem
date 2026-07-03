/* ==========================================================
   RAS MARKFEEDER ERP
   VALIDATION UTILITIES
========================================================== */

/* ==========================================================
   REQUIRED
========================================================== */

export function required(value) {

    return value !== null &&
           value !== undefined &&
           value.toString().trim() !== "";

}

/* ==========================================================
   EMAIL
========================================================== */

export function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}

/* ==========================================================
   MOBILE
========================================================== */

export function validMobile(number) {

    return /^[6-9]\d{9}$/
        .test(number);

}

/* ==========================================================
   NUMBER RANGE
========================================================== */

export function inRange(value, min, max) {

    const num = Number(value);

    return num >= min &&
           num <= max;

}

/* ==========================================================
   EMPTY CHECK
========================================================== */

export function isEmpty(value) {

    return value.trim() === "";

}

/* ==========================================================
   FIELD ERROR
========================================================== */

export function fieldError(input, message) {

    input.classList.add("input-error");

    input.focus();

    throw new Error(message);

}

/* ==========================================================
   CLEAR ERROR
========================================================== */

export function clearErrors() {

    document

        .querySelectorAll(".input-error")

        .forEach(el => {

            el.classList.remove("input-error");

        });

}
