import { supabase } from "../database/supabase.js";

const form = document.getElementById("loginForm");
const error = document.getElementById("error");
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

// Show / Hide Password
togglePassword.addEventListener("click", () => {
    password.type =
        password.type === "password"
            ? "text"
            : "password";
});

// Login
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    error.textContent = "";

    const email = document.getElementById("email").value.trim();
    const pass = password.value;

    const { data, error: loginError } =
        await supabase.auth.signInWithPassword({

            email,
            password: pass

        });

    if (loginError) {

        error.textContent = loginError.message;
        return;

    }

    const { data: userData, error: dbError } =
        await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", data.user.id)
            .single();

    if (dbError) {

        error.textContent = "User profile not found.";
        await supabase.auth.signOut();
        return;

    }

    localStorage.setItem(
        "user",
        JSON.stringify(userData)
    );

    window.location.href = "admin/index.html";

});
