import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://tdrkhigqryojycordmja.supabase.co";

const SUPABASE_ANON_KEY =
"PASTE_YOUR_FULL_sb_publishable_KEY_HERE";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
