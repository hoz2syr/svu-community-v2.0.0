/**
 * ════════════════════════════════════════════════════════════════
 * Schedule Extraction Service — Supabase Edge Function (ocr-proxy)
 * يستدعي Edge Function بدل استدعاء OCR API مباشرة من العميل
 * ════════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    window.isGeminiConfigured = function() {
        return typeof window.isSupabaseConfigured === 'function' && window.isSupabaseConfigured();
    };

    // ─── OCR via Supabase Edge Function ─────────────────────────
    async function callOCR(base64DataUrl) {
        let db = window.getDb ? window.getDb() : null;
        if (!db) {
            throw new Error('OCR_API_KEY_NOT_CONFIGURED');
        }

        let response;
        try {
            response = await db.functions.invoke('ocr-proxy', {
                body: { base64Image: base64DataUrl },
            });
        } catch (e) {
            throw new Error('OCR_NETWORK_ERROR: فشل الاتصال بخدمة OCR.');
        }

        // إذا Edge Function أرجعت non-2xx — Supabase يضع البيانات في response.data
        if (!response.error && response.data && response.data.error) {
            let errMsg = response.data.error;
            if (errMsg === 'OCR_QUOTA_EXCEEDED') throw new Error('OCR_QUOTA_EXCEEDED');
            if (errMsg === 'OCR_API_KEY_INVALID') throw new Error('OCR_API_KEY_INVALID');
            if (errMsg === 'OCR_API_KEY_NOT_CONFIGURED') throw new Error('OCR_API_KEY_NOT_CONFIGURED');
            if (errMsg === 'OCR_NO_TEXT') throw new Error('OCR_NO_TEXT: لم يتم العثور على نص في الصورة.');
            if (errMsg.startsWith('OCR_PROCESSING_ERROR')) throw new Error(errMsg);
            if (errMsg.startsWith('OCR_HTTP_ERROR')) throw new Error(errMsg);
            throw new Error('OCR_ERROR: ' + errMsg);
        }

        if (response.error) {
            let errMsg = typeof response.error === 'string' ? response.error : response.error.message || '';
            if (errMsg === 'OCR_QUOTA_EXCEEDED') throw new Error('OCR_QUOTA_EXCEEDED');
            if (errMsg === 'OCR_API_KEY_INVALID') throw new Error('OCR_API_KEY_INVALID');
            if (errMsg === 'OCR_API_KEY_NOT_CONFIGURED') throw new Error('OCR_API_KEY_NOT_CONFIGURED');
            if (errMsg === 'OCR_NO_TEXT') throw new Error('OCR_NO_TEXT: لم يتم العثور على نص في الصورة.');
            if (errMsg.startsWith('OCR_PROCESSING_ERROR')) throw new Error(errMsg);
            throw new Error('OCR_HTTP_ERROR: ' + errMsg);
        }

        let data = response.data;
        if (!data || !data.text) {
            throw new Error('OCR_NO_TEXT: لم يتم العثور على نص في الصورة.');
        }

        return data.text;
    }

    // ─── Helpers ────────────────────────────────────────────────

    /** Is this line noise? (usernames, codes, numbers, etc.) */
    function isNoise(line) {
        let t = line.trim();
        if (t.length < 2) return true;
        if (/^t[_]?\w+$/i.test(t)) return true;            // t_username or tusername
        if (/^S?\d{1,2}$/i.test(t)) return true;            // S25, 25
        if (/^\$\d+/.test(t)) return true;                   // $25
        if (/^\d{1,2}$/.test(t)) return true;                // standalone numbers
        if (/^\w+_\w+_\w+/.test(t) && !/ITE_|ENG_|BA_|CS_/.test(t)) return true; // other_t_codes
        if (/^_C\d+_\$\d+$/i.test(t)) return true;          // _C6_$25 (OCR noise)
        if (/^_[A-Z]\d+_\$/i.test(t)) return true;          // _C10_$ (OCR noise variant)
        return false;
    }

    /** Does line contain an SVU course code? */
    function hasSVUCode(line) {
        return /(?:ITE|ENG|BA|CS)_[A-Z]/i.test(line);
    }

    /** Extract code from SVU format: ITE_BEC401_C6_S25 → BEC401 */
    function extractCode(line) {
        let m = line.match(/(?:ITE|ENG|BA|CS)_([A-Z]{2,5}\d{2,4})/i);
        if (m) return m[1].toUpperCase();
        let m2 = line.match(/([A-Z]{2,5}\d{2,4})/);
        if (m2) return m2[1].toUpperCase();
        return null;
    }

    /** Extract section from line: ITE_BPG402_C10_S25 → C10 */
    function extractSection(line) {
        let m = line.match(/_C(\d+)_/i);
        return m ? 'C' + m[1] : null;
    }

    /** Does a line look like a person's name? */
    function looksLikeName(line) {
        let cleaned = line.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '').trim();
        if (cleaned.length < 4 || cleaned.length > 60) return false;
        let words = cleaned.split(/\s+/);
        if (words.length < 2 || words.length > 5) return false;
        return words.every(function(w) { return w.length >= 2; });
    }

    /** Does a string look like an instructor name (not a course name)? */
    function looksLikeInstructor(text) {
        if (!text) return false;
        let cleaned = text.trim();
        // أسماء الأساتذة: كلمات تبدأ بحرف كبير بدون أرقام/رموز
        let words = cleaned.split(/\s+/);
        if (words.length < 2) return false;
        // إذا كل الكلمات تبدأ بحرف كبير بدون أرقام — غالباً اسم أستاذ
        let allCapitalized = words.every(function(w) {
            return /^[A-Z]/.test(w) && !/\d/.test(w);
        });
        // استثناء: أسماء المقررات تحتوي كلمات مثل Systems, Programming, Analysis
        let courseWords = /Systems|Programming|Analysis|Structures|Database|Networks|Engineering|Algorithms|Architecture|Processing|Circuits|Mathematics|Graphics|Applications|Security|Management|Intelligence|Web|Mobile|Operating|Data|Computer/;
        let hasCourseWord = courseWords.test(cleaned);
        return allCapitalized && !hasCourseWord;
    }

    /** Look up course name from ITE_COURSES */
    function lookupCourseName(code) {
        let courses = window.ITE_COURSES;
        if (!courses || !code) return code;
        let upper = code.toUpperCase();
        for (let i = 0; i < courses.length; i++) {
            if (courses[i].code.toUpperCase() === upper) return courses[i].name;
        }
        return code;
    }

    // ─── Improved Parser ────────────────────────────────────────

    function parseScheduleText(rawText) {
        let lines = rawText.split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean);
        let courses = [];
        let seen = {};
        let major = '';

        // Detect major
        if (/information\s*technology|ITE\b/i.test(rawText)) major = 'Information Technology';

        // Full code pattern: e.g. ITE_BEC401_C6_S25
        let fullCodeRegex = /(?:ITE|ENG|BA|CS)_[A-Z]{2,5}\d{2,4}_C\d+_[A-Z]\d+/i;

        lines.forEach(function(line, index) {
            // Try full code match first (most reliable)
            let fullMatch = line.match(fullCodeRegex);
            if (!fullMatch) {
                // Fallback: line may contain SVU code without full format
                if (!hasSVUCode(line)) return;
                fullMatch = line.match(/((?:ITE|ENG|BA|CS)_[A-Z]{2,5}\d{2,4})/i);
                if (!fullMatch) return;
            }

            let fullCode = fullMatch[0].toUpperCase();
            let code = extractCode(fullCode);
            if (!code || seen[code]) return;
            seen[code] = true;

            // Section from full code
            let section = extractSection(fullCode) || extractSection(line);

            let name = '';
            let instructor = null;

            // Name: text before the code on the same line
            let beforeCode = line.split(fullMatch[0])[0].trim();
            // Clean: remove term codes like S25, leading row numbers
            name = beforeCode.replace(/S\d{2}/g, '').replace(/^\d+\s+/, '').trim();
            // Remove leftover t_usernames and OCR noise from the name
            name = name.replace(/t_\w+/gi, '').replace(/_C\d+_\$\d+/gi, '').trim();

            // إذا النص قبل الكود يبدو كاسم أستاذ — استخدمه كـ instructor وخذ الاسم من lookup
            if (looksLikeInstructor(name)) {
                instructor = name;
                name = '';
            }

            // Fallback: check previous line for course name
            if (!name && index > 0) {
                let prev = lines[index - 1];
                if (!fullCodeRegex.test(prev) && !hasSVUCode(prev) && !isNoise(prev)) {
                    let prevClean = prev.replace(/S\d{2}/g, '').replace(/t_\w+/gi, '').replace(/_C\d+_\$\d+/gi, '').trim();
                    if (!looksLikeInstructor(prevClean)) {
                        name = prevClean;
                    } else if (!instructor) {
                        instructor = prevClean;
                    }
                }
            }

            // Instructor: text after the code on the same line
            if (!instructor) {
                let afterCode = line.split(fullMatch[1] || fullMatch[0])[1] || '';
                instructor = afterCode.replace(/t_\w+/gi, '').replace(/_C\d+_\$\d+/gi, '').replace(/[|،,]+$/g, '').trim();
            }

            // Fallback: check next line for instructor name
            if (!instructor && index < lines.length - 1) {
                let nextLine = lines[index + 1];
                if (!fullCodeRegex.test(nextLine) && !hasSVUCode(nextLine) && !isNoise(nextLine)) {
                    instructor = nextLine.replace(/t_\w+/gi, '').replace(/_C\d+_\$\d+/gi, '').trim();
                }
            }

            // تنظيف نهائي: إذا instructor يحتوي ضوضاء فقط — تجاهله
            if (instructor && /^[_$C\d\s\-]+$/i.test(instructor)) {
                instructor = null;
            }

            courses.push({
                code: code,
                name: name || lookupCourseName(code) || code,
                section: section,
                instructor: instructor || null,
                time: null
            });
        });

        return { major: major, courses: courses };
    }

    // ─── Public API ────────────────────────────────────────────

    window.extractScheduleFromImage = async function(base64Image, mimeType) {
        let imageData = base64Image;
        if (!imageData || imageData.length < 100) throw new Error('INVALID_IMAGE_DATA');

        if (!imageData.startsWith('data:')) {
            imageData = 'data:' + (mimeType || 'image/png') + ';base64,' + imageData;
        }

        let rawText = await callOCR(imageData);
        window.log.debug('[OCR] Extracted text length:', rawText.length);

        let result = parseScheduleText(rawText);
        window.log.debug('[OCR] Found', result.courses.length, 'courses');

        return result;
    };
})();
