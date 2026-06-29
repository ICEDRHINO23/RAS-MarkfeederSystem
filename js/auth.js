import { supabase } from "../database/supabase.js";

const form = document.getElementById("loginForm");
const errorText = document.getElementById("error");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

// Show / Hide Password
togglePassword.addEventListener("click", () => {
    passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
});

// Login
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorText.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    try {
        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", data.user.id)
            .single();

        if (profileError) throw profileError;

        localStorage.setItem("user", JSON.stringify(profile));

        if (profile.role === "Admin") {
            window.location.href = "admin/dashboard.html";
        } else if (profile.role === "Teacher") {
            window.location.href = "teacher/dashboard.html";
        } else {
            errorText.textContent = "No valid role assigned.";
        }

    } catch (err) {
        console.error(err);
        errorText.textContent = err.message;
    }
});
