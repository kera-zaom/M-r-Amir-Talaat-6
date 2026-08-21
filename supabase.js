// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL =
    "https://fdqolsygigqukejlwcon.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_fO1Xb-dtqq8rnGuvXcPahg_zz9WeW9x";


// ========================================
// CREATE CLIENT
// ========================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        }
    );
