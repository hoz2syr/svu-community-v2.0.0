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
    /**
     * انتظار مع Exponential Backoff
     */
    function sleep(ms) {
        return new Promise(function(resolve) { setTimeout(resolve, ms); });
    }

    async function sendEmail(options, retries) {
        retries = retries || 3;
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

        for (let attempt = 0; attempt <= retries; attempt++) {
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
                    // إعادة المحاولة عند Rate Limit
                    if (response.data.error === 'RATE_LIMIT_EXCEEDED' && attempt < retries) {
                        let delay = Math.min(1000 * Math.pow(2, attempt), 30000);
                        console.warn('[email-service] Rate limited, retrying in ' + delay + 'ms (attempt ' + (attempt + 1) + '/' + retries + ')');
                        await sleep(delay);
                        continue;
                    }
                    return { success: false, error: response.data.error };
                }

                return { success: true, id: response.data?.id };
            } catch (e) {
                if (attempt < retries) {
                    let delay = Math.min(1000 * Math.pow(2, attempt), 30000);
                    console.warn('[email-service] Network error, retrying in ' + delay + 'ms');
                    await sleep(delay);
                    continue;
                }
                return { success: false, error: 'NETWORK_ERROR: ' + (e.message || '') };
            }
        }

        return { success: false, error: 'MAX_RETRIES_EXCEEDED' };
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

        // تقسيم الإيميلات إلى دفعات من 50 (حد Resend الأقصى)
        var batchSize = 50;
        var batches = [];
        for (var i = 0; i < emails.length; i += batchSize) {
            batches.push(emails.slice(i, i + batchSize));
        }

        for (var j = 0; j < batches.length; j++) {
            var batch = batches[j];
            var result = await sendEmail({ to: batch, subject: subject, html: html });

            if (result.success) {
                results.sent += batch.length;
            } else {
                results.failed += batch.length;
                results.errors.push(result.error);
                // إذا كان Rate Limit، توقف عن باقي الدفعات
                if (result.error === 'RATE_LIMIT_EXCEEDED') {
                    results.errors.push('BATCH_STOPPED_AT_' + (j + 1) + '_OF_' + batches.length);
                    break;
                }
            }

            // تأخير بين الدفعات لتجنب Rate Limit
            if (j < batches.length - 1) {
                await sleep(1100);
            }
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

    /**
     * ترجمة رموز الأخطاء إلى رسائل مفهومة
     */
    function getErrorMessage(errorCode) {
        var messages = {
            'RATE_LIMIT_EXCEEDED': 'تم تجاوز حد الإرسال، يرجى الانتظار دقيقة والمحاولة مرة أخرى',
            'RESEND_API_KEY_NOT_CONFIGURED': 'خدمة الإيميل غير مُعدّة',
            'UNAUTHORIZED': 'يجب تسجيل الدخول أولاً',
            'FORBIDDEN': 'صلاحيات المشرف مطلوبة',
            'MISSING_RECIPIENT': 'لم يتم تحديد المستقبل',
            'MISSING_SUBJECT': 'لم يتم تحديد عنوان الإيميل',
            'MISSING_CONTENT': 'لم يتم تحديد محتوى الإيميل',
            'INVALID_EMAIL': 'عنوان بريد إلكتروني غير صالح',
            'TOO_MANY_RECIPIENTS': 'عدد المستقبلين يتجاوز الحد الأقصى (50)',
            'EMAIL_SEND_FAILED': 'فشل إرسال الإيميل',
            'NETWORK_ERROR': 'خطأ في الاتصال، تحقق من الإنترنت',
            'MAX_RETRIES_EXCEEDED': 'فشلت جميع المحاولات، حاول لاحقاً',
            'SUPABASE_NOT_CONFIGURED': 'الخدمة غير متاحة حالياً',
        };
        return messages[errorCode] || errorCode;
    }

    // Public API
    window.emailService = {
        send: sendEmail,
        sendBulk: sendBulkEmail,
        sendToAll: sendToAllUsers,
        getErrorMessage: getErrorMessage,
    };
})();
