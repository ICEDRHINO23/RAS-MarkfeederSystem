/* ==========================================================
   RAS MARKFEEDER ERP
   AUTH SERVICE
========================================================== */

import { supabase } from "../database/supabase.js";

/* ==========================================================
   LOGIN
========================================================== */

export async function login(email, password) {

    const { data, error } =
        await supabase.auth.signInWithPassword({

            email,
            password

        });

    if (error) throw error;

    return data.user;

}

/* ==========================================================
   LOGOUT
========================================================== */

export async function logout() {

    const { error } =
        await supabase.auth.signOut();

    if (error) throw error;

    window.location.href = "../login.html";

}

/* ==========================================================
   CURRENT AUTH USER
========================================================== */

export async function getCurrentAuthUser() {

    const {

        data: { user },

        error

    } = await supabase.auth.getUser();

    if (error) throw error;

    return user;

}

/* ==========================================================
   ERP USER PROFILE
========================================================== */

export async function getCurrentUser() {

    const authUser =
        await getCurrentAuthUser();

    if (!authUser) return null;

    const { data, error } = await supabase

        .from("users")

        .select("*")

        .eq("auth_user_id", authUser.id)

        .single();

    if (error) throw error;

    return data;

}

/* ==========================================================
   CURRENT TEACHER
========================================================== */

export async function getCurrentTeacher() {

    const user =
        await getCurrentUser();

    if (!user) return null;

    const { data, error } = await supabase

        .from("teachers")

        .select("*")

        .eq("id", user.teacher_id)

        .single();

    if (error) throw error;

    return data;

}

/* ==========================================================
   ROLE
========================================================== */

export async function getCurrentRole() {

    const user =
        await getCurrentUser();

    return user?.role || null;

}

/* ==========================================================
   ROLE CHECK
========================================================== */

export async function hasRole(role) {

    const currentRole =
        await getCurrentRole();

    return currentRole === role;

}

/* ==========================================================
   REQUIRE LOGIN
========================================================== */

export async function requireLogin() {

    const authUser =
        await getCurrentAuthUser();

    if (!authUser) {

        window.location.href =
            "../login.html";

        return false;

    }

    return true;

}

/* ==========================================================
   REQUIRE ROLE
========================================================== */

export async function requireRole(role) {

    const ok =
        await hasRole(role);

    if (!ok) {

        alert("Access Denied");

        window.location.href =
            "../admin/dashboard.html";

        return false;

    }

    return true;

}

/* ==========================================================
   SESSION
========================================================== */

export async function refreshSession() {

    const {

        data,

        error

    } = await supabase.auth.refreshSession();

    if (error) throw error;

    return data;

}
