/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Admin Panel
 * ════════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    let db = null;
    let allUsers = [];
    let allGroups = [];
    let currentTab = 'users';

    // ═══════════════════════════════════════════
    // Auth & Admin Check
    // ═══════════════════════════════════════════
    async function checkAdminAccess() {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }

        db = initSupabase();
        if (!db) {
            showAccessDenied();
            return false;
        }

        let isValid = await verifySessionWithServer(db);
        if (!isValid) {
            window.location.href = 'login.html';
            return false;
        }

        let user = getCurrentUser();
        if (!user || !user.id) {
            showAccessDenied();
            return false;
        }

        // Verify admin status from DB
        try {
            let result = await db
                .from('users')
                .select('is_admin, is_active')
                .eq('id', user.id)
                .single();

            if (!result.data || !result.data.is_admin || !result.data.is_active) {
                showAccessDenied();
                return false;
            }
            return true;
        } catch (e) {
            showAccessDenied();
            return false;
        }
    }

    function showAccessDenied() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('accessDenied').classList.remove('hidden');
    }

    // ═══════════════════════════════════════════
    // Load Stats
    // ═══════════════════════════════════════════
    async function loadStats() {
        try {
            let result = await db.rpc('get_admin_stats');
            if (result.data && result.data.length > 0) {
                let stats = result.data[0];
                document.getElementById('statUsers').textContent = stats.total_users || 0;
                document.getElementById('statActive').textContent = stats.active_users || 0;
                document.getElementById('statGroups').textContent = stats.total_groups || 0;
                document.getElementById('statMembers').textContent = stats.total_memberships || 0;
            }
        } catch (e) {
            // Fallback: manual count
            try {
                let usersCount = await db.from('users').select('*', { count: 'exact', head: true });
                let groupsCount = await db.from('groups').select('*', { count: 'exact', head: true });
                let membersCount = await db.from('group_members').select('*', { count: 'exact', head: true });
                document.getElementById('statUsers').textContent = usersCount.count || 0;
                document.getElementById('statActive').textContent = '-';
                document.getElementById('statGroups').textContent = groupsCount.count || 0;
                document.getElementById('statMembers').textContent = membersCount.count || 0;
            } catch (e2) { /* ignore */ }
        }
    }

    // ═══════════════════════════════════════════
    // Load Users
    // ═══════════════════════════════════════════
    async function loadUsers() {
        try {
            let result = await db
                .from('users')
                .select('id, username, first_name, middle_name, last_name, email, major, is_admin, is_active, created_at')
                .order('created_at', { ascending: false });

            if (result.error) throw result.error;
            allUsers = result.data || [];
            renderUsers(allUsers);
        } catch (e) {
            showToast('فشل تحميل المستخدمين: ' + (e.message || ''), 'error');
        }
    }

    function renderUsers(users) {
        let tbody = document.getElementById('usersTableBody');
        let empty = document.getElementById('usersEmpty');

        if (users.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = users.map(function(u) {
            let fullName = ((u.first_name || '') + ' ' + (u.middle_name || '') + ' ' + (u.last_name || '')).trim() || '-';
            let statusBadge = u.is_active
                ? '<span class="badge badge-active">نشط</span>'
                : '<span class="badge badge-inactive">معطل</span>';
            let adminBadge = u.is_admin
                ? '<span class="badge badge-admin">مشرف</span>'
                : '<span class="badge" style="background:rgba(100,116,139,0.15);color:#94a3b8">مستخدم</span>';
            let date = u.created_at ? new Date(u.created_at).toLocaleDateString('ar') : '-';

            return '<tr>'
                + '<td class="text-white font-medium">' + escapeHtml(fullName) + '</td>'
                + '<td class="text-secondary-300 text-sm">' + escapeHtml(u.email || '-') + '</td>'
                + '<td class="text-secondary-400 text-sm">@' + escapeHtml(u.username || '-') + '</td>'
                + '<td class="text-secondary-400 text-sm">' + escapeHtml(u.major || '-') + '</td>'
                + '<td>' + statusBadge + '</td>'
                + '<td>' + adminBadge + '</td>'
                + '<td class="text-secondary-500 text-sm">' + date + '</td>'
                + '<td class="flex gap-1 flex-wrap">'
                + (u.is_admin
                    ? '<button class="action-btn btn-warning" onclick="revokeAdmin(\'' + u.id + '\')">إلغاء إشراف</button>'
                    : '<button class="action-btn btn-success" onclick="makeAdmin(\'' + u.id + '\')">تعيين مشرف</button>')
                + (u.is_active
                    ? '<button class="action-btn btn-danger" onclick="toggleActive(\'' + u.id + '\', false)">تعطيل</button>'
                    : '<button class="action-btn btn-success" onclick="toggleActive(\'' + u.id + '\', true)">تفعيل</button>')
                + '</td></tr>';
        }).join('');
    }

    // ═══════════════════════════════════════════
    // Load Groups
    // ═══════════════════════════════════════════
    async function loadGroups() {
        try {
            let result = await db
                .from('groups')
                .select('*')
                .order('created_at', { ascending: false });

            if (result.error) throw result.error;
            allGroups = result.data || [];

            // استخدام الدالة المشتركة لإثراء بيانات المنشئين
            await window.enrichCreators(allGroups, db);

            renderGroups(allGroups);
        } catch (e) {
            showToast('فشل تحميل المجموعات: ' + (e.message || ''), 'error');
        }
    }

    function renderGroups(groups) {
        let tbody = document.getElementById('groupsTableBody');
        let empty = document.getElementById('groupsEmpty');

        if (groups.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = groups.map(function(g) {
            let isFull = g.current_members >= g.max_members;
            let statusBadge = isFull
                ? '<span class="badge badge-full">ممتلئة</span>'
                : '<span class="badge badge-available">متاحة</span>';
            let date = g.created_at ? new Date(g.created_at).toLocaleDateString('ar') : '-';

            return '<tr>'
                + '<td class="text-white font-medium">' + escapeHtml(g.name || '-') + '</td>'
                + '<td class="text-secondary-300 text-sm">' + escapeHtml(g.course_name || '-') + '</td>'
                + '<td class="text-secondary-400 text-sm">' + escapeHtml(g.course_code || '-') + '</td>'
                + '<td class="text-secondary-400 text-sm">' + escapeHtml(g.major || '-') + '</td>'
                + '<td class="text-white text-sm">' + (g.current_members || 0) + '/' + (g.max_members || 0) + '</td>'
                + '<td>' + statusBadge + '</td>'
                + '<td class="text-secondary-400 text-sm">' + escapeHtml(g._creatorName || '-') + '</td>'
                + '<td class="text-secondary-500 text-sm">' + date + '</td>'
                + '<td><button class="action-btn btn-danger" onclick="deleteGroup(\'' + g.id + '\')">حذف</button></td>'
                + '</tr>';
        }).join('');
    }

    // ═══════════════════════════════════════════
    // Admin Actions
    // ═══════════════════════════════════════════
    window.makeAdmin = async function(userId) {
        if (!confirm('هل تريد تعيين هذا المستخدم كمشرف؟')) return;
        try {
            let result = await db.from('users').update({ is_admin: true }).eq('id', userId);
            if (result.error) throw result.error;
            showToast('تم تعيين المشرف بنجاح', 'success');
            await loadUsers();
        } catch (e) {
            showToast('فشل: ' + (e.message || ''), 'error');
        }
    };

    window.revokeAdmin = async function(userId) {
        let currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            showToast('لا يمكنك إلغاء صلاحياتك الخاصة', 'error');
            return;
        }
        if (!confirm('هل تريد إلغاء صلاحيات المشرف؟')) return;
        try {
            let result = await db.from('users').update({ is_admin: false }).eq('id', userId);
            if (result.error) throw result.error;
            showToast('تم إلغاء صلاحيات المشرف', 'success');
            await loadUsers();
        } catch (e) {
            showToast('فشل: ' + (e.message || ''), 'error');
        }
    };

    window.toggleActive = async function(userId, active) {
        let currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId && !active) {
            showToast('لا يمكنك تعطيل حسابك الخاص', 'error');
            return;
        }
        let msg = active ? 'هل تريد تفعيل هذا الحساب؟' : 'هل تريد تعطيل هذا الحساب؟ لن يتمكن المستخدم من تسجيل الدخول.';
        if (!confirm(msg)) return;
        try {
            let result = await db.from('users').update({ is_active: active }).eq('id', userId);
            if (result.error) throw result.error;
            showToast(active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب', 'success');
            await loadUsers();
            await loadStats();
        } catch (e) {
            showToast('فشل: ' + (e.message || ''), 'error');
        }
    };

    window.deleteGroup = async function(groupId) {
        if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الأعضاء أيضاً.')) return;
        try {
            await db.from('group_members').delete().eq('group_id', groupId);
            let result = await db.from('groups').delete().eq('id', groupId);
            if (result.error) throw result.error;
            showToast('تم حذف المجموعة بنجاح', 'success');
            await loadGroups();
            await loadStats();
        } catch (e) {
            showToast('فشل: ' + (e.message || ''), 'error');
        }
    };

    window.handleLogout = function(event) {
        if (event) event.preventDefault();
        logout();
    };

    // ═══════════════════════════════════════════
    // Search & Filter
    // ═══════════════════════════════════════════
    function filterUsers() {
        let search = (document.getElementById('searchUsers').value || '').toLowerCase();
        let adminFilter = document.getElementById('filterAdmin').value;
        let activeFilter = document.getElementById('filterActive').value;

        let filtered = allUsers.filter(function(u) {
            let fullName = ((u.first_name || '') + ' ' + (u.last_name || '')).toLowerCase();
            if (search && !fullName.includes(search) && !(u.email || '').toLowerCase().includes(search) && !(u.username || '').toLowerCase().includes(search)) return false;
            if (adminFilter === 'admin' && !u.is_admin) return false;
            if (adminFilter === 'user' && u.is_admin) return false;
            if (activeFilter === 'active' && !u.is_active) return false;
            if (activeFilter === 'inactive' && u.is_active) return false;
            return true;
        });
        renderUsers(filtered);
    }

    function filterGroups() {
        let search = (document.getElementById('searchGroups').value || '').toLowerCase();
        let fullFilter = document.getElementById('filterFull').value;

        let filtered = allGroups.filter(function(g) {
            if (search && !(g.name || '').toLowerCase().includes(search) && !(g.course_name || '').toLowerCase().includes(search) && !(g.course_code || '').toLowerCase().includes(search)) return false;
            let isFull = (g.current_members || 0) >= (g.max_members || 0);
            if (fullFilter === 'available' && isFull) return false;
            if (fullFilter === 'full' && !isFull) return false;
            return true;
        });
        renderGroups(filtered);
    }

    // ═══════════════════════════════════════════
    // Tabs
    // ═══════════════════════════════════════════
    function setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                let tab = btn.dataset.tab;
                currentTab = tab;

                document.querySelectorAll('.tab-btn').forEach(function(b) {
                    b.classList.remove('active');
                    b.classList.add('text-secondary-400');
                });
                btn.classList.add('active');
                btn.classList.remove('text-secondary-400');

                document.getElementById('tab-users').classList.toggle('hidden', tab !== 'users');
                document.getElementById('tab-groups').classList.toggle('hidden', tab !== 'groups');
                document.getElementById('tab-email').classList.toggle('hidden', tab !== 'email');

                if (tab === 'groups' && allGroups.length === 0) loadGroups();
            });
        });
    }

    // ═══════════════════════════════════════════
    // Email Functions
    // ═══════════════════════════════════════════

    // Toggle custom emails field
    let emailRecipientsEl = document.getElementById('emailRecipients');
    if (emailRecipientsEl) {
        emailRecipientsEl.addEventListener('change', function() {
            let wrapper = document.getElementById('customEmailsWrapper');
            if (wrapper) {
                wrapper.classList.toggle('hidden', this.value !== 'custom');
            }
        });
    }

    window.previewEmail = function() {
        let html = document.getElementById('emailBody').value;
        let preview = document.getElementById('emailPreview');
        if (!html.trim()) {
            preview.classList.add('hidden');
            return;
        }
        preview.innerHTML = html;
        preview.classList.remove('hidden');
    };

    window.sendAdminEmail = async function() {
        let subject = document.getElementById('emailSubject').value.trim();
        let body = document.getElementById('emailBody').value.trim();
        let recipientsType = document.getElementById('emailRecipients').value;
        let customEmails = document.getElementById('customEmails').value.trim();
        let statusEl = document.getElementById('emailStatus');
        let sendBtn = document.getElementById('sendEmailBtn');

        if (!subject) {
            showToast('أدخل عنوان الإيميل', 'error');
            return;
        }
        if (!body) {
            showToast('أدخل محتوى الإيميل', 'error');
            return;
        }

        if (recipientsType === 'custom' && !customEmails) {
            showToast('أدخل عناوين الإيميل المخصصة', 'error');
            return;
        }

        if (!confirm('هل أنت متأكد من إرسال هذا الإيميل؟')) return;

        sendBtn.disabled = true;
        sendBtn.textContent = 'جاري الإرسال...';
        statusEl.textContent = '';

        try {
            let result;

            if (recipientsType === 'all') {
                result = await window.emailService.sendToAll(subject, body);
            } else {
                let emails = customEmails.split(',').map(function(e) { return e.trim(); }).filter(function(e) { return e; });
                result = await window.emailService.sendBulk(emails, subject, body);
            }

            if (result.sent > 0) {
                showToast('تم إرسال الإيميل بنجاح', 'success');
                statusEl.textContent = 'تم الإرسال: ' + result.sent + ' | فشل: ' + result.failed;
                if (result.total) statusEl.textContent += ' (إجمالي: ' + result.total + ')';
            } else {
                var friendlyErrors = result.errors.map(function(err) {
                    return window.emailService.getErrorMessage ? window.emailService.getErrorMessage(err) : err;
                });
                showToast(friendlyErrors[0] || 'فشل إرسال الإيميل', 'error');
                statusEl.textContent = 'فشل: ' + friendlyErrors.join(', ');
            }
        } catch (e) {
            showToast('خطأ: ' + (e.message || ''), 'error');
            statusEl.textContent = 'خطأ: ' + (e.message || '');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'إرسال الإيميل';
        }
    };

    // ═══════════════════════════════════════════
    // Init
    // ═══════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', async function() {
        window.initializeTheme?.();
        window.i18n?.initLang?.();

        let isAdmin = await checkAdminAccess();
        if (!isAdmin) return;

        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('adminContent').classList.remove('hidden');

        await loadStats();
        await loadUsers();
        setupTabs();

        // Search listeners
        document.getElementById('searchUsers').addEventListener('input', window.debounce(filterUsers, 300));
        document.getElementById('filterAdmin').addEventListener('change', filterUsers);
        document.getElementById('filterActive').addEventListener('change', filterUsers);
        document.getElementById('searchGroups').addEventListener('input', window.debounce(filterGroups, 300));
        document.getElementById('filterFull').addEventListener('change', filterGroups);
    });
})();
