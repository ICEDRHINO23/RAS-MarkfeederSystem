import { supabase } from "../database/supabase.js";

export async function requireAuth(requiredRole = null) {

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        window.location.href = "../login.html";
        return null;
    }

    const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", data.user.id)
        .single();

    if (profileError || !profile) {
        await supabase.auth.signOut();
        window.location.href = "../login.html";
        return null;
    }

    if (!profile.active) {
        alert("Your account has been disabled.");
        await supabase.auth.signOut();
        window.location.href = "../login.html";
        return null;
    }

    if (requiredRole && profile.role !== requiredRole) {
        alert("Access denied.");
        window.location.href = "../login.html";
        return null;
    }

    return profile;
}
