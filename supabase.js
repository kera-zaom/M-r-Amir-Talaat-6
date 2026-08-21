// =====================================================
// SUPABASE CONNECTION - AL KHAWARIZMI
// =====================================================

(function () {

    "use strict";

    const SUPABASE_URL =
        "https://fdqolsygigqukejlwcon.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_fO1Xb-dtqq8rnGuvXcPahg_zz9WeW9x";


    // =====================================================
    // CHECK LIBRARY
    // =====================================================

    if (!window.supabase) {

        console.error(
            "Supabase library is not loaded."
        );

        window.supabaseClient = null;

        return;
    }


    // =====================================================
    // CREATE CLIENT
    // =====================================================

    try {

        window.supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true,
                        storage: window.localStorage,
                        storageKey: "al-khwarizmi-auth",
                        flowType: "pkce"
                    }
                }
            );


        console.log(
            "Supabase connected successfully."
        );


    } catch (error) {

        console.error(
            "Supabase connection error:",
            error
        );

        window.supabaseClient = null;

    }


    // =====================================================
    // CHECK CONNECTION
    // =====================================================

    window.checkSupabase = function () {

        return !!window.supabaseClient;

    };


    // =====================================================
    // CURRENT USER
    // =====================================================

    window.getCurrentUser =
        async function () {

            if (!window.supabaseClient) {

                return {
                    user: null,
                    error: new Error(
                        "Supabase غير متصل."
                    )
                };

            }


            try {

                const {
                    data,
                    error
                } =
                    await window.supabaseClient
                        .auth
                        .getUser();


                return {

                    user:
                        data?.user || null,

                    error:
                        error || null

                };


            } catch (error) {

                return {

                    user: null,

                    error

                };

            }

        };


    // =====================================================
    // CURRENT SESSION
    // =====================================================

    window.getCurrentSession =
        async function () {

            if (!window.supabaseClient) {

                return {

                    session: null,

                    error: new Error(
                        "Supabase غير متصل."
                    )

                };

            }


            try {

                const {
                    data,
                    error
                } =
                    await window.supabaseClient
                        .auth
                        .getSession();


                return {

                    session:
                        data?.session || null,

                    error:
                        error || null

                };


            } catch (error) {

                return {

                    session: null,

                    error

                };

            }

        };


    // =====================================================
    // LOGOUT
    // =====================================================

    window.logoutUser =
        async function () {

            if (!window.supabaseClient) {

                return {

                    error: new Error(
                        "Supabase غير متصل."
                    )

                };

            }


            try {

                const {
                    error
                } =
                    await window.supabaseClient
                        .auth
                        .signOut();


                return {

                    error:
                        error || null

                };


            } catch (error) {

                return {

                    error

                };

            }

        };


    // =====================================================
    // AUTH STATE
    // =====================================================

    if (window.supabaseClient) {

        window.supabaseClient
            .auth
            .onAuthStateChange(
                function (event, session) {

                    console.log(
                        "AUTH:",
                        event,
                        session
                            ? "Session موجودة"
                            : "No session"
                    );

                }
            );

    }


    // =====================================================
    // EXPORT
    // =====================================================

    window.AL_KHAWARIZMI_SUPABASE = {

        url:
            SUPABASE_URL,

        connected:
            function () {

                return !!window.supabaseClient;

            }

    };

})();
