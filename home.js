"use strict";

let supabaseClient = null;
let currentUser = null;
let currentStudent = null;

document.addEventListener("DOMContentLoaded", initHome);

async function initHome() {
    try {

        if (!window.supabaseClient) {
            throw new Error("Supabase غير متصل");
        }

        supabaseClient = window.supabaseClient;

        const {
            data: sessionData,
            error: sessionError
        } = await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        if (!sessionData?.session) {
            location.href = "auth.html";
            return;
        }

        currentUser = sessionData.session.user;

        await loadStudent();

        await loadResults();

        setupButtons();

        const loading = document.getElementById("loading");
        const content = document.getElementById("content");

        if (loading) loading.style.display = "none";
        if (content) content.style.display = "block";

    } catch (error) {

        console.error(error);

        const loading = document.getElementById("loading");
        const content = document.getElementById("content");

        if (loading) loading.style.display = "none";
        if (content) content.style.display = "block";

        showError(error.message || "حدث خطأ");
    }
}


/* =====================================================
   STUDENT
===================================================== */

async function loadStudent() {

    const {
        data,
        error
    } = await supabaseClient
        .from("students")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (error) throw error;

    currentStudent = data || {};

    console.log("STUDENT DATA:", currentStudent);

    displayStudent(currentStudent);
}


/* =====================================================
   DISPLAY
===================================================== */

function displayStudent(student) {

    const name =
        student.full_name ||
        student.name ||
        currentUser.user_metadata?.full_name ||
        "الطالب";

    const email =
        currentUser.email ||
        student.email ||
        "—";

    setText("studentName", name);
    setText("studentEmail", email);

    setText("fullName", name);
    setText("email", email);

    setText(
        "phone",
        student.phone || "—"
    );

    setText(
        "parentPhone",
        student.parent_phone || "—"
    );

    setText(
        "grade",
        student.grade ||
        student.class ||
        "—"
    );

    setText(
        "governorate",
        student.governorate ||
        student.province ||
        "—"
    );

    setText(
        "city",
        student.city || "—"
    );

    setText(
        "school",
        student.school || "—"
    );

    setText(
        "createdAt",
        formatDate(currentUser.created_at)
    );

    loadAvatar(student);
}


/* =====================================================
   AVATAR
===================================================== */

async function loadAvatar(student) {

    const image =
        document.getElementById("studentAvatar");

    if (!image) {
        console.error(
            "studentAvatar غير موجود في home.html"
        );
        return;
    }

    let avatar =
        student.avatar_url ||
        "";

    console.log(
        "avatar_url من قاعدة البيانات:",
        avatar
    );


    /* -----------------------------------------------
       لا توجد صورة
    ------------------------------------------------ */

    if (!avatar || avatar.trim() === "") {

        image.src = "teacher.png";

        return;
    }


    avatar = avatar.trim();


    /* -----------------------------------------------
       لو الرابط كامل
    ------------------------------------------------ */

    if (
        avatar.startsWith("http://") ||
        avatar.startsWith("https://")
    ) {

        showAvatar(image, avatar);

        return;
    }


    /* -----------------------------------------------
       لو avatar_url عبارة عن path فقط
    ------------------------------------------------ */

    const {
        data
    } = supabaseClient
        .storage
        .from("avatars")
        .getPublicUrl(avatar);

    if (data?.publicUrl) {

        console.log(
            "رابط الصورة النهائي:",
            data.publicUrl
        );

        showAvatar(
            image,
            data.publicUrl
        );

        return;
    }


    image.src = "teacher.png";
}


/* =====================================================
   SHOW AVATAR
===================================================== */

function showAvatar(image, url) {

    image.onerror = function () {

        console.error(
            "فشل تحميل الصورة:",
            url
        );

        image.src = "teacher.png";
    };

    image.onload = function () {

        console.log(
            "✅ صورة الطالب ظهرت بنجاح"
        );
    };

    /*
       منع المتصفح من استخدام الصورة القديمة
    */

    const separator =
        url.includes("?")
            ? "&"
            : "?";

    image.src =
        url +
        separator +
        "v=" +
        Date.now();
}


/* =====================================================
   RESULTS
===================================================== */

async function loadResults() {

    const box =
        document.getElementById("results");

    if (!box) return;

    const {
        data,
        error
    } = await supabaseClient
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
            "تعذر تحميل النتائج:",
            error.message
        );

        box.innerHTML = `
            <div class="empty">
                لا توجد نتائج حتى الآن.
            </div>
        `;

        updateStats([]);

        return;
    }

    const results = data || [];

    displayResults(results);

    updateStats(results);
}


/* =====================================================
   RESULTS DISPLAY
===================================================== */

function displayResults(results) {

    const box =
        document.getElementById("results");

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

        const name =
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
                Number(result.percentage);

        } else if (total > 0) {

            percentage =
                score / total * 100;
        }

        const date =
            result.created_at ||
            result.submitted_at ||
            "";

        const row =
            document.createElement("div");

        row.className = "result";

        row.innerHTML = `
            <div>
                <div class="result-name">
                    ${escapeHTML(name)}
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
   STATS
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
                Number(result.percentage);

        } else if (max > 0) {

            percentage =
                score / max * 100;
        }

        if (Number.isFinite(percentage)) {

            total += percentage;

            best =
                Math.max(
                    best,
                    percentage
                );
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

    const editBtn =
        document.getElementById("editBtn");

    if (editBtn) {

        editBtn.onclick = function () {

            location.href =
                "edit-profile.html";
        };
    }


    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.onclick =
            async function () {

                logoutBtn.disabled = true;

                await supabaseClient.auth.signOut();

                location.href =
                    "auth.html";
            };
    }
}


/* =====================================================
   HELPERS
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


function formatDate(date) {

    if (!date) return "—";

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


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function showError(message) {

    const box =
        document.getElementById("errorBox");

    if (!box) return;

    box.textContent = message;

    box.style.display = "block";
}
