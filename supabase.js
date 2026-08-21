// =====================================================
// SUPABASE CONNECTION - AL KHAWARIZMI
// =====================================================

(function () {

    "use strict";

    // ================================
    // SUPABASE DATA
    // ================================

    const SUPABASE_URL =
        "https://fdqolsygigqukejlwcon.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_fO1Xb-dtqq8rnGuvXcPahg_zz9WeW9x;


    // ================================
    // CHECK SUPABASE LIBRARY
    // ================================

    if (!window.supabase) {

        console.error(
            "Supabase library لم يتم تحميلها."
        );

        return;

    }


    // ================================
    // CREATE CLIENT
    // ================================

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    // ================================
    // READY
    // ================================

    console.log(
        "Supabase connected successfully."
    );

})();
