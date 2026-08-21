// =====================================================
// SUPABASE CONNECTION - AL KHAWARIZMI
// =====================================================

const SUPABASE_URL =
    "https://fdqolsygigqukejlwcon.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_fO1Xb-dtqq8rnGuvXcPahg_zz9WeW9x";

window.supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );
