/* ==========================================================
   RAS MARKFEEDER ERP
   ALERT UTILITIES
========================================================== */

/* ==========================================================
   SHOW TOAST
========================================================== */

export function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = `ras-toast ${type}`;

    toast.innerHTML = `

        <span>${message}</span>

    `;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}

/* ==========================================================
   SHORTCUTS
========================================================== */

export function success(message) {

    showToast(message, "success");

}

export function error(message) {

    showToast(message, "error");

}

export function warning(message) {

    showToast(message, "warning");

}

export function info(message) {

    showToast(message, "info");

}

