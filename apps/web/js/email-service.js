/**
 * ════════════════════════════════════════════════════════════════
 * Email Service — Supabase Edge Function (send-email)
 * يستدعي Edge Function لإرسال الإيميلات عبر Resend
 * ════════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    window.isEmailConfigured = function() {
        return typeof window.isSupabaseConfigured === 'function' && window.isSupabaseConfigured();
    };

    /**
     * إرسال إيميل واحد
     * @param {Object} options
     * @param {string|string[]} options.to - البريد أو قائمة البريدات
     * @param {string} options.subject - عنوان الإيميل
     * @param {string} [options.html] - محتوى HTML
     * @param {string} [options.text] - محتوى نصي
     * @param {string} [options.replyTo] - بريد للرد
     * @returns {Promise<{success: boolean, id?: string, error?: string}>}
     */
    async function sendEmail(options) {
        let db = window.getDb ? window.getDb() : null;
        if (!db) {
            return { success: false, error: 'SUPABASE_NOT_CONFIGURED' };
        }

        if (!options || !options.to || !options.subject) {
            return { success: false, error: 'MISSING_REQUIRED_FIELDS' };
        }

        if (!options.html && !options.text) {
            return { success: false, error: 'MISSING_CONTENT' };
        }

        try {
            let response = await db.functions.invoke('send-email', {
                body: {
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                    text: options.text,
                    replyTo: options.replyTo,
                },
            });

            if (response.error) {
                let errMsg = typeof response.error === 'string' ? response.error : response.error.message || '';
                return { success: false, error: errMsg };
            }

            if (response.data && response.data.error) {
                return { success: false, error: response.data.error };
            }

            return { success: true, id: response.data?.id };
        } catch (e) {
            return { success: false, error: 'NETWORK_ERROR: ' + (e.message || '') };
        }
    }

    /**
     * إرسال إيميل لعدة مستخدمين (دفعة واحدة)
     * @param {string[]} emails - قائمة البريدات
     * @param {string} subject - عنوان الإيميل
     * @param {string} html - محتوى HTML
     * @returns {Promise<{sent: number, failed: number, errors: string[]}>}
     */
    async function sendBulkEmail(emails, subject, html) {
        let results = { sent: 0, failed: 0, errors: [] };

        if (!emails || emails.length === 0) {
            results.errors.push('NO_RECIPIENTS');
            return results;
        }

        let result = await sendEmail({ to: emails, subject: subject, html: html });

        if (result.success) {
            results.sent = emails.length;
        } else {
            results.failed = emails.length;
            results.errors.push(result.error);
        }

        return results;
    }

    /**
     * إرسال إيميل لجميع المستخدمين النشطين
     * @param {string} subject - عنوان الإيميل
     * @param {string} html - محتوى HTML
     * @returns {Promise<{sent: number, failed: number, errors: string[], total: number}>}
     */
    async function sendToAllUsers(subject, html) {
        let db = window.getDb ? window.getDb() : null;
        if (!db) {
            return { sent: 0, failed: 0, errors: ['SUPABASE_NOT_CONFIGURED'], total: 0 };
        }

        try {
            let result = await db
                .from('users')
                .select('email')
                .eq('is_active', true)
                .not('email', 'is', null);

            if (result.error) {
                return { sent: 0, failed: 0, errors: ['FETCH_USERS_FAILED: ' + result.error.message], total: 0 };
            }

            let emails = (result.data || [])
                .map(function(u) { return u.email; })
                .filter(function(e) { return e && e.includes('@'); });

            if (emails.length === 0) {
                return { sent: 0, failed: 0, errors: ['NO_ACTIVE_USERS_WITH_EMAIL'], total: 0 };
            }

            let bulkResult = await sendBulkEmail(emails, subject, html);
            return { ...bulkResult, total: emails.length };
        } catch (e) {
            return { sent: 0, failed: 0, errors: ['ERROR: ' + (e.message || '')], total: 0 };
        }
    }

    // Public API
    window.emailService = {
        send: sendEmail,
        sendBulk: sendBulkEmail,
        sendToAll: sendToAllUsers,
    };
})();
