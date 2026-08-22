"use strict";

/* =====================================================
   AL-KHAWARIZMI - HOME.JS
   Student Dashboard + Student Avatar
===================================================== */

let supabaseClient = null;
let currentUser = null;
let currentStudent = null;


/* =====================================================
   START
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    try {

        if (!window.supabaseClient) {
            throw new Error(
                "Supabase غير متصل. تأكد من تحميل supabase.js"
            );
        }

        supabaseClient = window.supabaseClient;


        /* =============================================
           SESSION
        ============================================= */

        const {
            data: sessionData,
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (sessionError) {
            throw sessionError;
        }


        if (!sessionData?.session) {

            window.location.href = "auth.html";

            return;
        }


        currentUser = sessionData.session.user;


        /* =============================================
           LOAD STUDENT
        ============================================= */

        const {
            data: student,
            error: studentError
        } = await supabaseClient
            .from("students")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();


        if (studentError) {

            console.error(
                "STUDENT ERROR:",
                studentError
            );

            throw studentError;
        }


        currentStudent = student || {};


        /* =============================================
           DISPLAY STUDENT
        ============================================= */

        displayStudent(currentStudent);


        /* =============================================
           RESULTS
        ============================================= */

        await loadResults();


        /* =============================================
           BUTTONS
        ============================================= */

        setupButtons();


        /* =============================================
           SHOW PAGE
        ============================================= */

        const loading =
            document.getElementById("loading");

        const content =
            document.getElementById("content");


        if (loading) {
            loading.style.display = "none";
        }

        if (content) {
            content.style.display = "block";
        }


    } catch (error) {

        console.error(
            "HOME ERROR:",
            error
        );


        const loading =
            document.getElementById("loading");

        if (loading) {
            loading.style.display = "none";
        }


        const content =
            document.getElementById("content");

        if (content) {
            content.style.display = "block";
        }


        showError(
            error.message ||
            "حدث خطأ أثناء تحميل بيانات الطالب."
        );

    }

});


/* =====================================================
   DISPLAY STUDENT
===================================================== */

function displayStudent(student) {


    /* =============================================
       NAME
    ============================================= */

    const name =
        student.full_name ||
        student.name ||
        student.student_name ||
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        "الطالب";


    /* =============================================
       EMAIL
    ============================================= */

    const email =
        student.email ||
        currentUser.email ||
        "—";


    /* =============================================
       PHONE
    ============================================= */

    const phone =
        student.phone ||
        student.phone_number ||
        currentUser.user_metadata?.phone ||
        "—";


    /* =============================================
       PARENT PHONE
    ============================================= */

    const parentPhone =
        student.parent_phone ||
        "—";


    /* =============================================
       GRADE
    ============================================= */

    const grade =
        student.grade ||
        student.class ||
        student.grade_name ||
        "—";


    /* =============================================
       GOVERNORATE
    ============================================= */

    const governorate =
        student.governorate ||
        student.province ||
        "—";


    /* =============================================
       CITY
    ============================================= */

    const city =
        student.city ||
        "—";


    /* =============================================
       SCHOOL
    ============================================= */

    const school =
        student.school ||
        "—";


    /* =============================================
       TEXT
    ============================================= */

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


    /* =============================================
       STUDENT IMAGE
    ============================================= */

    loadStudentAvatar(student);

}


/* =====================================================
   LOAD STUDENT AVATAR
===================================================== */

async function loadStudentAvatar(student) {

    const image =
        document.getElementById(
            "studentAvatar"
        );


    if (!image) {

        console.error(
            "studentAvatar غير موجود في home.html"
        );

        return;
    }


    /*
       الصورة الموجودة في قاعدة البيانات
    */

    let avatarValue =
        student.avatar_url ||
        student.photo_url ||
        student.image_url ||
        currentUser.user_metadata?.avatar_url ||
        "";


    console.log(
        "DATABASE AVATAR:",
        avatarValue
    );


    /* =============================================
       NO IMAGE
    ============================================= */

    if (
        !avatarValue ||
        String(avatarValue).trim() === ""
    ) {

        image.src = "teacher.png";

        return;
    }


    avatarValue =
        String(avatarValue).trim();


    /* =============================================
       لو محفوظ رابط كامل
    ============================================= */

    if (
        avatarValue.startsWith("http://") ||
        avatarValue.startsWith("https://")
    ) {

        setImage(
            image,
            avatarValue
        );

        return;
    }


    /* =============================================
       لو محفوظ Path فقط
       
       مثال:
       USER_ID/profile-123.jpg
    ============================================= */

    try {

        const {
            data
        } =
            supabaseClient
                .storage
                .from("avatars")
                .getPublicUrl(
                    avatarValue
                );


        const publicUrl =
            data?.publicUrl;


        console.log(
            "GENERATED AVATAR URL:",
            publicUrl
        );


        if (publicUrl) {

            setImage(
                image,
                publicUrl
            );

            return;
        }


    } catch (error) {

        console.error(
            "PUBLIC URL ERROR:",
            error
        );

    }


    image.src =
        "teacher.png";
}


/* =====================================================
   SET IMAGE
===================================================== */

function setImage(image, url) {

    if (!url) {

        image.src =
            "teacher.png";

        return;
    }


    console.log(
        "LOADING STUDENT IMAGE:",
        url
    );


    image.onerror =
        function () {

            console.error(
                "IMAGE FAILED:",
                url
            );


            /*
               نجرب الرابط مرة واحدة
               بدون Cache
            */

            if (
                !image.dataset.retry
            ) {

                image.dataset.retry = "1";

                image.src =
                    url +
                    (
                        url.includes("?")
                            ? "&"
                            : "?"
                    ) +
                    "v=" +
                    Date.now();

                return;
            }


            /*
               لو فشل نهائيًا
            */

            image.src =
                "teacher.png";

        };


    image.onload =
        function () {

            console.log(
                "✅ STUDENT IMAGE LOADED"
            );

        };


    image.src =
        url;
}


/* =====================================================
   RESULTS
===================================================== */

async function loadResults() {

    const resultsBox =
        document.getElementById(
            "results"
        );


    if (!resultsBox) {
        return;
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

        console.warn(
            "RESULTS ERROR:",
            error.message
        );


        resultsBox.innerHTML = `

            <div class="empty">
                لا توجد نتائج حتى الآن.
            </div>

        `;


        updateStats([]);

        return;
    }


    const results =
        data || [];


    displayResults(
        results
    );


    updateStats(
        results
    );
}


/* =====================================================
   DISPLAY RESULTS
===================================================== */

function displayResults(results) {

    const box =
        document.getElementById(
            "results"
        );


    if (!box) return;


    if (!results.length) {

        box.innerHTML = `

            <div class="empty">
                📝 لم تدخل أي اختبار حتى الآن
            </div>

        `;

        return;
    }


    box.innerHTML = "";


    results.forEach(result => {

        const examName =
            result.exam_name ||
            result.test_name ||
            result.title ||
            "اختبار";


        const score =
            Number(
                result.score ??
                result.mark ??
                0
            );


        const total =
            Number(
                result.total_score ??
                result.total ??
                result.max_score ??
                0
            );


        let percentage = 0;


        if (
            result.percentage !== null &&
            result.percentage !== undefined
        ) {

            percentage =
                Number(
                    result.percentage
                );

        } else if (
            total > 0
        ) {

            percentage =
                (score / total) * 100;
        }


        const date =
            result.created_at ||
            result.submitted_at ||
            result.date ||
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
                    ${escapeHTML(examName)}
                </div>

                <div class="result-date">
                    ${escapeHTML(
                        formatDate(date)
                    )}
                </div>

            </div>

            <div class="score">
                ${Math.round(percentage)}%
            </div>

        `;


        box.appendChild(row);

    });

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStats(results) {

    let total = 0;

    let best = 0;


    results.forEach(result => {

        const score =
            Number(
                result.score ??
                result.mark ??
                0
            );


        const max =
            Number(
                result.total_score ??
                result.total ??
                result.max_score ??
                0
            );


        let percentage = 0;


        if (
            result.percentage !== null &&
            result.percentage !== undefined
        ) {

            percentage =
                Number(
                    result.percentage
                );

        } else if (max > 0) {

            percentage =
                (score / max) * 100;
        }


        if (
            Number.isFinite(
                percentage
            )
        ) {

            total += percentage;

            if (
                percentage > best
            ) {

                best = percentage;

            }

        }

    });


    const average =
        results.length
            ? total / results.length
            : 0;


    setText(
        "testsCount",
        results.length
    );


    setText(
        "completedCount",
        results.length
    );


    setText(
        "averageScore",
        Math.round(average) + "%"
    );


    setText(
        "bestScore",
        Math.round(best) + "%"
    );

}


/* =====================================================
   BUTTONS
===================================================== */

function setupButtons() {


    /* =============================================
       EDIT
    ============================================= */

    const editBtn =
        document.getElementById(
            "editBtn"
        );


    if (editBtn) {

        editBtn.onclick =
            function () {

                window.location.href =
                    "edit-profile.html";

            };

    }


    /* =============================================
       LOGOUT
    ============================================= */

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.onclick =
            async function () {


                logoutBtn.disabled =
                    true;


                logoutBtn.textContent =
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


                    logoutBtn.disabled =
                        false;


                    logoutBtn.textContent =
                        "تسجيل الخروج";


                    alert(
                        "حدث خطأ أثناء تسجيل الخروج."
                    );


                    return;
                }


                window.location.href =
                    "auth.html";

            };

    }

}


/* =====================================================
   SET TEXT
===================================================== */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.textContent =
        value !== null &&
        value !== undefined &&
        value !== ""
            ? value
            : "—";
}


/* =====================================================
   DATE
===================================================== */

function formatDate(date) {

    if (!date) {
        return "—";
    }


    try {

        return new Date(date)
            .toLocaleDateString(
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
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}
