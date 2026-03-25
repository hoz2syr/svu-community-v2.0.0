/**
 * Groups Page Logic
 * يحتوي على إصلاح N+1 Query (استعلام واحد بدل N)
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════
    // State
    // ═══════════════════════════════════════════
    let currentUser = null;
    let allGroups = [];
    let selectedGroup = null;

    // Major dropdown state
    let selectedMajorGroup = null;

    // Course dropdown state
    let selectedCourseName = null;

    // Class dropdown state
    let selectedClass = null;

    // Filter state
    let filterMajor = '';
    let filterCourse = '';
    let filterClass = '';
    let filterStatus = '';

    // Admin state
    let isAdmin = false;

    // ═══════════════════════════════════════════
    // Supabase Init
    // ═══════════════════════════════════════════
    function initSupabaseGroups() {
        let db = initSupabase();
        return db;
    }

    // ═══════════════════════════════════════════
    // Auth Check — استخدام auth-guard.js المشترك
    // ═══════════════════════════════════════════
    async function checkAuth() {
        let result = await window.checkAuth();
        if (!result) return;

        currentUser = result.user;
        let db = result.db;

        // جلب حالة الأدمن من قاعدة البيانات
        try {
            let adminResult = await db
                .from('users')
                .select('is_admin')
                .eq('id', currentUser.id)
                .single();
            isAdmin = !!(adminResult.data && adminResult.data.is_admin);
        } catch (e) {
            isAdmin = false;
        }
    }

    // ═══════════════════════════════════════════
    // Load Groups — N+1 FIX: استعلام واحد بدل N
    // ═══════════════════════════════════════════
    async function loadGroups() {
        let db = getDb();
        if (!db) return;

        try {
            let result = await db
                .from('groups')
                .select('*')
                .order('created_at', { ascending: false });

            if (result.error) throw result.error;

            let groups = result.data;
            if (!groups || groups.length === 0) {
                renderGroups([]);
                showEmptyState();
                return;
            }

            // ✅ استخدام الدالة المشتركة لإثراء بيانات المنشئين
            await window.enrichCreators(groups, db);

            allGroups = groups;
            // Apply active filters (especially default major filter) after loading
            applyFilters();
        } catch (error) {
            showErrorState(error.message || 'فشل تحميل المجموعات');
        } finally {
            document.getElementById('loadingState').classList.add('hidden');
        }
    }

    // ═══════════════════════════════════════════
    // UI States
    // ═══════════════════════════════════════════
    function showEmptyState() {
        document.getElementById('loadingState').classList.add('hidden');
        let el = document.getElementById('emptyState');
        if (el) el.classList.remove('hidden');
    }

    function showErrorState(message) {
        document.getElementById('loadingState').classList.add('hidden');
        let container = document.getElementById('groupsContainer');
        if (container) {
            container.innerHTML = '<div class="col-span-full text-center py-12">'
                + '<div class="text-5xl mb-4">⚠️</div>'
                + '<h3 class="text-xl font-bold text-white mb-2">حدث خطأ في التحميل</h3>'
                + '<p class="text-secondary-400 mb-4">' + (message || 'تعذر تحميل البيانات') + '</p>'
                + '<button onclick="location.reload()" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors">'
                + 'إعادة المحاولة</button></div>';
        }
    }

    // ═══════════════════════════════════════════
    // Render Groups
    // ═══════════════════════════════════════════
    function renderGroups(groups) {
        let container = document.getElementById('groupsContainer');
        let emptyState = document.getElementById('emptyState');

        if (groups.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        container.innerHTML = groups.map(function(group) {
            let progress = (group.current_members / group.max_members) * 100;
            let isFull = group.current_members >= group.max_members;
            let safeName = escapeHtml(group.name || '');
            let safeCode = escapeHtml(group.course_code || '');
            let safeCourse = escapeHtml(group.course_name || '');
            let safeMajor = escapeHtml(group.major || '');

            return '<div class="glass rounded-xl p-4 card-hover cursor-pointer" onclick="openDetailsModal(\'' + group.id + '\')">'
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
                + '<span class="text-secondary-500">عدد الأعضاء</span>'
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
    // Search & Filter (مع Debounce)
    // ═══════════════════════════════════════════
    function setupSearch() {
        let searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', window.debounce(applyFilters, 300));
        }
    }

    function applyFilters() {
        let search = document.getElementById('searchInput').value.toLowerCase();
        let major = filterMajor;
        let course = filterCourse;
        let classNum = filterClass;
        let status = filterStatus;

        let filtered = allGroups.filter(function(group) {
            if (search && !group.name.toLowerCase().includes(search)
                && !group.course_name.toLowerCase().includes(search)
                && !(group.course_code || '').toLowerCase().includes(search)
                && !group.major.toLowerCase().includes(search)) {
                return false;
            }
            if (major && !window.matchMajor(major, group.major)) return false;
            if (course && group.course_code !== course) return false;
            if (classNum && group.class_number !== classNum) return false;
            if (status === 'available' && group.current_members >= group.max_members) return false;
            if (status === 'full' && group.current_members < group.max_members) return false;
            return true;
        });

        renderGroups(filtered);
    }

    window.clearFilters = function() {
        document.getElementById('searchInput').value = '';
        filterMajor = '';
        filterCourse = '';
        filterClass = '';
        filterStatus = '';

        let mi = document.getElementById('filterMajorInput');
        if (mi) { mi.value = ''; mi.placeholder = 'كل التخصصات'; }
        let ci = document.getElementById('filterCourseInput');
        if (ci) { ci.value = ''; ci.placeholder = 'كل المواد'; }
        let cli = document.getElementById('filterClassInput');
        if (cli) { cli.value = ''; cli.placeholder = 'كل الصفوف'; }
        let si = document.getElementById('filterStatusInput');
        if (si) { si.value = ''; si.placeholder = 'كل الحالات'; }

        filterMajorDD.render('');
        filterCourseDD.render('');
        filterClassDD.render('');
        filterStatusDD.render('');

        renderGroups(allGroups);
        let emptyState = document.getElementById('emptyState');
        if (emptyState && allGroups.length > 0) emptyState.classList.add('hidden');
    };

    // ═══════════════════════════════════════════
    // Dropdown Factory — reusable pattern for all dropdowns
    // ═══════════════════════════════════════════
    function createDropdown(cfg) {
        // cfg: { listId, menuId, arrowId, errorId, inputId, stateKey, getItems, renderRow, formatInput, onSelect, filterCase }
        let isOpen = false;

        async function render(q) {
            q = (q || '').trim();
            if (cfg.filterCase === 'upper') q = q.toUpperCase();
            else q = q.toLowerCase();

            let list = document.getElementById(cfg.listId);
            let menu = document.getElementById(cfg.menuId);
            if (!list || !menu) return;

            let allItems = await cfg.getItems();
            let filtered = q
                ? allItems.filter(function(item) { return cfg.matchItem(item, q); }).slice(0, 20)
                : allItems.slice(0, 15);

            list.innerHTML = '';
            filtered.forEach(function(item) {
                let li = document.createElement('li');
                li.className = 'm-row' + (cfg.isSelected(item) ? ' active' : '');
                li.setAttribute('role', 'option');
                li.dataset.code = cfg.getKey(item);
                li.innerHTML = cfg.renderRow(item);
                li.addEventListener('click', function() { select(item); });
                list.appendChild(li);
            });

            if (isOpen) menu.classList.add('open');
            else menu.classList.remove('open');
        }

        function select(item) {
            cfg.onSelect(item);
            let input = document.getElementById(cfg.inputId);
            if (input) {
                input.value = cfg.formatInput(item);
                input.classList.add('valid');
                input.classList.remove('invalid');
            }
            isOpen = false;
            let menu = document.getElementById(cfg.menuId);
            if (menu) menu.classList.remove('open');
            let arrow = document.getElementById(cfg.arrowId);
            if (arrow) arrow.style.transform = '';
            let error = document.getElementById(cfg.errorId);
            if (error) error.classList.add('hidden');
            render('');
        }

        function open() {
            isOpen = true;
            let menu = document.getElementById(cfg.menuId);
            if (menu) menu.classList.add('open');
            let arrow = document.getElementById(cfg.arrowId);
            if (arrow) arrow.style.transform = 'rotate(180deg)';
            let input = document.getElementById(cfg.inputId);
            if (input) {
                render(input.value);
                setTimeout(function() { input.focus(); }, 60);
            }
        }

        function close() {
            isOpen = false;
            let menu = document.getElementById(cfg.menuId);
            if (menu) menu.classList.remove('open');
            let arrow = document.getElementById(cfg.arrowId);
            if (arrow) arrow.style.transform = '';
        }

        function toggle() { isOpen ? close() : open(); }

        return { render, select, open, close, toggle, isOpen: function() { return isOpen; } };
    }

    // Major dropdown
    let majorDD = createDropdown({
        listId: 'majorListGroup', menuId: 'majorMenuGroup', arrowId: 'majorArrowGroup',
        errorId: 'majorErrorGroup', inputId: 'majorInputGroup',
        getItems: window.getMajorsList,
        matchItem: function(m, q) { return m.toLowerCase().includes(q); },
        isSelected: function(m) { return selectedMajorGroup === m; },
        getKey: function(m) { return m; },
        renderRow: function(m) { return '<span class="mi">' + m + '</span><span class="check">&#10003;</span>'; },
        formatInput: function(m) { return m; },
        onSelect: function(m) {
            selectedMajorGroup = m;
            selectedCourseName = null;
            let courseInput = document.getElementById('courseNameInput');
            if (courseInput) { courseInput.value = ''; courseInput.classList.remove('valid', 'invalid'); }
            courseDD.render('');
        },
        filterCase: 'lower',
    });

    // Course dropdown
    let courseDD = createDropdown({
        listId: 'courseNameList', menuId: 'courseNameMenu', arrowId: 'courseNameArrow',
        errorId: 'courseNameError', inputId: 'courseNameInput',
        getItems: async function() {
            let major = selectedMajorGroup || currentUser?.major || 'ITE';
            return await window.getCoursesByMajor(major);
        },
        matchItem: function(c, q) { return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q); },
        isSelected: function(c) { return selectedCourseName && selectedCourseName.code === c.code; },
        getKey: function(c) { return c.code; },
        renderRow: function(c) { return '<span class="mi-course">' + c.name + '</span><span class="mi-code">' + c.code + '</span><span class="check">&#10003;</span>'; },
        formatInput: function(c) { return c.code + ' - ' + c.name; },
        onSelect: function(c) { selectedCourseName = c; },
        filterCase: 'lower',
    });

    // Class dropdown
    let classDD = createDropdown({
        listId: 'classList', menuId: 'classMenu', arrowId: 'classArrow',
        errorId: 'classError', inputId: 'classInput',
        getItems: function() { return Promise.resolve(CLASSES); },
        matchItem: function(c, q) { return c.includes(q); },
        isSelected: function(c) { return selectedClass === c; },
        getKey: function(c) { return c; },
        renderRow: function(c) { return '<span class="mi">' + c + '</span><span class="check">&#10003;</span>'; },
        formatInput: function(c) { return c; },
        onSelect: function(c) { selectedClass = c; },
        filterCase: 'upper',
    });

    // ═══════════════════════════════════════════
    // Filter Dropdowns — قوائم الفلاتر الذكية
    // ═══════════════════════════════════════════
    let filterMajorDD = createDropdown({
        listId: 'filterMajorList', menuId: 'filterMajorMenu', arrowId: 'filterMajorArrow',
        errorId: '', inputId: 'filterMajorInput',
        getItems: async function() { return [''].concat(await window.getMajorsList()); },
        matchItem: function(m, q) { return !m || m.toLowerCase().includes(q); },
        isSelected: function(m) { return filterMajor === m; },
        getKey: function(m) { return m || '__all__'; },
        renderRow: function(m) {
            if (!m) return '<span class="mi" style="color:#94a3b8">كل التخصصات</span><span class="check">&#10003;</span>';
            return '<span class="mi">' + m + '</span><span class="check">&#10003;</span>';
        },
        formatInput: function(m) { return m || ''; },
        onSelect: function(m) {
            filterMajor = m;
            let input = document.getElementById('filterMajorInput');
            if (input) input.placeholder = m || 'كل التخصصات';
            filterCourse = '';
            let ci = document.getElementById('filterCourseInput');
            if (ci) { ci.value = ''; ci.placeholder = 'كل المواد'; }
            filterCourseDD.render('');
            applyFilters();
        },
        filterCase: 'lower',
    });

    let filterCourseDD = createDropdown({
        listId: 'filterCourseList', menuId: 'filterCourseMenu', arrowId: 'filterCourseArrow',
        errorId: '', inputId: 'filterCourseInput',
        getItems: async function() {
            let major = filterMajor || (currentUser && currentUser.major) || '';
            if (!major) {
                let allCourses = [];
                let data = await window.loadSVUCourses();
                Object.keys(data).forEach(function(k) {
                    data[k].forEach(function(c) { allCourses.push(c); });
                });
                return [{ code: '', name: '' }].concat(allCourses);
            }
            let courses = await window.getCoursesByMajor(major);
            return [{ code: '', name: '' }].concat(courses);
        },
        matchItem: function(c, q) {
            if (!c.code) return true;
            return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
        },
        isSelected: function(c) { return filterCourse === c.code; },
        getKey: function(c) { return c.code || '__all__'; },
        renderRow: function(c) {
            if (!c.code) return '<span class="mi-course" style="color:#94a3b8">كل المواد</span><span class="check">&#10003;</span>';
            return '<span class="mi-course">' + c.name + '</span><span class="mi-code">' + c.code + '</span><span class="check">&#10003;</span>';
        },
        formatInput: function(c) { return c.code ? c.code + ' - ' + c.name : ''; },
        onSelect: function(c) {
            filterCourse = c.code || '';
            let input = document.getElementById('filterCourseInput');
            if (input) input.placeholder = c.code ? (c.code + ' - ' + c.name) : 'كل المواد';
            applyFilters();
        },
        filterCase: 'lower',
    });

    let filterClassDD = createDropdown({
        listId: 'filterClassList', menuId: 'filterClassMenu', arrowId: 'filterClassArrow',
        errorId: '', inputId: 'filterClassInput',
        getItems: function() { return Promise.resolve([''].concat(CLASSES)); },
        matchItem: function(c, q) { return !c || c.includes(q); },
        isSelected: function(c) { return filterClass === c; },
        getKey: function(c) { return c || '__all__'; },
        renderRow: function(c) {
            if (!c) return '<span class="mi" style="color:#94a3b8">كل الصفوف</span><span class="check">&#10003;</span>';
            return '<span class="mi">' + c + '</span><span class="check">&#10003;</span>';
        },
        formatInput: function(c) { return c || ''; },
        onSelect: function(c) {
            filterClass = c;
            let input = document.getElementById('filterClassInput');
            if (input) input.placeholder = c || 'كل الصفوف';
            applyFilters();
        },
        filterCase: 'upper',
    });

    let filterStatusDD = createDropdown({
        listId: 'filterStatusList', menuId: 'filterStatusMenu', arrowId: 'filterStatusArrow',
        errorId: '', inputId: 'filterStatusInput',
        getItems: function() {
            return Promise.resolve([
                { value: '', label: 'كل الحالات' },
                { value: 'available', label: 'متاحة' },
                { value: 'full', label: 'ممتلئة' },
            ]);
        },
        matchItem: function(s, q) { return !s.value || s.label.includes(q); },
        isSelected: function(s) { return filterStatus === s.value; },
        getKey: function(s) { return s.value || '__all__'; },
        renderRow: function(s) {
            return '<span class="mi"' + (!s.value ? ' style="color:#94a3b8"' : '') + '>' + s.label + '</span><span class="check">&#10003;</span>';
        },
        formatInput: function(s) { return s.value ? s.label : ''; },
        onSelect: function(s) {
            filterStatus = s.value;
            let input = document.getElementById('filterStatusInput');
            if (input) input.placeholder = s.label || 'كل الحالات';
            applyFilters();
        },
        filterCase: 'lower',
    });

    // ═══════════════════════════════════════════
    // Create Group Modal
    // ═══════════════════════════════════════════
    window.openCreateModal = async function() {
        let majorInput = document.getElementById('majorInputGroup');
        if (currentUser && currentUser.major) {
            let resolvedMajor = await window.resolveMajorKey(currentUser.major);
            selectedMajorGroup = resolvedMajor;
            if (majorInput) {
                majorInput.value = resolvedMajor;
                majorInput.classList.add('valid');
            }
            courseDD.render('');
        } else {
            selectedMajorGroup = null;
            if (majorInput) {
                majorInput.value = '';
                majorInput.classList.remove('valid');
            }
        }
        document.getElementById('createModal').classList.remove('hidden');
        document.getElementById('createModal').classList.add('flex');
    };

    window.closeCreateModal = function() {
        document.getElementById('createModal').classList.add('hidden');
        document.getElementById('createModal').classList.remove('flex');
        document.getElementById('createGroupForm').reset();

        selectedMajorGroup = null;
        let majorInput = document.getElementById('majorInputGroup');
        if (majorInput) {
            majorInput.value = '';
            majorInput.classList.remove('valid', 'invalid');
        }
        majorDD.close();

        let fields = ['groupName', 'courseNameInput', 'classInput', 'maxMembers', 'whatsappLink'];
        fields.forEach(function(id) {
            let el = document.getElementById(id);
            if (el) el.classList.remove('valid', 'invalid');
        });

        selectedCourseName = null;
        selectedClass = null;
        courseDD.close();
        classDD.close();

        let errors = ['groupNameError', 'courseNameError', 'classError', 'majorErrorGroup', 'maxMembersError', 'whatsappError'];
        errors.forEach(function(id) {
            let el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
    };

    // ═══════════════════════════════════════════
    // Validation
    // ═══════════════════════════════════════════
    function showError(fieldId, errorId, show) {
        let field = document.getElementById(fieldId);
        let error = document.getElementById(errorId);
        if (show !== false) {
            field.classList.add('invalid');
            field.classList.remove('valid');
            if (error) error.classList.remove('hidden');
        } else {
            field.classList.remove('invalid');
            field.classList.add('valid');
            if (error) error.classList.add('hidden');
        }
    }

    function validateForm() {
        let valid = true;

        if (!document.getElementById('groupName').value.trim()) {
            showError('groupName', 'groupNameError');
            valid = false;
        } else {
            showError('groupName', 'groupNameError', false);
        }

        if (!selectedCourseName) {
            showError('courseNameInput', 'courseNameError');
            valid = false;
        } else {
            showError('courseNameInput', 'courseNameError', false);
        }

        if (!selectedClass) {
            showError('classInput', 'classError');
            valid = false;
        } else {
            showError('classInput', 'classError', false);
        }

        if (!selectedMajorGroup) {
            showError('majorInputGroup', 'majorErrorGroup');
            valid = false;
        } else {
            showError('majorInputGroup', 'majorErrorGroup', false);
        }

        let maxMembers = parseInt(document.getElementById('maxMembers').value);
        if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 20) {
            showError('maxMembers', 'maxMembersError');
            valid = false;
        } else {
            showError('maxMembers', 'maxMembersError', false);
        }

        if (!document.getElementById('whatsappLink').value.trim()) {
            showError('whatsappLink', 'whatsappError');
            valid = false;
        } else {
            showError('whatsappLink', 'whatsappError', false);
        }

        return valid;
    }

    // ═══════════════════════════════════════════
    // Create Group Submit
    // ═══════════════════════════════════════════
    document.getElementById('createGroupForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        let btn = document.getElementById('createBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> جاري الإنشاء...</span>';

        let groupData = {
            name: document.getElementById('groupName').value.trim(),
            course_name: selectedCourseName ? selectedCourseName.name : '',
            course_code: selectedCourseName ? selectedCourseName.code : '',
            class_number: selectedClass,
            doctor_name: null,
            major: selectedMajorGroup,
            max_members: parseInt(document.getElementById('maxMembers').value),
            current_members: 1,
            whatsapp_link: document.getElementById('whatsappLink').value.trim(),
            group_link: document.getElementById('groupLink').value.trim() || null,
            is_full: false,
            creator_id: currentUser.id,
            creator_name: ((currentUser.first_name || '') + ' ' + (currentUser.last_name || '')).trim() || currentUser.username || 'مستخدم'
        };

        try {
            let db = getDb();
            if (!db) {
                showToast('تعذر الاتصال بالخادم', 'error');
                return;
            }

            let insertResult = await db.from('groups').insert(groupData).select().single();
            if (insertResult.error) throw insertResult.error;

            await db.from('group_members').insert({
                group_id: insertResult.data.id,
                user_id: currentUser.id
            });

            showToast('✅ تم إنشاء المجموعة بنجاح! أنت الآن عضو فيها', 'success');
            closeCreateModal();
            await loadGroups();
        } catch (error) {
            showToast('فشل إنشاء المجموعة: ' + (error.message || 'خطأ غير معروف'), 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'إنشاء المجموعة';
        }
    });

    // ═══════════════════════════════════════════
    // Details Modal
    // ═══════════════════════════════════════════
    window.openDetailsModal = function(groupId) {
        selectedGroup = allGroups.find(function(g) { return String(g.id) === String(groupId); });
        if (!selectedGroup) return;

        document.getElementById('detailName').textContent = selectedGroup.name;
        document.getElementById('detailCode').textContent = selectedGroup.course_code;
        document.getElementById('detailCourse').textContent = selectedGroup.course_name;
        document.getElementById('detailMajor').textContent = selectedGroup.major;

        let detailClassRow = document.getElementById('detailClass').closest('.flex');
        let detailDoctorRow = document.getElementById('detailDoctor').closest('.flex');
        if (selectedGroup.class_number) {
            document.getElementById('detailClass').textContent = selectedGroup.class_number;
            detailClassRow.classList.remove('hidden');
        } else {
            detailClassRow.classList.add('hidden');
        }
        if (selectedGroup.doctor_name) {
            document.getElementById('detailDoctor').textContent = selectedGroup.doctor_name;
            detailDoctorRow.classList.remove('hidden');
        } else {
            detailDoctorRow.classList.add('hidden');
        }

        document.getElementById('detailCurrent').textContent = selectedGroup.current_members;
        document.getElementById('detailMax').textContent = selectedGroup.max_members;

        let progress = (selectedGroup.current_members / selectedGroup.max_members) * 100;
        document.getElementById('detailProgress').style.width = progress + '%';

        let isFull = selectedGroup.current_members >= selectedGroup.max_members;
        let statusEl = document.getElementById('detailStatus');
        if (isFull) {
            statusEl.textContent = 'ممتلئة - لا يمكن الانضمام';
            statusEl.className = 'text-xs text-center mt-2 text-red-400';
        } else {
            statusEl.textContent = 'متاحة - يمكن الانضمام';
            statusEl.className = 'text-xs text-center mt-2 text-green-400';
        }

        let creatorFullName = selectedGroup._creatorFullName || selectedGroup.creator_name || 'مستخدم';
        let creatorUsername = selectedGroup._creatorUsername || selectedGroup.creator_name || '';
        document.getElementById('detailCreator').textContent = creatorFullName;
        document.getElementById('detailCreatorInitial').textContent = (creatorFullName || 'م')[0].toUpperCase();
        document.getElementById('detailCreatorUsername').textContent = creatorUsername;
        document.getElementById('detailDate').textContent = formatDate(selectedGroup.created_at);

        document.getElementById('detailWhatsapp').href = validateUrl(selectedGroup.whatsapp_link) || '#';

        let groupLinkEl = document.getElementById('detailGroupLink');
        if (validateUrl(selectedGroup.group_link)) {
            groupLinkEl.href = validateUrl(selectedGroup.group_link);
            groupLinkEl.classList.remove('hidden');
        } else {
            groupLinkEl.classList.add('hidden');
        }

        checkMembershipAndSetupJoin();

        // إظهار/إخفاء زر الحذف
        let deleteBtn = document.getElementById('deleteGroupBtn');
        if (deleteBtn) {
            if (canDeleteGroup(selectedGroup)) {
                deleteBtn.classList.remove('hidden');
                deleteBtn.setAttribute('data-group-id', selectedGroup.id);
                deleteBtn.onclick = function() { deleteGroup(selectedGroup.id); };
            } else {
                deleteBtn.classList.add('hidden');
            }
        }

        document.getElementById('detailsModal').classList.remove('hidden');
        document.getElementById('detailsModal').classList.add('flex');
    };

    async function checkMembershipAndSetupJoin() {
        let joinBtn = document.getElementById('joinBtn');
        let confirmJoinBtn = document.getElementById('confirmJoinBtn');
        let alreadyMemberMsg = document.getElementById('alreadyMemberMsg');
        let whatsappBtn = document.getElementById('detailWhatsapp');
        let majorWarning = document.getElementById('majorMismatchWarning');
        let isFull = selectedGroup.current_members >= selectedGroup.max_members;

        joinBtn.classList.remove('hidden');
        confirmJoinBtn.classList.add('hidden');
        alreadyMemberMsg.classList.add('hidden');
        whatsappBtn.classList.add('hidden');
        majorWarning.classList.add('hidden');

        if (isFull) {
            joinBtn.disabled = true;
            joinBtn.classList.add('opacity-50', 'cursor-not-allowed');
            joinBtn.textContent = 'المجموعة ممتلئة';
            return;
        }

        let isMember = false;
        try {
            let db = getDb();
            if (db && currentUser && currentUser.id) {
                let existing = await db.from('group_members')
                    .select('id')
                    .eq('group_id', selectedGroup.id)
                    .eq('user_id', currentUser.id)
                    .maybeSingle();
                isMember = !!existing.data;
            }
        } catch (e) { /* ignore */ }

        if (isMember) {
            joinBtn.classList.add('hidden');
            alreadyMemberMsg.classList.remove('hidden');
            whatsappBtn.classList.remove('hidden');
        } else {
            joinBtn.disabled = false;
            joinBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            joinBtn.textContent = 'انضم للمجموعة';
        }
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

    window.joinGroup = async function() {
        if (!selectedGroup || selectedGroup.current_members >= selectedGroup.max_members) {
            showToast('المجموعة ممتلئة!', 'error');
            return;
        }

        let confirmBtn = document.getElementById('confirmJoinBtn');
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<svg class="animate-spin w-5 h-5 inline-block ml-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> جاري الانضمام...';

        try {
            let db = getDb();
            if (!db) {
                showToast('تعذر الاتصال بالخادم', 'error');
                return;
            }

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

            selectedGroup.current_members++;
            document.getElementById('detailCurrent').textContent = selectedGroup.current_members;
            let progress = (selectedGroup.current_members / selectedGroup.max_members) * 100;
            document.getElementById('detailProgress').style.width = progress + '%';
            renderGroups(allGroups);
        } catch (error) {
            showToast('فشل الانضمام للمجموعة', 'error');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<svg class="w-5 h-5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> تأكيد الانضمام';
        }
    };

    // ═══════════════════════════════════════════
    // Delete Group
    // ═══════════════════════════════════════════
    async function deleteGroup(groupId) {
        if (!groupId) {
            showToast('خطأ: لم يتم تحديد المجموعة', 'error');
            return;
        }

        // تأكيد الحذف
        if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }

        try {
            let db = getDb();
            if (!db) {
                showToast('تعذر الاتصال بالخادم', 'error');
                return;
            }

            // حذف أعضاء المجموعة أولاً
            await db.from('group_members')
                .delete()
                .eq('group_id', groupId);

            // حذف المجموعة
            let result = await db.from('groups')
                .delete()
                .eq('id', groupId);

            if (result.error) throw result.error;

            showToast('تم حذف المجموعة بنجاح', 'success');

            // إغلاق مودال التفاصيل وإعادة تحميل القائمة
            closeDetailsModal();
            await loadGroups();
        } catch (error) {
            showToast('فشل حذف المجموعة: ' + (error.message || 'خطأ غير معروف'), 'error');
        }
    }

    // التحقق من إمكانية الحذف (صاحب المجموعة أو أدمن)
    function canDeleteGroup(group) {
        if (!currentUser || !group) return false;
        if (isAdmin) return true;
        return group.creator_id === currentUser.id;
    }

    // ═══════════════════════════════════════════
    // Initialize
    // ═══════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', async function() {
        // Initialize theme and language
        window.initializeTheme?.();
        window.i18n?.initLang?.();

        initSupabaseGroups();
        await checkAuth();
        await loadGroups();
        setupSearch();

        // ── Filter dropdown events ──
        // Major filter
        let fMajorInput = document.getElementById('filterMajorInput');
        let fMajorWrapper = document.getElementById('filterMajorWrapper');
        if (fMajorInput) {
            fMajorInput.addEventListener('click', function(e) { e.stopPropagation(); filterMajorDD.toggle(); });
            fMajorInput.addEventListener('input', function(e) {
                e.stopPropagation();
                filterMajor = '';
                filterMajorDD.render(this.value);
                document.getElementById('filterMajorMenu').classList.add('open');
            });
            fMajorInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') filterMajorDD.close();
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    let first = document.querySelector('#filterMajorList .m-row');
                    if (first) first.click();
                }
            });
            filterMajorDD.render('');
        }

        // Course filter
        let fCourseInput = document.getElementById('filterCourseInput');
        let fCourseWrapper = document.getElementById('filterCourseWrapper');
        if (fCourseInput) {
            fCourseInput.addEventListener('click', function(e) { e.stopPropagation(); filterCourseDD.toggle(); });
            fCourseInput.addEventListener('input', function(e) {
                e.stopPropagation();
                filterCourseDD.render(this.value);
                document.getElementById('filterCourseMenu').classList.add('open');
            });
            fCourseInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') filterCourseDD.close();
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    let first = document.querySelector('#filterCourseList .m-row');
                    if (first) first.click();
                }
            });
            filterCourseDD.render('');
        }

        // Class filter
        let fClassInput = document.getElementById('filterClassInput');
        let fClassWrapper = document.getElementById('filterClassWrapper');
        if (fClassInput) {
            fClassInput.addEventListener('click', function(e) { e.stopPropagation(); filterClassDD.toggle(); });
            fClassInput.addEventListener('input', function(e) {
                e.stopPropagation();
                filterClassDD.render(this.value);
                document.getElementById('filterClassMenu').classList.add('open');
            });
            fClassInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') filterClassDD.close();
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    let first = document.querySelector('#filterClassList .m-row');
                    if (first) first.click();
                }
            });
            filterClassDD.render('');
        }

        // Status filter
        let fStatusInput = document.getElementById('filterStatusInput');
        let fStatusWrapper = document.getElementById('filterStatusWrapper');
        if (fStatusInput) {
            fStatusInput.addEventListener('click', function(e) { e.stopPropagation(); filterStatusDD.toggle(); });
            fStatusInput.addEventListener('input', function(e) {
                e.stopPropagation();
                filterStatusDD.render(this.value);
                document.getElementById('filterStatusMenu').classList.add('open');
            });
            fStatusInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') filterStatusDD.close();
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    let first = document.querySelector('#filterStatusList .m-row');
                    if (first) first.click();
                }
            });
            filterStatusDD.render('');
        }

        // Close filter dropdowns on outside click
        document.addEventListener('click', function(e) {
            if (filterMajorDD.isOpen() && fMajorWrapper && !fMajorWrapper.contains(e.target)) filterMajorDD.close();
            if (filterCourseDD.isOpen() && fCourseWrapper && !fCourseWrapper.contains(e.target)) filterCourseDD.close();
            if (filterClassDD.isOpen() && fClassWrapper && !fClassWrapper.contains(e.target)) filterClassDD.close();
            if (filterStatusDD.isOpen() && fStatusWrapper && !fStatusWrapper.contains(e.target)) filterStatusDD.close();
        });

        // ── Default major filter to user's specialization ──
        if (currentUser && currentUser.major) {
            let resolvedMajor = await window.resolveMajorKey(currentUser.major);
            filterMajor = resolvedMajor;
            let majorInput = document.getElementById('filterMajorInput');
            if (majorInput) majorInput.placeholder = resolvedMajor;
            // Refresh course filter for user's major
            filterCourseDD.render('');
            // Apply filter to show only groups matching user's specialization
            applyFilters();
        }

        // ── Create modal dropdown events ──
        // Major dropdown
        let majorInput = document.getElementById('majorInputGroup');
        let majorWrapper = document.getElementById('majorWrapperGroup');
        if (majorInput) {
            majorInput.addEventListener('click', function(e) { e.stopPropagation(); majorDD.toggle(); });
            majorInput.addEventListener('input', function(e) {
                e.stopPropagation();
                selectedMajorGroup = null;
                this.classList.remove('valid');
                majorDD.render(this.value);
                document.getElementById('majorMenuGroup').classList.add('open');
            });
            majorInput.addEventListener('keydown', function(e) {
                e.stopPropagation();
                if (e.key === 'Escape') majorDD.close();
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    let first = document.querySelector('#majorListGroup .m-row');
                    if (first) first.click();
                }
            });
            document.addEventListener('click', function(e) {
                if (majorDD.isOpen() && majorWrapper && !majorWrapper.contains(e.target)) majorDD.close();
            });
            majorDD.render('');
        }

        // Course name dropdown events
        let courseNameInput = document.getElementById('courseNameInput');
        let courseNameWrapper = document.getElementById('courseNameWrapper');
        if (courseNameInput) {
            courseNameInput.addEventListener('click', function(e) { e.stopPropagation(); courseDD.toggle(); });
            courseNameInput.addEventListener('input', function(e) {
                e.stopPropagation();
                selectedCourseName = null;
                this.classList.remove('valid');
                courseDD.render(this.value);
                document.getElementById('courseNameMenu').classList.add('open');
            });
            courseNameInput.addEventListener('keydown', function(e) {
                e.stopPropagation();
                if (e.key === 'Escape') courseDD.close();
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    let first = document.querySelector('#courseNameList .m-row');
                    if (first) first.click();
                }
            });
        }

        // Class dropdown events
        let classInput = document.getElementById('classInput');
        let classWrapper = document.getElementById('classWrapper');
        if (classInput) {
            classInput.addEventListener('click', function(e) { e.stopPropagation(); classDD.toggle(); });
            classInput.addEventListener('input', function(e) {
                e.stopPropagation();
                selectedClass = null;
                this.classList.remove('valid');
                classDD.render(this.value);
                document.getElementById('classMenu').classList.add('open');
            });
            classInput.addEventListener('keydown', function(e) {
                e.stopPropagation();
                if (e.key === 'Escape') classDD.close();
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    let first = document.querySelector('#classList .m-row');
                    if (first) first.click();
                }
            });
            classDD.render('');
        }

        // Close dropdowns on outside click
        document.addEventListener('click', function(e) {
            if (majorDD.isOpen() && majorWrapper && !majorWrapper.contains(e.target)) majorDD.close();
            if (courseDD.isOpen() && courseNameWrapper && !courseNameWrapper.contains(e.target)) courseDD.close();
            if (classDD.isOpen() && classWrapper && !classWrapper.contains(e.target)) classDD.close();
        });

        // Modal close on outside click
        document.getElementById('createModal').addEventListener('click', function(e) {
            if (e.target.id === 'createModal') window.closeCreateModal();
        });
        document.getElementById('detailsModal').addEventListener('click', function(e) {
            if (e.target.id === 'detailsModal') window.closeDetailsModal();
        });

        // Modal close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (!document.getElementById('createModal').classList.contains('hidden')) {
                    window.closeCreateModal();
                } else if (!document.getElementById('detailsModal').classList.contains('hidden')) {
                    window.closeDetailsModal();
                }
            }
        });
    });

    // Expose for HTML onclick/onchange
    window.applyFilters = applyFilters;
    window.clearFilters = clearFilters;
    window.logout = logout;
    window.deleteGroup = deleteGroup;
})();
