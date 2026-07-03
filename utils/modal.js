/* ==========================================================
   RAS MARKFEEDER ERP
   MODAL UTILITIES
========================================================== */

/* ==========================================================
   OPEN MODAL
========================================================== */

export function openModal(modal) {

    if (!modal) return;

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

}

/* ==========================================================
   CLOSE MODAL
========================================================== */

export function closeModal(modal) {

    if (!modal) return;

    modal.classList.remove("show");

    document.body.style.overflow = "";

}

/* ==========================================================
   CLOSE ON OUTSIDE CLICK
========================================================== */

export function enableOutsideClick(modal) {

    window.addEventListener("click", (e) => {

        if (e.target === modal) {

            closeModal(modal);

        }

    });

}

/* ==========================================================
   ESC KEY SUPPORT
========================================================== */

export function enableEscape(modal) {

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            closeModal(modal);

        }

    });

}

/* ==========================================================
   INITIALIZE MODAL
========================================================== */

export function initializeModal(modal) {

    enableOutsideClick(modal);

    enableEscape(modal);

}
