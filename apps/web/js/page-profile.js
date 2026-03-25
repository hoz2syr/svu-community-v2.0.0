/**
 * ════════════════════════════════════════════════════════════════
 * Profile Page Logic
 * الملف الشخصي — مجموعاتي + إنشائي + إدارة المجموعات
 * ════════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════
    // State
    // ═══════════════════════════════════════════
    let currentUser = null;
    let joinedGroups = [];
    let createdGroups = [];
    let currentTab = 'joined';
    let isAdmin = false;

    // ═══════════════════════════════════════════
    // Auth Check — استخدام auth-guard.js المشترك
    // ═══════════════════════════════════════════
    async function checkAuth() {
        let result = await window.checkAuth();
        if (!result) return;

        currentUser = result.user;
        let db = result.db;

        // جلب حالة الأدمن
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
    // Render Profile Info
    // ═══════════════════════════════════════════
    function renderProfileInfo() {
        let fullName = ((currentUser.first_name || '') + ' ' + (currentUser.last_name || '')).trim() || 'مستخدم';
        let initial = (currentUser.first_name || currentUser.username || 'م')[0].toUpperCase();

        document.getElementById('profileName').textContent = fullName;
        document.getElementById('profileInitial').textContent = initial;
        document.getElementById('profileUsername').textContent = '@' + (currentUser.username || '');
        document.getElementById('profileEmail').innerHTML = '<svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> ' + escapeHtml(currentUser.email || '');
        document.getElementById('profileMajor').textContent = currentUser.major || '';
    }

    // ═══════════════════════════════════════════
    // Load Joined Groups
    // ═══════════════════════════════════════════
    async function loadJoinedGroups() {
        let db = getDb();
        if (!db) return;

        let joinedLoading = document.getElementById('joinedLoading');
        let joinedEmpty = document.getElementById('joinedEmpty');
        let joinedGrid = document.getElementById('joinedGrid');

        try {
            // جلب group_ids التي انضم لها المستخدم
            let memberResult = await db
                .from('group_members')
                .select('group_id')
                .eq('user_id', currentUser.id);

            if (memberResult.error) throw memberResult.error;

            let groupIds = (memberResult.data || []).map(function(m) { return m.group_id; });

            if (groupIds.length === 0) {
                joinedGroups = [];
                joinedLoading.classList.add('hidden');
                joinedEmpty.classList.remove('hidden');
                document.getElementById('joinedCount').textContent = '0';
                return;
            }

            // جلب المجموعات
            let groupsResult = await db
                .from('groups')
                .select('*')
                .in('id', groupIds)
                .order('created_at', { ascending: false });

            if (groupsResult.error) throw groupsResult.error;

            joinedGroups = groupsResult.data || [];

            // استخدام الدالة المشتركة لإثراء بيانات المنشئين
            await window.enrichCreators(joinedGroups, db);

            joinedLoading.classList.add('hidden');
            if (joinedGroups.length === 0) {
                joinedEmpty.classList.remove('hidden');
            } else {
                renderJoinedGroups(joinedGroups);
            }

            document.getElementById('joinedCount').textContent = joinedGroups.length;
        } catch (error) {
            joinedLoading.classList.add('hidden');
            joinedGrid.innerHTML = '<div class="col-span-full text-center py-8 text-red-400">فشل تحميل المجموعات</div>';
        }
    }

    // ═══════════════════════════════════════════
    // Load Created Groups
    // ═══════════════════════════════════════════
    async function loadCreatedGroups() {
        let db = getDb();
        if (!db) return;

        let createdLoading = document.getElementById('createdLoading');
        let createdEmpty = document.getElementById('createdEmpty');
        let createdGrid = document.getElementById('createdGrid');

        try {
            let result = await db
                .from('groups')
                .select('*')
                .eq('creator_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (result.error) throw result.error;

            createdGroups = result.data || [];

            // استخدام الدالة المشتركة لإثراء بيانات المنشئين
            await window.enrichCreators(createdGroups, db);

            createdLoading.classList.add('hidden');
            if (createdGroups.length === 0) {
                createdEmpty.classList.remove('hidden');
            } else {
                renderCreatedGroups(createdGroups);
            }

            document.getElementById('createdCount').textContent = createdGroups.length;
        } catch (error) {
            createdLoading.classList.add('hidden');
            createdGrid.innerHTML = '<div class="col-span-full text-center py-8 text-red-400">فشل تحميل المجموعات</div>';
        }
    }

    // ═══════════════════════════════════════════
    // Render Joined Groups
    // ═══════════════════════════════════════════
    function renderJoinedGroups(groups) {
        let container = document.getElementById('joinedGrid');
        container.innerHTML = groups.map(function(group) {
            return renderGroupCard(group, false);
        }).join('');
    }

    // ═══════════════════════════════════════════
    // Render Created Groups (with management)
    // ═══════════════════════════════════════════
    function renderCreatedGroups(groups) {
        let container = document.getElementById('createdGrid');
        container.innerHTML = groups.map(function(group) {
            return renderGroupCard(group, true);
        }).join('');
    }

    // ═══════════════════════════════════════════
    // Render Group Card
    // ═══════════════════════════════════════════
    function renderGroupCard(group, isOwner) {
        let progress = (group.current_members / group.max_members) * 100;
        let isFull = group.current_members >= group.max_members;
        let safeName = escapeHtml(group.name || '');
        let safeCode = escapeHtml(group.course_code || '');
        let safeCourse = escapeHtml(group.course_name || '');
        let safeMajor = escapeHtml(group.major || '');

        let actionsHtml = '';
        if (isOwner) {
            actionsHtml = '<div class="flex gap-2 mt-3 pt-3 border-t border-white/5">'
                + '<button onclick="event.stopPropagation(); openEditGroupModal(\'' + group.id + '\')" '
                + 'class="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-600/20 hover:bg-primary-600/40 text-primary-400 rounded-lg text-xs font-medium transition">'
                + '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>'
                + 'تعديل</button>'
                + '<button onclick="event.stopPropagation(); openMembersModal(\'' + group.id + '\')" '
                + 'class="flex-1 flex items-center justify-center gap-1.5 py-2 bg-accent-600/20 hover:bg-accent-600/40 text-accent-400 rounded-lg text-xs font-medium transition">'
                + '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
                + 'الأعضاء (' + group.current_members + ')</button>'
                + '</div>';
        }

        return '<div class="glass rounded-xl p-4 card-hover">'
            + '<div class="flex justify-between items-start mb-3">'
            + '<span class="px-2 py-1 ' + (isFull ? 'bg-red-600/30 text-red-400' : 'bg-green-600/30 text-green-400') + ' rounded-lg text-xs font-medium">'
            + (isFull ? 'ممتلئة' : 'متاحة') + '</span>'
            + '<span class="px-2 py-1 bg-primary-600/30 text-primary-400 rounded-lg text-xs">' + safeCode + '</span>'
            + '</div>'
            + '<h3 class="text-white font-semibold mb-2 line-clamp-2">' + safeName + '</h3>'
            + '<div class="space-y-1 text-sm text-secondary-400 mb-3">'
            + '<p class="flex items-center gap-1.5">'
            + '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
            + safeCourse + '</p>'
            + '<p class="flex items-center gap-1.5">'
            + '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>'
            + safeMajor + '</p>'
            + '</div>'
            // Progress bar
            + '<div class="mb-1">'
            + '<div class="flex justify-between text-xs mb-1">'
            + '<span class="text-secondary-500">الأعضاء</span>'
            + '<span class="' + (isFull ? 'text-red-400' : 'text-white') + '">' + group.current_members + '/' + group.max_members + '</span>'
            + '</div>'
            + '<div class="h-2 bg-secondary-800 rounded-full overflow-hidden">'
            + '<div class="h-full ' + (isFull ? 'bg-red-500' : 'bg-gradient-to-r from-primary-500 to-accent-500') + ' rounded-full transition-all duration-500" '
            + 'style="width: ' + progress + '%"></div>'
            + '</div>'
            + '</div>'
            + actionsHtml
            + '</div>';
    }

    // ═══════════════════════════════════════════
    // Tab Switching
    // ═══════════════════════════════════════════
    window.switchTab = function(tab) {
        currentTab = tab;

        let tabJoined = document.getElementById('tabJoined');
        let tabCreated = document.getElementById('tabCreated');
        let joinedContent = document.getElementById('joinedContent');
        let createdContent = document.getElementById('createdContent');

        if (tab === 'joined') {
            tabJoined.classList.add('active');
            tabJoined.classList.remove('text-secondary-400');
            tabCreated.classList.remove('active');
            tabCreated.classList.add('text-secondary-400');
            joinedContent.classList.remove('hidden');
            createdContent.classList.add('hidden');
        } else {
            tabCreated.classList.add('active');
            tabCreated.classList.remove('text-secondary-400');
            tabJoined.classList.remove('active');
            tabJoined.classList.add('text-secondary-400');
            createdContent.classList.remove('hidden');
            joinedContent.classList.add('hidden');
        }
    };

    // ═══════════════════════════════════════════
    // Edit Profile Modal
    // ═══════════════════════════════════════════
    window.openEditProfileModal = function() {
        document.getElementById('editFirstName').value = currentUser.first_name || '';
        document.getElementById('editLastName').value = currentUser.last_name || '';
        document.getElementById('editProfileModal').classList.remove('hidden');
        document.getElementById('editProfileModal').classList.add('flex');
    };

    window.closeEditProfileModal = function() {
        document.getElementById('editProfileModal').classList.add('hidden');
        document.getElementById('editProfileModal').classList.remove('flex');
    };

    document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        let firstName = document.getElementById('editFirstName').value.trim();
        let lastName = document.getElementById('editLastName').value.trim();

        if (!firstName) {
            showToast('يرجى إدخال الاسم الأول', 'error');
            return;
        }

        let btn = document.getElementById('saveProfileBtn');
        btn.disabled = true;
        btn.textContent = 'جاري الحفظ...';

        try {
            let db = getDb();
            if (!db) {
                showToast('تعذر الاتصال بالخادم', 'error');
                return;
            }

            let result = await db
                .from('users')
                .update({ first_name: firstName, last_name: lastName })
                .eq('id', currentUser.id);

            if (result.error) throw result.error;

            // تحديث البيانات المحلية
            currentUser.first_name = firstName;
            currentUser.last_name = lastName;
            window.updateUserData({ first_name: firstName, last_name: lastName });

            renderProfileInfo();
            closeEditProfileModal();
            showToast('تم تحديث الملف الشخصي بنجاح', 'success');
        } catch (error) {
            showToast('فشل تحديث الملف الشخصي: ' + (error.message || 'خطأ غير معروف'), 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'حفظ التغييرات';
        }
    });

    // ═══════════════════════════════════════════
    // Edit Group Modal
    // ═══════════════════════════════════════════
    window.openEditGroupModal = function(groupId) {
        let group = createdGroups.find(function(g) { return String(g.id) === String(groupId); });
        if (!group) {
            showToast('لم يتم العثور على المجموعة', 'error');
            return;
        }

        document.getElementById('editGroupId').value = group.id;
        document.getElementById('editGroupName').value = group.name || '';
        document.getElementById('editMaxMembers').value = group.max_members || 5;
        document.getElementById('editWhatsappLink').value = group.whatsapp_link || '';
        document.getElementById('editGroupLink').value = group.group_link || '';

        document.getElementById('editGroupModal').classList.remove('hidden');
        document.getElementById('editGroupModal').classList.add('flex');
    };

    window.closeEditGroupModal = function() {
        document.getElementById('editGroupModal').classList.add('hidden');
        document.getElementById('editGroupModal').classList.remove('flex');
    };

    document.getElementById('editGroupForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        let groupId = document.getElementById('editGroupId').value;
        let name = document.getElementById('editGroupName').value.trim();
        let maxMembers = parseInt(document.getElementById('editMaxMembers').value);
        let whatsappLink = document.getElementById('editWhatsappLink').value.trim();
        let groupLink = document.getElementById('editGroupLink').value.trim();

        if (!name) {
            showToast('يرجى إدخال اسم المجموعة', 'error');
            return;
        }

        if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 20) {
            showToast('عدد الأعضاء يجب أن يكون بين 2 و 20', 'error');
            return;
        }

        if (!whatsappLink) {
            showToast('يرجى إدخال رابط مجموعة الواتساب', 'error');
            return;
        }

        let btn = document.getElementById('saveGroupBtn');
        btn.disabled = true;
        btn.textContent = 'جاري الحفظ...';

        try {
            let db = getDb();
            if (!db) {
                showToast('تعذر الاتصال بالخادم', 'error');
                return;
            }

            // التحقق من أن عدد الأعضاء الحاليين لا يتجاوز الحد الجديد
            let group = createdGroups.find(function(g) { return String(g.id) === String(groupId); });
            if (group && group.current_members > maxMembers) {
                showToast('لا يمكن تقليل عدد الأعضاء الأقصى إلى أقل من العدد الحالي (' + group.current_members + ')', 'error');
                return;
            }

            let updateData = {
                name: name,
                max_members: maxMembers,
                whatsapp_link: whatsappLink,
                group_link: groupLink || null
            };

            let result = await db
                .from('groups')
                .update(updateData)
                .eq('id', groupId);

            if (result.error) throw result.error;

            showToast('تم تحديث المجموعة بنجاح', 'success');
            closeEditGroupModal();

            // إعادة تحميل المجموعات
            await loadCreatedGroups();
        } catch (error) {
            showToast('فشل تحديث المجموعة: ' + (error.message || 'خطأ غير معروف'), 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'حفظ التغييرات';
        }
    });

    // ═══════════════════════════════════════════
    // Members Modal
    // ═══════════════════════════════════════════
    window.openMembersModal = async function(groupId) {
        let group = createdGroups.find(function(g) { return String(g.id) === String(groupId); });
        if (!group) return;

        document.getElementById('membersGroupName').textContent = group.name;
        document.getElementById('membersCountBadge').textContent = group.current_members;
        document.getElementById('membersList').innerHTML = '<div class="text-center py-4"><div class="w-8 h-8 mx-auto border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>';

        document.getElementById('membersModal').classList.remove('hidden');
        document.getElementById('membersModal').classList.add('flex');

        try {
            let db = getDb();
            if (!db) return;

            // جلب أعضاء المجموعة
            let membersResult = await db
                .from('group_members')
                .select('user_id, created_at')
                .eq('group_id', groupId);

            if (membersResult.error) throw membersResult.error;

            let members = membersResult.data || [];
            if (members.length === 0) {
                document.getElementById('membersList').innerHTML = '<div class="text-center py-8 text-secondary-400">لا يوجد أعضاء</div>';
                return;
            }

            // جلب بيانات المستخدمين
            let userIds = members.map(function(m) { return m.user_id; });
            let usersResult = await db
                .from('users')
                .select('id, first_name, last_name, username, email')
                .in('id', userIds);

            let usersMap = {};
            if (usersResult.data) {
                for (let i = 0; i < usersResult.data.length; i++) {
                    usersMap[usersResult.data[i].id] = usersResult.data[i];
                }
            }

            // بناء قائمة الأعضاء
            let membersListEl = document.getElementById('membersList');
            membersListEl.innerHTML = members.map(function(member) {
                let user = usersMap[member.user_id];
                let fullName = user
                    ? ((user.first_name || '') + ' ' + (user.last_name || '')).trim() || user.username || user.email
                    : 'مستخدم غير معروف';
                let initial = (fullName || 'م')[0].toUpperCase();
                let username = user ? (user.username || '') : '';
                let isCreator = member.user_id === group.creator_id;
                let joinDate = formatDate(member.created_at);

                return '<div class="member-card flex items-center gap-3 p-3 rounded-xl">'
                    + '<div class="w-10 h-10 rounded-full bg-gradient-to-br ' + (isCreator ? 'from-amber-400 to-amber-600' : 'from-primary-400 to-primary-600') + ' flex items-center justify-center text-white font-bold text-sm shrink-0">'
                    + initial
                    + '</div>'
                    + '<div class="flex-1 min-w-0">'
                    + '<p class="text-white text-sm font-medium truncate">' + escapeHtml(fullName) + '</p>'
                    + '<p class="text-secondary-500 text-xs truncate">' + (username ? '@' + escapeHtml(username) : '') + '</p>'
                    + '</div>'
                    + (isCreator ? '<span class="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium shrink-0">منشئ</span>' : '')
                    + '<span class="text-secondary-600 text-xs shrink-0">' + joinDate + '</span>'
                    + '</div>';
            }).join('');
        } catch (error) {
            document.getElementById('membersList').innerHTML = '<div class="text-center py-8 text-red-400">فشل تحميل الأعضاء</div>';
        }
    };

    window.closeMembersModal = function() {
        document.getElementById('membersModal').classList.add('hidden');
        document.getElementById('membersModal').classList.remove('flex');
    };

    // ═══════════════════════════════════════════
    // Initialize
    // ═══════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', async function() {
        window.initializeTheme?.();
        window.i18n?.initLang?.();

        initSupabase();
        await checkAuth();
        renderProfileInfo();

        // إخفاء حالة التحميل وإظهار المحتوى
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('profileContent').classList.remove('hidden');

        // تحميل البيانات
        await loadJoinedGroups();
        await loadCreatedGroups();

        // Modal close on outside click
        document.getElementById('editProfileModal').addEventListener('click', function(e) {
            if (e.target.id === 'editProfileModal') closeEditProfileModal();
        });
        document.getElementById('editGroupModal').addEventListener('click', function(e) {
            if (e.target.id === 'editGroupModal') closeEditGroupModal();
        });
        document.getElementById('membersModal').addEventListener('click', function(e) {
            if (e.target.id === 'membersModal') closeMembersModal();
        });

        // Modal close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (!document.getElementById('editProfileModal').classList.contains('hidden')) {
                    closeEditProfileModal();
                } else if (!document.getElementById('editGroupModal').classList.contains('hidden')) {
                    closeEditGroupModal();
                } else if (!document.getElementById('membersModal').classList.contains('hidden')) {
                    closeMembersModal();
                }
            }
        });
    });
})();
