"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    const loading = document.getElementById("loading");
    const content = document.getElementById("content");
    const errorBox = document.getElementById("errorBox");

    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = "block";
    }

    function text(value) {
        return value === null ||
               value === undefined ||
               value === ""
            ? "—"
            : String(value);
    }

    function formatDate(date) {

        if (!date) return "—";

        try {
            return new Date(date).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        } catch {
            return "—";
        }
    }

    try {

        /*
         * التأكد من وجود اتصال Supabase
         */

        if (!window.supabaseClient) {
            throw new Error(
                "Supabase غير متصل. تأكد من تحميل supabase.js بعد مكتبة Supabase."
            );
        }

        const supabase = window.supabaseClient;


        /*
         * معرفة الطالب الحالي
         */

        const {
            data: sessionData,
            error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        const session = sessionData?.session;

        if (!session) {

            window.location.href = "auth.html";

            return;
        }

        const user = session.user;

        /*
         * محاولة جلب بيانات الطالب
         *
         * الكود يجرب students أولاً
         */

        let student = null;

        let studentResponse = await supabase
            .from("students")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (!studentResponse.error && studentResponse.data) {

            student = studentResponse.data;

        } else {

            /*
             * لو students غير موجودة أو لم يوجد الطالب
             * نجرب profiles
             */

            const profileResponse = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (!profileResponse.error && profileResponse.data) {
                student = profileResponse.data;
            }
        }


        /*
         * لو لم توجد بيانات إضافية
         * نستخدم بيانات Auth الأساسية
         */

        if (!student) {

            student = {
                id: user.id,
                name:
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    "الطالب",

                email: user.email,

                phone:
                    user.user_metadata?.phone ||
                    ""
            };
        }


        /*
         * البيانات
         */

        const name =
            student.full_name ||
            student.name ||
            student.student_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "الطالب";

        const email =
            student.email ||
            user.email ||
            "—";

        const phone =
            student.phone ||
            student.phone_number ||
            user.user_metadata?.phone ||
            "—";

        const parentPhone =
            student.parent_phone ||
            student.parentPhone ||
            "—";

        const grade =
            student.grade ||
            student.class ||
            student.grade_name ||
            "—";

        const governorate =
            student.governorate ||
            student.province ||
            "—";

        const city =
            student.city ||
            "—";

        const school =
            student.school ||
            "—";

        const avatar =
            student.avatar_url ||
            student.photo_url ||
            student.image_url ||
            user.user_metadata?.avatar_url ||
            "teacher.png";


        /*
         * عرض البيانات
         */

        document.getElementById("studentName").textContent = name;

        document.getElementById("studentEmail").textContent = email;

        document.getElementById("fullName").textContent = name;

        document.getElementById("email").textContent = email;

        document.getElementById("phone").textContent = phone;

        document.getElementById("parentPhone").textContent =
            parentPhone;

        document.getElementById("grade").textContent =
            grade;

        document.getElementById("governorate").textContent =
            governorate;

        document.getElementById("city").textContent =
            city;

        document.getElementById("school").textContent =
            school;

        document.getElementById("createdAt").textContent =
            formatDate(user.created_at);


        /*
         * الصورة
         */

        const avatarElement =
            document.getElementById("studentAvatar");

        avatarElement.src = avatar;

        avatarElement.onerror = () => {
            avatarElement.src = "teacher.png";
        };


        /*
         * جلب النتائج
         */

        let results = [];

        const resultsResponse = await supabase
            .from("results")
            .select("*")
            .eq("student_id", user.id)
            .order("created_at", {
                ascending: false
            });

        if (!resultsResponse.error && resultsResponse.data) {
            results = resultsResponse.data;
        }


        /*
         * الإحصائيات
         */

        const completedCount = results.length;

        let totalPercentage = 0;
        let bestPercentage = 0;

        results.forEach(result => {

            let percentage = 0;

            if (
                result.percentage !== null &&
                result.percentage !== undefined
            ) {

                percentage =
                    Number(result.percentage) || 0;

            } else if (
                result.score !== null &&
                result.total_score
            ) {

                percentage =
                    (Number(result.score) /
                    Number(result.total_score)) * 100;
            }

            totalPercentage += percentage;

            if (percentage > bestPercentage) {
                bestPercentage = percentage;
            }
        });

        const average =
            completedCount > 0
                ? totalPercentage / completedCount
                : 0;


        document.getElementById("testsCount").textContent =
            completedCount;

        document.getElementById("completedCount").textContent =
            completedCount;

        document.getElementById("averageScore").textContent =
            Math.round(average) + "%";

        document.getElementById("bestScore").textContent =
            Math.round(bestPercentage) + "%";


        /*
         * عرض النتائج
         */

        const resultsContainer =
            document.getElementById("results");

        if (results.length === 0) {

            resultsContainer.innerHTML = `
                <div class="empty">
                    📝 لم تدخل أي اختبار حتى الآن
                </div>
            `;

        } else {

            resultsContainer.innerHTML = "";

            results.forEach(result => {

                const score =
                    result.score ??
                    result.mark ??
                    0;

                const total =
                    result.total_score ??
                    result.total ??
                    0;

                let percentage;

                if (result.percentage !== undefined &&
                    result.percentage !== null) {

                    percentage =
                        Number(result.percentage);

                } else if (total > 0) {

                    percentage =
                        (Number(score) / Number(total)) * 100;

                } else {

                    percentage = 0;
                }


                const examName =
                    result.exam_name ||
                    result.test_name ||
                    result.title ||
                    "اختبار";


                const date =
                    result.created_at ||
                    result.submitted_at ||
                    result.date;


                const row =
                    document.createElement("div");

                row.className = "result";

                row.innerHTML = `
                    <div>
                        <div class="result-name">
                            ${escapeHTML(examName)}
                        </div>

                        <div class="result-date">
                            ${escapeHTML(formatDate(date))}
                        </div>
                    </div>

                    <div class="score">
                        ${Math.round(percentage)}%
                    </div>
                `;

                resultsContainer.appendChild(row);
            });
        }


        /*
         * زر تعديل البيانات
         */

        document.getElementById("editBtn")
            .addEventListener("click", () => {

                /*
                 * هنربطه بصفحة تعديل البيانات
                 * بعد إنشاء edit-profile.html
                 */

                window.location.href =
                    "edit-profile.html";
            });


        /*
         * تسجيل الخروج
         */

        document.getElementById("logoutBtn")
            .addEventListener("click", async () => {

                const { error } =
                    await supabase.auth.signOut();

                if (error) {

                    alert(
                        "حدث خطأ أثناء تسجيل الخروج"
                    );

                    return;
                }

                window.location.href =
                    "auth.html";
            });


        /*
         * إظهار الصفحة
         */

        loading.style.display = "none";

        content.style.display = "block";


    } catch (error) {

        console.error(
            "HOME ERROR:",
            error
        );

        loading.style.display = "none";

        content.style.display = "block";

        showError(
            error.message ||
            "حدث خطأ أثناء تحميل بيانات الطالب"
        );
    }
});


/*
 * حماية النصوص القادمة من قاعدة البيانات
 */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
