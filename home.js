/* =====================================================
   AL-KHAWARIZMI - HOME.JS
   Student Dashboard
   + Student Profile Image
===================================================== */

"use strict";


/* =====================================================
   GLOBAL
===================================================== */

let supabaseClient = null;
let currentUser = null;
let currentStudent = null;


/* =====================================================
   HELPERS
===================================================== */

function getElement(id) {
    return document.getElementById(id);
}


function setText(id, value) {

    const element = getElement(id);

    if (!element) return;

    element.textContent =
        value !== null &&
        value !== undefined &&
        value !== ""
            ? value
            : "—";
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatDate(date) {

    if (!date) return "—";

    try {

        return new Date(date).toLocaleDateString(
            "ar-EG",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    } catch {

        return "—";

    }
}


/* =====================================================
   SHOW ERROR
===================================================== */

function showError(message) {

    const box =
        getElement("errorBox");

    if (!box) {

        console.error(message);

        return;

    }

    box.textContent = message;

    box.style.display = "block";
}


/* =====================================================
   HIDE ERROR
===================================================== */

function hideError() {

    const box =
        getElement("errorBox");

    if (!box) return;

    box.style.display = "none";
}


/* =====================================================
   SET STUDENT IMAGE
===================================================== */

function setStudentImage(url) {

    const image =
        getElement("studentAvatar");

    if (!image) return;


    /*
       لو عند الطالب صورة
       نعرضها
    */

    if (url && String(url).trim() !== "") {

        image.src = url;

    } else {

        /*
           لو مفيش صورة
           الصورة الافتراضية
        */

        image.src = "teacher.png";

    }


    /*
       لو الرابط غير صالح
       استخدم الصورة الافتراضية
    */

    image.onerror = function () {

        if (image.dataset.fallback === "1") {
            return;
        }

        image.dataset.fallback = "1";

        image.src = "teacher.png";

    };

}


/* =====================================================
   LOAD SESSION
===================================================== */

async function loadSession() {

    if (!window.supabaseClient) {

        throw new Error(
            "Supabase غير متصل. تأكد من تحميل supabase.js قبل home.js."
        );

    }


    supabaseClient =
        window.supabaseClient;


    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (error) {

        throw error;

    }


    if (!data || !data.session) {

        window.location.href =
            "auth.html";

        return null;

    }


    currentUser =
        data.session.user;


    return currentUser;
}


/* =====================================================
   LOAD STUDENT
===================================================== */

async function loadStudent() {

    /*
       أولاً نحاول students
    */

    const {
        data,
        error
    } =
        await supabaseClient
            .from("students")
            .select("*")
            .eq(
                "id",
                currentUser.id
            )
            .maybeSingle();


    if (!error && data) {

        currentStudent = data;

        return data;

    }


    /*
       لو students مش موجود
       نحاول profiles
    */

    const profileResult =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq(
                "id",
                currentUser.id
            )
            .maybeSingle();


    if (
        !profileResult.error &&
        profileResult.data
    ) {

        currentStudent =
            profileResult.data;

        return profileResult.data;

    }


    /*
       لو مفيش بيانات
       استخدم بيانات Auth
    */

    currentStudent = {

        id: currentUser.id,

        email:
            currentUser.email || "",

        full_name:
            currentUser.user_metadata
                ?.full_name
            ||
            currentUser.user_metadata
                ?.name
            ||
            "الطالب",

        phone:
            currentUser.user_metadata
                ?.phone
            ||
            "",

        avatar_url:
            currentUser.user_metadata
                ?.avatar_url
            ||
            ""

    };


    return currentStudent;
}


/* =====================================================
   DISPLAY STUDENT
===================================================== */

function displayStudent(student) {


    /* =========================
       NAME
    ========================= */

    const name =
        student.full_name
        ||
        student.name
        ||
        student.student_name
        ||
        currentUser.user_metadata
            ?.full_name
        ||
        currentUser.user_metadata
            ?.name
        ||
        "الطالب";


    /* =========================
       EMAIL
    ========================= */

    const email =
        student.email
        ||
        currentUser.email
        ||
        "—";


    /* =========================
       PHONE
    ========================= */

    const phone =
        student.phone
        ||
        student.phone_number
        ||
        currentUser.user_metadata
            ?.phone
        ||
        "—";


    /* =========================
       PARENT PHONE
    ========================= */

    const parentPhone =
        student.parent_phone
        ||
        student.parentPhone
        ||
        "—";


    /* =========================
       GRADE
    ========================= */

    const grade =
        student.grade
        ||
        student.class
        ||
        student.grade_name
        ||
        "—";


    /* =========================
       GOVERNORATE
    ========================= */

    const governorate =
        student.governorate
        ||
        student.province
        ||
        "—";


    /* =========================
       CITY
    ========================= */

    const city =
        student.city
        ||
        "—";


    /* =========================
       SCHOOL
    ========================= */

    const school =
        student.school
        ||
        "—";


    /* =================================================
       STUDENT IMAGE
    =================================================

       أهم جزء:

       avatar_url
       photo_url
       image_url

       ثم Auth metadata
    */

    const avatarUrl =
        student.avatar_url
        ||
        student.photo_url
        ||
        student.image_url
        ||
        currentUser.user_metadata
            ?.avatar_url
        ||
        currentUser.user_metadata
            ?.photo_url
        ||
        "";


    /*
       عرض صورة الطالب
    */

    setStudentImage(
        avatarUrl
    );


    /* =========================
       TEXT
    ========================= */

    setText(
        "studentName",
        name
    );


    setText(
        "studentEmail",
        email
    );


    setText(
        "fullName",
        name
    );


    setText(
        "email",
        email
    );


    setText(
        "phone",
        phone
    );


    setText(
        "parentPhone",
        parentPhone
    );


    setText(
        "grade",
        grade
    );


    setText(
        "governorate",
        governorate
    );


    setText(
        "city",
        city
    );


    setText(
        "school",
        school
    );


    setText(
        "createdAt",
        formatDate(
            currentUser.created_at
        )
    );

}


/* =====================================================
   LOAD RESULTS
===================================================== */

async function loadResults() {

    const resultsContainer =
        getElement("results");


    /*
       لو عنصر النتائج مش موجود
       نتخطى
    */

    if (!resultsContainer) {

        return [];

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("results")
            .select("*")
            .eq(
                "student_id",
                currentUser.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        /*
           لو جدول النتائج غير موجود
           لا نوقف الصفحة كلها
        */

        console.warn(
            "RESULTS ERROR:",
            error.message
        );


        resultsContainer.innerHTML = `

            <div class="empty">
                لا توجد نتائج حتى الآن.
            </div>

        `;


        updateStats([]);

        return [];

    }


    const results =
        data || [];


    displayResults(
        results
    );


    updateStats(
        results
    );


    return results;
}


/* =====================================================
   DISPLAY RESULTS
===================================================== */

function displayResults(results) {

    const container =
        getElement("results");


    if (!container) return;


    if (!results.length) {

        container.innerHTML = `

            <div class="empty">
                📝 لم تدخل أي اختبار حتى الآن
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    results.forEach(
        result => {


            const examName =
                result.exam_name
                ||
                result.test_name
                ||
                result.title
                ||
                result.name
                ||
                "اختبار";


            const score =
                Number(
                    result.score
                    ??
                    result.mark
                    ??
                    0
                );


            const total =
                Number(
                    result.total_score
                    ??
                    result.total
                    ??
                    result.max_score
                    ??
                    0
                );


            let percentage;


            if (
                result.percentage !==
                null
                &&
                result.percentage !==
                undefined
            ) {

                percentage =
                    Number(
                        result.percentage
                    );

            }

            else if (
                total > 0
            ) {

                percentage =
                    (
                        score /
                        total
                    ) * 100;

            }

            else {

                percentage = 0;

            }


            const date =
                result.created_at
                ||
                result.submitted_at
                ||
                result.date
                ||
                "";


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "result";


            row.innerHTML = `

                <div>

                    <div class="result-name">
                        ${escapeHTML(
                            examName
                        )}
                    </div>

                    <div class="result-date">
                        ${escapeHTML(
                            formatDate(date)
                        )}
                    </div>

                </div>

                <div class="score">
                    ${Math.round(
                        percentage
                    )}%
                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =====================================================
   UPDATE STATISTICS
===================================================== */

function updateStats(results) {

    const count =
        results.length;


    let totalPercentage =
        0;


    let bestPercentage =
        0;


    results.forEach(
        result => {


            const score =
                Number(
                    result.score
                    ??
                    result.mark
                    ??
                    0
                );


            const total =
                Number(
                    result.total_score
                    ??
                    result.total
                    ??
                    result.max_score
                    ??
                    0
                );


            let percentage = 0;


            if (
                result.percentage !==
                null
                &&
                result.percentage !==
                undefined
            ) {

                percentage =
                    Number(
                        result.percentage
                    );

            }

            else if (
                total > 0
            ) {

                percentage =
                    (
                        score /
                        total
                    ) * 100;

            }


            if (
                !Number.isFinite(
                    percentage
                )
            ) {

                percentage = 0;

            }


            totalPercentage +=
                percentage;


            if (
                percentage >
                bestPercentage
            ) {

                bestPercentage =
                    percentage;

            }

        }
    );


    const average =
        count > 0
            ?
            totalPercentage / count
            :
            0;


    setText(
        "testsCount",
        count
    );


    setText(
        "completedCount",
        count
    );


    setText(
        "averageScore",
        Math.round(
            average
        ) + "%"
    );


    setText(
        "bestScore",
        Math.round(
            bestPercentage
        ) + "%"
    );

}


/* =====================================================
   EDIT PROFILE
===================================================== */

function setupEditButton() {

    const button =
        getElement("editBtn");


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            window.location.href =
                "edit-profile.html";

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

function setupLogout() {

    const button =
        getElement("logoutBtn");


    if (!button) return;


    button.addEventListener(
        "click",
        async () => {


            button.disabled =
                true;


            button.textContent =
                "جاري تسجيل الخروج...";


            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            if (error) {

                console.error(
                    error
                );


                button.disabled =
                    false;


                button.textContent =
                    "تسجيل الخروج";


                alert(
                    "حدث خطأ أثناء تسجيل الخروج."
                );


                return;

            }


            window.location.href =
                "auth.html";

        }
    );

}


/* =====================================================
   REALTIME PROFILE IMAGE
===================================================== */

/*
   لو الطالب غير صورته من مكان آخر
   نعيد تحميل بياناته.
*/

function setupRealtime() {

    if (!currentUser) return;


    try {

        supabaseClient
            .channel(
                "student-profile-" +
                currentUser.id
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "students",
                    filter:
                        "id=eq." +
                        currentUser.id
                },
                payload => {

                    if (
                        payload &&
                        payload.new
                    ) {

                        currentStudent =
                            payload.new;


                        displayStudent(
                            currentStudent
                        );

                    }

                }
            )
            .subscribe();

    }

    catch(error) {

        console.warn(
            "Realtime unavailable:",
            error
        );

    }

}


/* =====================================================
   INIT
===================================================== */

async function initHome() {

    const loading =
        getElement("loading");


    const content =
        getElement("content");


    try {


        /* =========================
           SUPABASE
        ========================= */

        await loadSession();


        if (!currentUser) {

            return;

        }


        /* =========================
           STUDENT
        ========================= */

        const student =
            await loadStudent();


        /* =========================
           DISPLAY
        ========================= */

        displayStudent(
            student
        );


        /* =========================
           RESULTS
        ========================= */

        await loadResults();


        /* =========================
           BUTTONS
        ========================= */

        setupEditButton();

        setupLogout();


        /* =========================
           REALTIME
        ========================= */

        setupRealtime();


        /* =========================
           SHOW PAGE
        ========================= */

        if (loading) {

            loading.style.display =
                "none";

        }


        if (content) {

            content.style.display =
                "block";

        }


    }

    catch(error) {

        console.error(
            "HOME ERROR:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        if (content) {

            content.style.display =
                "block";

        }


        showError(
            error.message
            ||
            "حدث خطأ أثناء تحميل بيانات الحساب."
        );

    }

}


/* =====================================================
   START
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initHome
    );

}

else {

    initHome();

}
