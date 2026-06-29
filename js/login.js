import { login } from "../database/auth.js";

const form = document.getElementById("loginForm");
const errorDiv = document.getElementById("error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorDiv.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        await login(email, password);

        window.location.href = "admin/index.html";

    } catch (err) {

        console.error(err);

        errorDiv.textContent = err.message;

    }

});
