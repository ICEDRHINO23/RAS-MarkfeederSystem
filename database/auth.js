import { supabase } from "./supabase.js";

// ===============================
// LOGIN
// ===============================

export async function login(email, password) {

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
            email,
            password
        });

    if (authError) throw authError;

    // Get user profile from users table
    const { data: profile, error: profileError } =
        await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", authData.user.id)
            .maybeSingle();

    if (profileError) throw profileError;

    localStorage.setItem("user", JSON.stringify(profile));
    localStorage.setItem("session", JSON.stringify(authData.session));

    return profile;
}

// ===============================
// LOGOUT
// ===============================

export async function logout() {

    await supabase.auth.signOut();

    localStorage.removeItem("user");
    localStorage.removeItem("session");

    window.location.href = "../login.html";
}

// ===============================
// CURRENT USER
// ===============================

export function currentUser() {
    return JSON.parse(localStorage.getItem("user"));
}

// ===============================
// LOGIN CHECK
// ===============================

export function isLoggedIn() {
    return localStorage.getItem("session") !== null;
}
