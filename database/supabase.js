import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://tdrkhigqryojycordmja.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_H3j9OiFj9ASHLJQmc1GGGQ_kkFY_l5h";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
