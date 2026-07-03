
import { supabase } from "../database/supabase.js";

/* ==========================================
   LOAD DATA
========================================== */

export async function loadData(table, select = "*") {

    const { data, error } = await supabase
        .from(table)
        .select(select);

    if (error) throw error;

    return data;

}

/* ==========================================
   INSERT
========================================== */

export async function insertData(table, payload) {

    const { error } = await supabase
        .from(table)
        .insert([payload]);

    if (error) throw error;

}

/* ==========================================
   UPDATE
========================================== */

export async function updateData(table, id, payload) {

    const { error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id);

    if (error) throw error;

}

/* ==========================================
   DELETE
========================================== */

export async function deleteData(table, id) {

    const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

    if (error) throw error;

}
