import { supabase } from "./supabase.js";

// ===============================
// LOGIN
// ===============================

export async function login(username, password) {

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

    if (error || !data) {
        throw new Error("Invalid username");
    }

    // Temporary password check
    // Later we'll use proper password hashing.
    if (data.password_hash !== password) {
        throw new Error("Incorrect password");
    }

    localStorage.setItem("user", JSON.stringify(data));

    return data;
}

// ===============================
// LOGOUT
// ===============================

export function logout() {
    localStorage.removeItem("user");
    window.location.href = "/login.html";
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
    return localStorage.getItem("user") !== null;
}
