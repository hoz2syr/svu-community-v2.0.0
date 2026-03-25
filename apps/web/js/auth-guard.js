/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Auth Guard (Shared)
 * 
 * يوفر دالة مشتركة للتحقق من المصادقة في جميع الصفحات المحمية.
 * ════════════════════════════════════════════════════════════════
 */

/**
 * التحقق من المصادقة وإرجاع بيانات المستخدم
 * @param {Object} options - خيارات التحقق
 * @param {boolean} options.requireAdmin - هل نحتاج صلاحة أدمن
 * @param {boolean} options.silent - عدم التوجيه (للتحقق الصامت)
 * @returns {Promise<{user: Object, db: Object}|null>} - بيانات المستخدم أو null
 */
window.checkAuth = async function(options = {}) {
    let requireAdmin = options.requireAdmin || false;
    let silent = options.silent || false;

    // التحقق من تسجيل الدخول
    if (!window.isLoggedIn()) {
        if (!silent) window.location.href = 'login.html';
        return null;
    }

    // تهيئة Supabase
    let db = window.initSupabase ? window.initSupabase() : window.getDb?.();
    if (!db) {
        if (!silent) window.location.href = 'login.html';
        return null;
    }

    // التحقق من الجلسة مع الخادم
    let isValid = await window.verifySessionWithServer(db);
    if (!isValid) {
        if (!silent) window.location.href = 'login.html';
        return null;
    }

    // جلب بيانات المستخدم
    let user = window.getCurrentUser();
    if (!user || !user.id) {
        if (!silent) window.location.href = 'login.html';
        return null;
    }

    // التحقق من صلاحيات الأدمن إن لزم
    if (requireAdmin) {
        try {
            let result = await db
                .from('users')
                .select('is_admin, is_active')
                .eq('id', user.id)
                .single();

            if (!result.data || !result.data.is_admin || !result.data.is_active) {
                if (!silent) {
                    window.location.href = 'index.html';
                }
                return null;
            }
        } catch (e) {
            if (!silent) window.location.href = 'login.html';
            return null;
        }
    }

    return { user: user, db: db };
};
