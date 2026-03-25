/**
 * ════════════════════════════════════════════════════════════════
 * Schedule Extraction Page Logic
 * ════════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    let currentUser = null;
    let lastExtractedCourses = [];
    let lastExtractedMajor = '';
    let selectedFile = null;
    let selectedMimeType = null;
    let selectedGroup = null;

    // ─── Helper: Compare extracted major with group major ──────
    function majorMatches(extractedMajor, groupMajor) {
        if (!extractedMajor || !groupMajor) return true;
        let ext = extractedMajor.toLowerCase().trim();
        let grp = groupMajor.toLowerCase().trim();

        // ITE / Information Technology
        if ((ext.includes('information technology') || ext.includes('ite')) &&
            (grp.includes('information technology') || grp.includes('ite'))) return true;
        // Engineering
        if (ext.includes('engineering') && grp.includes('engineering')) return true;
        // Business
        if ((ext.includes('business') || ext.includes('ba') || ext.includes('bba')) &&
            (grp.includes('business') || grp.includes('ba') || grp.includes('bba'))) return true;
        // CS
        if ((ext.includes('computer science') || ext.includes('cs')) &&
            (grp.includes('computer science') || grp.includes('cs'))) return true;
        // ENG
        if (ext.includes('eng') && grp.includes('eng')) return true;

        return ext === grp;
    }

    // ═══════════════════════════════════════════
    // Auth Check
    // ═══════════════════════════════════════════
    async function init() {
        initSupabase();
        if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
        let db = getDb();
        if (!db) { window.location.href = 'login.html'; return; }
        let isValid = await verifySessionWithServer(db);
        if (!isValid) { window.location.href = 'login.html'; return; }
        currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) { window.location.href = 'login.html'; return; }

        setupDropZone();
        loadAllGroups();
    }

    // ═══════════════════════════════════════════
    // Drop Zone / File Input
    // ═══════════════════════════════════════════
    function setupDropZone() {
        let dropZone = document.getElementById('dropZone');
        let fileInput = document.getElementById('fileInput');

        dropZone.addEventListener('click', function() {
            fileInput.click();
        });

        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', function() {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            let files = e.dataTransfer.files;
            if (files.length > 0) handleFile(files[0]);
        });

        fileInput.addEventListener('change', function() {
            if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
        });
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast('يرجى اختيار ملف صورة فقط', 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showToast('حجم الملف أكبر من 10MB', 'error');
            return;
        }

        selectedFile = file;
        selectedMimeType = file.type;

        let reader = new FileReader();
        reader.onload = function(e) {
            let previewImg = document.getElementById('previewImg');
            previewImg.src = e.target.result;
            document.getElementById('dropPlaceholder').classList.add('hidden');
            document.getElementById('imagePreview').classList.remove('hidden');
            document.getElementById('dropZone').classList.add('has-image');
            document.getElementById('extractBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }

    window.clearImage = function() {
        selectedFile = null;
        selectedMimeType = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('dropPlaceholder').classList.remove('hidden');
        document.getElementById('imagePreview').classList.add('hidden');
        document.getElementById('dropZone').classList.remove('has-image');
        document.getElementById('extractBtn').disabled = true;
    };

    // ═══════════════════════════════════════════
    // Extract Schedule
    // ═══════════════════════════════════════════
    window.handleExtract = async function() {
        if (!selectedFile) return;

        let btn = document.getElementById('extractBtn');
        let btnText = document.getElementById('extractBtnText');
        let btnLoading = document.getElementById('extractBtnLoading');

        btn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');

        try {
            let base64 = document.getElementById('previewImg').src;
            let result = await window.extractScheduleFromImage(base64, selectedMimeType);

            if (!result.courses || result.courses.length === 0) {
                showToast('لم يتم العثور على مواد. تأكد من أن الجدول واضح ويحتوي على أكواد مثل ITE_...', 'error');
                return;
            }

            lastExtractedCourses = result.courses;
            lastExtractedMajor = result.major || '';

            // Show major if extracted
            let majorEl = document.getElementById('extractedMajor');
            if (result.major && result.major !== 'Not specified') {
                majorEl.textContent = result.major;
                majorEl.classList.remove('hidden');
            } else {
                majorEl.classList.add('hidden');
            }

            // Match with groups and render
            let matchResult = await matchGroupsToCourses(result.courses);
            renderCourseCards(result.courses, matchResult.matched);
            document.getElementById('resultsSection').classList.remove('hidden');

            showToast('تم استخراج ' + result.courses.length + ' مادة بدقة!', 'success');

            // Scroll to results
            document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            let msg = error.message || '';
            window.log.error('[Schedule] Extraction error:', msg, error);

            if (msg === 'OCR_API_KEY_NOT_CONFIGURED') {
                showToast('يرجى إعداد مفتاح API الخاص بـ OCR.Space', 'error');
            } else if (msg.startsWith('OCR_API_KEY_INVALID')) {
                showToast('مفتاح OCR غير صالح. تحقق من المفتاح.', 'error');
            } else if (msg.startsWith('OCR_QUOTA_EXCEEDED')) {
                showToast('تم تجاوز حد الطلبات. حاول بعد دقيقة.', 'error');
            } else if (msg.startsWith('OCR_NETWORK_ERROR')) {
                showToast('فشل الاتصال بخدمة OCR. تحقق من الإنترنت.', 'error');
            } else if (msg.startsWith('OCR_PROCESSING_ERROR')) {
                showToast('فشل معالجة الصورة: ' + msg.replace('OCR_PROCESSING_ERROR: ', ''), 'error');
            } else if (msg.startsWith('OCR_NO_TEXT')) {
                showToast('لم يتم العثور على نص في الصورة. تأكد من وضوح الجدول.', 'error');
            } else if (msg === 'INVALID_IMAGE_DATA') {
                showToast('الصورة غير صالحة. اختر صورة أخرى.', 'error');
            } else {
                showToast('فشل الاستخراج: ' + msg, 'error');
            }
        } finally {
            btn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    };

    // ═══════════════════════════════════════════
    // Match Groups to Courses
    // ═══════════════════════════════════════════
    async function matchGroupsToCourses(courses) {
        let db = getDb();
        if (!db) return { matched: {}, allGroups: [] };

        try {
            let result = await db
                .from('groups')
                .select('*')
                .order('created_at', { ascending: false });

            if (result.error) throw result.error;

            let allGroups = result.data || [];
            let matched = {};

            courses.forEach(function(course) {
                let code = (course.code || '').toUpperCase();
                matched[code] = allGroups.filter(function(g) {
                    let codeMatch = (g.course_code || '').toUpperCase() === code;
                    let majorMatch = majorMatches(lastExtractedMajor, g.major || '');
                    return codeMatch && majorMatch;
                });
            });

            return { matched: matched, allGroups: allGroups };
        } catch (error) {
            window.log.error('Failed to match groups:', error);
            return { matched: {}, allGroups: [] };
        }
    }

    // ═══════════════════════════════════════════
    // Render Course Cards
    // ═══════════════════════════════════════════
    function renderCourseCards(courses, matchedGroups) {
        let container = document.getElementById('coursesList');
        container.innerHTML = '';

        courses.forEach(function(course) {
            let code = (course.code || '').toUpperCase();
            let groups = matchedGroups[code] || [];
            let safeName = escapeHtml(course.name || '');
            let safeCode = escapeHtml(course.code || '');
            let safeSection = escapeHtml(course.section || '');
            let safeInstructor = escapeHtml(course.instructor || '');
            let safeTime = escapeHtml(course.time || '');

            let card = document.createElement('div');
            card.className = 'glass rounded-xl p-5';

            let html = '<div class="flex items-start justify-between mb-3 flex-wrap gap-2">';
            html += '<div>';
            html += '<h3 class="text-white font-bold text-lg">' + safeName + '</h3>';
            html += '<span class="text-primary-400 font-mono text-sm">' + safeCode + '</span>';
            html += '</div>';

            if (groups.length === 0) {
                html += '<button onclick="window.openAutoCreateModal(\'' + escapeHtml(course.code) + '\', \'' + safeName.replace(/'/g, "\\'") + '\', \'' + safeSection + '\')" ';
                html += 'class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600/30 hover:bg-primary-600/50 text-primary-400 rounded-lg text-sm transition">';
                html += '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>';
                html += '<span data-i18n="scheduleCreateGroup">إنشاء مجموعة</span></button>';
            }
            html += '</div>';

            // Course details
            let details = [];
            if (safeSection) details.push('<span class="text-secondary-400 text-sm">📚 ' + escapeHtml(window.i18n?.t('scheduleSection') || 'الشعبة') + ': ' + safeSection + '</span>');
            if (safeInstructor) details.push('<span class="text-secondary-400 text-sm">👨‍🏫 ' + escapeHtml(window.i18n?.t('scheduleInstructor') || 'الدكتور') + ': ' + safeInstructor + '</span>');
            if (safeTime) details.push('<span class="text-secondary-400 text-sm">🕐 ' + escapeHtml(window.i18n?.t('scheduleTime') || 'الوقت') + ': ' + safeTime + '</span>');

            if (details.length > 0) {
                html += '<div class="flex flex-wrap gap-x-4 gap-y-1 mb-3">' + details.join('') + '</div>';
            }

            // Matched groups
            if (groups.length > 0) {
                html += '<div class="mt-3 pt-3 border-t border-white/10">';
                html += '<p class="text-secondary-400 text-sm mb-2">' + escapeHtml(window.i18n?.t('scheduleMatchedGroups') || 'المجموعات المطابقة') + ' (' + groups.length + ')</p>';
                html += '<div class="space-y-2">';

                groups.forEach(function(group) {
                    let isFull = group.current_members >= group.max_members;
                    let progress = (group.current_members / group.max_members) * 100;
                    html += '<div class="flex items-center gap-3 p-3 bg-secondary-800/50 rounded-lg cursor-pointer hover:bg-secondary-800/80 transition" onclick="window.openDetailsFromSchedule(\'' + group.id + '\')">';
                    html += '<div class="flex-1 min-w-0">';
                    html += '<p class="text-white text-sm font-semibold truncate">' + escapeHtml(group.name || '') + '</p>';
                    html += '<div class="flex items-center gap-3 mt-1">';
                    html += '<span class="text-xs ' + (isFull ? 'text-red-400' : 'text-green-400') + '">' + (isFull ? '● ممتلئة' : '● متاحة') + '</span>';
                    html += '<span class="text-xs text-secondary-500">' + group.current_members + '/' + group.max_members + '</span>';
                    html += '</div></div>';
                    html += '<div class="w-20 h-2 bg-secondary-700 rounded-full overflow-hidden">';
                    html += '<div class="h-full ' + (isFull ? 'bg-red-500' : 'bg-primary-500') + ' rounded-full" style="width:' + progress + '%"></div>';
                    html += '</div>';
                    html += '</div>';
                });

                html += '</div></div>';
            } else {
                html += '<div class="mt-3 pt-3 border-t border-white/10">';
                html += '<p class="text-secondary-500 text-sm">' + escapeHtml(window.i18n?.t('scheduleNoMatchedGroups') || 'لا توجد مجموعات لهذه المادة') + '</p>';
                html += '</div>';
            }

            card.innerHTML = html;
            container.appendChild(card);
        });
    }

    // ═══════════════════════════════════════════
    // Auto-Create Group Modal
    // ═══════════════════════════════════════════
    let autoCreateCourse = null;

    window.openAutoCreateModal = async function(courseCode, courseName, section) {
        autoCreateCourse = { code: courseCode, name: courseName };
        document.getElementById('modalCourseName').textContent = courseName;
        document.getElementById('modalCourseCode').textContent = courseCode;
        document.getElementById('autoGroupName').value = 'مجموعة مراجعة - ' + courseName;
        document.getElementById('autoWhatsappLink').value = '';
        document.getElementById('autoClassNumber').value = section || '';
        document.getElementById('autoDoctorName').value = '';
        document.getElementById('autoMaxMembers').value = '5';

        // Populate major select
        let majorSelect = document.getElementById('autoMajorSelect');
        if (majorSelect && majorSelect.options.length <= 1) {
            let majors = await window.getMajorsList();
            majors.forEach(function(major) {
                let opt = document.createElement('option');
                opt.value = major;
                opt.textContent = major;
                if (currentUser && currentUser.major && major.startsWith(currentUser.major)) {
                    opt.selected = true;
                }
                majorSelect.appendChild(opt);
            });
        }

        document.getElementById('createGroupModal').classList.remove('hidden');
        document.getElementById('createGroupModal').classList.add('flex');
    };

    window.closeCreateModal = function() {
        document.getElementById('createGroupModal').classList.add('hidden');
        document.getElementById('createGroupModal').classList.remove('flex');
        autoCreateCourse = null;
    };

    document.getElementById('autoCreateForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!autoCreateCourse) return;

        let btn = document.getElementById('autoCreateBtn');
        btn.disabled = true;
        btn.textContent = 'جاري الإنشاء...';

        let db = getDb();
        if (!db) {
            showToast('تعذر الاتصال بالخادم', 'error');
            btn.disabled = false;
            btn.textContent = window.i18n?.t('scheduleCreateGroupBtn') || 'إنشاء المجموعة';
            return;
        }

        let groupData = {
            name: document.getElementById('autoGroupName').value.trim(),
            course_name: autoCreateCourse.name,
            course_code: autoCreateCourse.code.toUpperCase(),
            class_number: document.getElementById('autoClassNumber').value.trim() || null,
            doctor_name: document.getElementById('autoDoctorName').value.trim() || null,
            max_members: parseInt(document.getElementById('autoMaxMembers').value) || 5,
            current_members: 1,
            whatsapp_link: document.getElementById('autoWhatsappLink').value.trim(),
            group_link: null,
            is_full: false,
            creator_id: currentUser.id,
            creator_name: ((currentUser.first_name || '') + ' ' + (currentUser.last_name || '')).trim() || currentUser.username || 'مستخدم',
            major: document.getElementById('autoMajorSelect')?.value || currentUser.major || 'ITE (Information Technology Engineering)'
        };

        try {
            let insertResult = await db.from('groups').insert(groupData).select().single();
            if (insertResult.error) throw insertResult.error;

            await db.from('group_members').insert({
                group_id: insertResult.data.id,
                user_id: currentUser.id
            });

            showToast(window.i18n?.t('scheduleGroupCreated') || 'تم إنشاء المجموعة بنجاح!', 'success');
            window.closeCreateModal();

            // Re-render
            let matchResult = await matchGroupsToCourses(lastExtractedCourses);
            renderCourseCards(lastExtractedCourses, matchResult.matched);
            renderAllGroups(matchResult.allGroups);
        } catch (error) {
            showToast('فشل إنشاء المجموعة: ' + (error.message || 'خطأ غير معروف'), 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = window.i18n?.t('scheduleCreateGroupBtn') || 'إنشاء المجموعة';
        }
    });

    // ═══════════════════════════════════════════
    // All Groups Section
    // ═══════════════════════════════════════════
    async function loadAllGroups() {
        let db = getDb();
        if (!db) return;

        try {
            let result = await db
                .from('groups')
                .select('*')
                .order('created_at', { ascending: false });

            if (result.error) throw result.error;
            let groups = result.data || [];

            // استخدام الدالة المشتركة لإثراء بيانات المنشئين
            await window.enrichCreators(groups, db);

            renderAllGroups(groups);
        } catch (error) {
            window.log.error('Failed to load groups:', error);
            document.getElementById('allGroupsLoading').classList.add('hidden');
            document.getElementById('allGroupsEmpty').classList.remove('hidden');
        }
    }

    function renderAllGroups(groups) {
        document.getElementById('allGroupsLoading').classList.add('hidden');

        // Filter groups to only show those matching extracted courses
        let filteredGroups = groups;
        if (lastExtractedCourses.length > 0) {
            filteredGroups = groups.filter(function(g) {
                return lastExtractedCourses.some(function(c) {
                    let codeMatch = (c.code || '').toUpperCase() === (g.course_code || '').toUpperCase();
                    let majorMatch = majorMatches(lastExtractedMajor, g.major || '');
                    return codeMatch && majorMatch;
                });
            });
        }

        if (!filteredGroups || filteredGroups.length === 0) {
            document.getElementById('allGroupsEmpty').classList.remove('hidden');
            document.getElementById('allGroupsGrid').classList.add('hidden');
            return;
        }

        document.getElementById('allGroupsEmpty').classList.add('hidden');
        let grid = document.getElementById('allGroupsGrid');
        grid.classList.remove('hidden');

        grid.innerHTML = filteredGroups.map(function(group) {
            let progress = (group.current_members / group.max_members) * 100;
            let isFull = group.current_members >= group.max_members;
            let safeName = escapeHtml(group.name || '');
            let safeCode = escapeHtml(group.course_code || '');
            let safeCourse = escapeHtml(group.course_name || '');
            let safeMajor = escapeHtml(group.major || '');

            return '<div class="glass rounded-xl p-4 card-hover cursor-pointer" onclick="window.openDetailsFromSchedule(\'' + group.id + '\')">'
                + '<div class="flex justify-between items-start mb-3">'
                + '<span class="px-2 py-1 ' + (isFull ? 'bg-red-600/30 text-red-400' : 'bg-green-600/30 text-green-400') + ' rounded-lg text-xs font-medium">'
                + (isFull ? '● ممتلئة' : '● متاحة') + '</span>'
                + '<span class="px-2 py-1 bg-primary-600/30 text-primary-400 rounded-lg text-xs">' + safeCode + '</span>'
                + '</div>'
                + '<h3 class="text-white font-semibold mb-2 line-clamp-2">' + safeName + '</h3>'
                + '<div class="space-y-1 text-sm text-secondary-400 mb-4">'
                + '<p>📚 ' + safeCourse + '</p>'
                + '<p>🎓 ' + safeMajor + '</p>'
                + '</div>'
                + '<div>'
                + '<div class="flex justify-between text-xs mb-1">'
                + '<span class="text-secondary-500">' + (window.i18n?.t('groupsMembers') || 'أعضاء') + '</span>'
                + '<span class="' + (isFull ? 'text-red-400' : 'text-white') + '">' + group.current_members + '/' + group.max_members + '</span>'
                + '</div>'
                + '<div class="h-2 bg-secondary-800 rounded-full overflow-hidden">'
                + '<div class="h-full ' + (isFull ? 'bg-red-500' : 'bg-gradient-to-r from-primary-500 to-accent-500') + ' rounded-full transition-all duration-500" '
                + 'style="width: ' + progress + '%"></div>'
                + '</div>'
                + '</div>'
                + '</div>';
        }).join('');
    }

    // ═══════════════════════════════════════════
    // Details Modal (from schedule page)
    // ═══════════════════════════════════════════
    window.openDetailsFromSchedule = function(groupId) {
        // Find group in all groups or matched groups
        let grid = document.getElementById('allGroupsGrid');
        let cards = grid.querySelectorAll('.glass');

        // Fetch from the rendered data
        let db = getDb();
        if (!db) return;

        db.from('groups').select('*').eq('id', groupId).single().then(function(result) {
            if (result.error || !result.data) {
                showToast('فشل تحميل تفاصيل المجموعة', 'error');
                return;
            }
            selectedGroup = result.data;
            showDetailsModal(selectedGroup);
        });
    };

    function showDetailsModal(group) {
        document.getElementById('detailName').textContent = group.name || '';
        document.getElementById('detailCode').textContent = group.course_code || '';
        document.getElementById('detailCourse').textContent = group.course_name || '';
        document.getElementById('detailMajor').textContent = group.major || '';

        if (group.class_number) {
            document.getElementById('detailClass').textContent = group.class_number;
            document.getElementById('detailClassRow').classList.remove('hidden');
        } else {
            document.getElementById('detailClassRow').classList.add('hidden');
        }
        if (group.doctor_name) {
            document.getElementById('detailDoctor').textContent = group.doctor_name;
            document.getElementById('detailDoctorRow').classList.remove('hidden');
        } else {
            document.getElementById('detailDoctorRow').classList.add('hidden');
        }

        document.getElementById('detailCurrent').textContent = group.current_members;
        document.getElementById('detailMax').textContent = group.max_members;

        let progress = (group.current_members / group.max_members) * 100;
        document.getElementById('detailProgress').style.width = progress + '%';

        let isFull = group.current_members >= group.max_members;
        let statusEl = document.getElementById('detailStatus');
        if (isFull) {
            statusEl.textContent = 'ممتلئة - لا يمكن الانضمام';
            statusEl.className = 'text-xs text-center mt-2 text-red-400';
        } else {
            statusEl.textContent = 'متاحة - يمكن الانضمام';
            statusEl.className = 'text-xs text-center mt-2 text-green-400';
        }

        document.getElementById('detailWhatsapp').href = validateUrl(group.whatsapp_link) || '#';

        // Check membership
        checkMembership(group);

        document.getElementById('detailsModal').classList.remove('hidden');
        document.getElementById('detailsModal').classList.add('flex');
    }

    async function checkMembership(group) {
        let joinBtn = document.getElementById('joinBtn');
        let confirmJoinBtn = document.getElementById('confirmJoinBtn');
        let alreadyMemberMsg = document.getElementById('alreadyMemberMsg');
        let whatsappBtn = document.getElementById('detailWhatsapp');
        let majorWarning = document.getElementById('majorMismatchWarning');
        let isFull = group.current_members >= group.max_members;

        joinBtn.classList.remove('hidden');
        confirmJoinBtn.classList.add('hidden');
        alreadyMemberMsg.classList.add('hidden');
        whatsappBtn.classList.add('hidden');
        majorWarning.classList.add('hidden');

        if (isFull) {
            joinBtn.disabled = true;
            joinBtn.classList.add('opacity-50', 'cursor-not-allowed');
            joinBtn.textContent = window.i18n?.t('groupsFull') || 'ممتلئة';
            return;
        }

        try {
            let db = getDb();
            if (db && currentUser && currentUser.id) {
                let existing = await db.from('group_members')
                    .select('id')
                    .eq('group_id', group.id)
                    .eq('user_id', currentUser.id)
                    .maybeSingle();
                if (existing.data) {
                    joinBtn.classList.add('hidden');
                    alreadyMemberMsg.classList.remove('hidden');
                    whatsappBtn.classList.remove('hidden');
                    return;
                }
            }
        } catch (e) { /* ignore */ }

        joinBtn.disabled = false;
        joinBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        joinBtn.textContent = window.i18n?.t('groupsJoin') || 'انضمام';
    }

    window.closeDetailsModal = function() {
        document.getElementById('detailsModal').classList.add('hidden');
        document.getElementById('detailsModal').classList.remove('flex');
        document.getElementById('majorMismatchWarning').classList.add('hidden');
        selectedGroup = null;
    };

    window.showJoinConfirm = function() {
        let userMajor = currentUser && currentUser.major;
        let groupMajor = selectedGroup && selectedGroup.major;

        if (userMajor && groupMajor && userMajor !== groupMajor) {
            document.getElementById('groupMajorLabel').textContent = groupMajor;
            document.getElementById('userMajorLabel').textContent = userMajor;
            document.getElementById('majorMismatchWarning').classList.remove('hidden');
            document.getElementById('joinBtn').classList.add('hidden');
            return;
        }

        document.getElementById('joinBtn').classList.add('hidden');
        document.getElementById('confirmJoinBtn').classList.remove('hidden');
    };

    window.confirmJoinDifferentMajor = function() {
        document.getElementById('majorMismatchWarning').classList.add('hidden');
        document.getElementById('confirmJoinBtn').classList.remove('hidden');
    };

    window.cancelJoinDifferentMajor = function() {
        document.getElementById('majorMismatchWarning').classList.add('hidden');
        document.getElementById('joinBtn').classList.remove('hidden');
    };

    window.joinSelectedGroup = async function() {
        if (!selectedGroup || selectedGroup.current_members >= selectedGroup.max_members) {
            showToast(window.i18n?.t('groupsFull') || 'المجموعة ممتلئة!', 'error');
            return;
        }

        let confirmBtn = document.getElementById('confirmJoinBtn');
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<svg class="animate-spin w-5 h-5 inline-block ml-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> جاري الانضمام...';

        try {
            let db = getDb();
            if (!db) { showToast('تعذر الاتصال بالخادم', 'error'); return; }

            let existing = await db.from('group_members')
                .select('*')
                .eq('group_id', selectedGroup.id)
                .eq('user_id', currentUser.id)
                .maybeSingle();

            if (existing.data) {
                showToast('أنت عضو بالفعل في هذه المجموعة!', 'error');
                return;
            }

            await db.from('group_members').insert({
                group_id: selectedGroup.id,
                user_id: currentUser.id
            });

            await db.from('groups')
                .update({
                    current_members: selectedGroup.current_members + 1,
                    is_full: (selectedGroup.current_members + 1) >= selectedGroup.max_members
                })
                .eq('id', selectedGroup.id);

            showToast('تم الانضمام بنجاح!', 'success');
            confirmBtn.classList.add('hidden');
            document.getElementById('alreadyMemberMsg').classList.remove('hidden');
            document.getElementById('detailWhatsapp').classList.remove('hidden');

            // Re-render
            let matchResult = await matchGroupsToCourses(lastExtractedCourses);
            renderCourseCards(lastExtractedCourses, matchResult.matched);
            renderAllGroups(matchResult.allGroups);
        } catch (error) {
            showToast('فشل الانضمام للمجموعة', 'error');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<svg class="w-5 h-5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> تأكيد الانضمام';
        }
    };

    // ═══════════════════════════════════════════
    // Initialize
    // ═══════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', function() {
        window.initializeTheme?.();
        window.i18n?.initLang?.();
        init();

        // Modal close on outside click
        document.getElementById('createGroupModal').addEventListener('click', function(e) {
            if (e.target.id === 'createGroupModal') window.closeCreateModal();
        });
        document.getElementById('detailsModal').addEventListener('click', function(e) {
            if (e.target.id === 'detailsModal') window.closeDetailsModal();
        });

        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (!document.getElementById('createGroupModal').classList.contains('hidden')) {
                    window.closeCreateModal();
                } else if (!document.getElementById('detailsModal').classList.contains('hidden')) {
                    window.closeDetailsModal();
                }
            }
        });
    });

    window.logout = logout;
})();
