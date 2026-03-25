/**
 * Dashboard Page Logic
 */
(function() {
    'use strict';

    function hideLoadingState() {
        let el = document.getElementById('loadingState');
        if (el) el.classList.add('hidden');
    }

    function showErrorState(message) {
        hideLoadingState();
        let loading = document.getElementById('loadingState');
        if (loading) {
            loading.innerHTML = '<div class="text-center">'
                + '<div class="text-5xl mb-4">⚠️</div>'
                + '<p class="text-red-400 mb-2">' + (message || 'حدث خطأ') + '</p>'
                + '<a href="login.html" class="text-primary-400 underline">تسجيل الدخول</a>'
                + '</div>';
            loading.classList.remove('hidden');
        }
    }

    async function init() {
        initSupabase();

        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        let db = getDb();
        let user = getCurrentUser();

        if (db) {
            let isValid = await verifySessionWithServer(db);
            if (!isValid) {
                window.location.href = 'login.html';
                return;
            }
            user = getCurrentUser();
        }

        if (!user) {
            showErrorState('لم يتم العثور على بيانات المستخدم');
            return;
        }

        // Populate UI
        let el;
        el = document.getElementById('userFirstName');
        if (el) el.textContent = user.first_name || 'مستخدم';

        el = document.getElementById('userEmail');
        if (el) el.textContent = user.email || '';

        el = document.getElementById('userInitial');
        if (el) el.textContent = (user.first_name || 'م')[0].toUpperCase();

        el = document.getElementById('userUsername');
        if (el) el.textContent = '@' + (user.username || '');

        el = document.getElementById('userMajor');
        if (el) el.textContent = user.major || '';

        // Show admin link if user is admin
        if (user.is_admin) {
            let adminLink = document.getElementById('adminLink');
            if (adminLink) adminLink.classList.remove('hidden');
        }

        hideLoadingState();
        document.getElementById('dashboardContent').classList.remove('hidden');
    }

    window.handleLogout = function(event) {
        if (event) event.preventDefault();
        logout();
    };

    // Timeout أمان — إذا استغرق التحقق أكثر من 10 ثوانٍ
    let authTimeout = setTimeout(function() {
        let loading = document.getElementById('loadingState');
        if (loading && !loading.classList.contains('hidden')) {
            showErrorState('انتهت مهلة التحقق من الجلسة');
        }
    }, 10000);

    document.addEventListener('DOMContentLoaded', function() {
        // Initialize theme and language
        window.initializeTheme?.();
        window.i18n?.initLang?.();

        init().then(function() {
            clearTimeout(authTimeout);
        }).catch(function() {
            clearTimeout(authTimeout);
            showErrorState('فشل التحقق من الجلسة');
        });
    });
})();
