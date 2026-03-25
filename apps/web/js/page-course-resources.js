/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Course Resources (Link Sharing)
 * مشاركة الروابط لل المواد الدراسية
 * ════════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    let _resourcesCache = {};
    let _currentCourseCode = null;

    // ── Resource Type Labels ──
    let RESOURCE_TYPE_LABELS = {
        link: { ar: 'رابط', en: 'Link' },
        video: { ar: 'فيديو', en: 'Video' },
        article: { ar: 'مقال', en: 'Article' },
        tool: { ar: 'أداة', en: 'Tool' },
        github: { ar: 'GitHub', en: 'GitHub' },
        other: { ar: 'أخرى', en: 'Other' }
    };

    let RESOURCE_TYPE_COLORS = {
        link: 'bg-blue-500/20 text-blue-400',
        video: 'bg-red-500/20 text-red-400',
        article: 'bg-green-500/20 text-green-400',
        tool: 'bg-purple-500/20 text-purple-400',
        github: 'bg-gray-500/20 text-gray-300',
        other: 'bg-yellow-500/20 text-yellow-400'
    };

    function getLang() {
        return window.i18n?.getLang?.() || 'ar';
    }

    function getTypeLabel(type) {
        let lang = getLang();
        return (RESOURCE_TYPE_LABELS[type] || RESOURCE_TYPE_LABELS.other)[lang] || type;
    }

    function getTypeColor(type) {
        return RESOURCE_TYPE_COLORS[type] || RESOURCE_TYPE_COLORS.other;
    }

    // ── Load Resources ──
    window.loadCourseResources = async function(courseCode, force) {
        if (!force && _resourcesCache[courseCode]) {
            return _resourcesCache[courseCode];
        }

        let db = window.getDb?.();
        if (!db) return [];

        try {
            let { data, error } = await db
                .from('course_resources')
                .select('*')
                .eq('course_code', courseCode)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                window.log.warn('[Resources] Load error:', error.message);
                return [];
            }

            _resourcesCache[courseCode] = data || [];
            return data || [];
        } catch (e) {
            window.log.warn('[Resources] Load exception:', e.message);
            return [];
        }
    };

    // ── Add Resource ──
    window.addCourseResource = async function(courseCode, courseName, major, title, url, description, resourceType) {
        let db = window.getDb?.();
        if (!db) return { error: 'Database not available' };

        let user = window.getCurrentUser?.();
        if (!user) return { error: 'Not logged in' };

        // Validate URL
        try {
            new URL(url);
        } catch {
            return { error: getLang() === 'ar' ? 'الرابط غير صالح' : 'Invalid URL' };
        }

        if (!title.trim()) {
            return { error: getLang() === 'ar' ? 'العنوان مطلوب' : 'Title is required' };
        }

        try {
            let { data, error } = await db
                .from('course_resources')
                .insert({
                    course_code: courseCode,
                    course_name: courseName,
                    major: major,
                    title: title.trim(),
                    url: url.trim(),
                    description: description?.trim() || null,
                    resource_type: resourceType || 'link',
                    uploader_id: user.id,
                    uploader_name: (user.first_name || '') + ' ' + (user.last_name || '')
                })
                .select()
                .single();

            if (error) return { error: error.message };

            // Update cache
            if (_resourcesCache[courseCode]) {
                _resourcesCache[courseCode].unshift(data);
            }

            return { data: data };
        } catch (e) {
            return { error: e.message };
        }
    };

    // ── Delete Resource ──
    window.deleteCourseResource = async function(resourceId, courseCode) {
        let db = window.getDb?.();
        if (!db) return { error: 'Database not available' };

        try {
            let { error } = await db
                .from('course_resources')
                .delete()
                .eq('id', resourceId);

            if (error) return { error: error.message };

            // Update cache
            if (_resourcesCache[courseCode]) {
                _resourcesCache[courseCode] = _resourcesCache[courseCode].filter(function(r) {
                    return r.id !== resourceId;
                });
            }

            return { success: true };
        } catch (e) {
            return { error: e.message };
        }
    };

    // ── Vote Resource ──
    window.voteCourseResource = async function(resourceId, courseCode, direction) {
        let db = window.getDb?.();
        if (!db) return { error: 'Database not available' };

        try {
            let resource = null;
            if (_resourcesCache[courseCode]) {
                resource = _resourcesCache[courseCode].find(function(r) { return r.id === resourceId; });
            }
            let newVotes = (resource?.votes || 0) + direction;

            let { error } = await db
                .from('course_resources')
                .update({ votes: newVotes })
                .eq('id', resourceId);

            if (error) return { error: error.message };

            // Update cache
            if (resource) resource.votes = newVotes;

            return { success: true, votes: newVotes };
        } catch (e) {
            return { error: e.message };
        }
    };

    // ── Render Resources List ──
    window.renderCourseResources = function(resources, containerId, currentUserId) {
        let container = document.getElementById(containerId);
        if (!container) return;

        if (!resources || resources.length === 0) {
            container.innerHTML = '<div class="text-center py-8">'
                + '<div class="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary-800/50 flex items-center justify-center">'
                + '<svg class="w-8 h-8 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">'
                + '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>'
                + '</svg>'
                + '</div>'
                + '<p class="text-secondary-400 text-sm">'
                + (getLang() === 'ar' ? 'لا توجد روابط مشاركة بعد — كن أول من يشارك!' : 'No shared links yet — be the first to share!')
                + '</p>'
                + '</div>';
            return;
        }

        container.innerHTML = resources.map(function(resource) {
            let color = getTypeColor(resource.resource_type);
            let typeLabel = getTypeLabel(resource.resource_type);
            let date = window.formatDate ? window.formatDate(resource.created_at) : resource.created_at;
            let isOwner = currentUserId && resource.uploader_id === currentUserId;
            let domain = '';
            try { domain = new URL(resource.url).hostname; } catch {}

            return '<div class="resource-item glass rounded-xl p-4 animate-in border border-white/5 hover:border-primary-500/30 transition-all duration-300">'
                + '<div class="flex items-start gap-3">'
                // Vote section
                + '<div class="flex flex-col items-center gap-1 min-w-[40px]">'
                + '<button onclick="handleVoteUp(\'' + resource.id + '\')" class="vote-btn p-1 rounded-lg hover:bg-primary-500/20 text-secondary-400 hover:text-primary-400 transition">'
                + '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>'
                + '</button>'
                + '<span class="text-sm font-bold text-primary-400" id="votes-' + resource.id + '">' + (resource.votes || 0) + '</span>'
                + '<button onclick="handleVoteDown(\'' + resource.id + '\')" class="vote-btn p-1 rounded-lg hover:bg-red-500/20 text-secondary-400 hover:text-red-400 transition">'
                + '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>'
                + '</button>'
                + '</div>'
                // Content
                + '<div class="flex-1 min-w-0">'
                + '<div class="flex items-start justify-between gap-2 mb-2">'
                + '<a href="' + window.escapeHtml(resource.url) + '" target="_blank" rel="noopener noreferrer" '
                + 'class="text-white font-semibold hover:text-primary-400 transition-colors line-clamp-2 break-all">'
                + window.escapeHtml(resource.title)
                + '</a>'
                + '</div>'
                + '<div class="flex flex-wrap items-center gap-2 mb-2">'
                + '<span class="cat-badge ' + color + '">' + typeLabel + '</span>'
                + '<a href="' + window.escapeHtml(resource.url) + '" target="_blank" rel="noopener noreferrer" '
                + 'class="text-xs text-secondary-500 hover:text-primary-400 transition truncate max-w-[200px]">'
                + window.escapeHtml(domain)
                + '</a>'
                + '</div>'
                + (resource.description ? '<p class="text-secondary-400 text-xs mb-2 line-clamp-2">' + window.escapeHtml(resource.description) + '</p>' : '')
                + '<div class="flex items-center gap-3 text-xs text-secondary-500">'
                + '<span>' + window.escapeHtml(resource.uploader_name) + '</span>'
                + '<span>•</span>'
                + '<span>' + date + '</span>'
                + '</div>'
                + '</div>'
                // Actions
                + (isOwner ? '<button onclick="handleDeleteResource(\'' + resource.id + '\')" '
                + 'class="p-2 rounded-lg hover:bg-red-500/20 text-secondary-500 hover:text-red-400 transition" title="حذف">'
                + '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">'
                + '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>'
                + '</svg>'
                + '</button>' : '')
                + '</div>'
                + '</div>';
        }).join('');
    };

    // ── Render Add Form ──
    window.renderAddResourceForm = function(containerId, courseCode, courseName, major) {
        let container = document.getElementById(containerId);
        if (!container) return;

        let lang = getLang();
        let isAr = lang === 'ar';

        container.innerHTML = '<div class="glass rounded-xl p-4 border border-primary-500/20">'
            + '<h4 class="text-white font-semibold mb-3 flex items-center gap-2">'
            + '<svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">'
            + '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>'
            + '</svg>'
            + (isAr ? 'مشاركة رابط جديد' : 'Share a new link')
            + '</h4>'
            // Title
            + '<div class="mb-3">'
            + '<label class="block text-secondary-400 text-xs mb-1">' + (isAr ? 'العنوان *' : 'Title *') + '</label>'
            + '<input type="text" id="resourceTitle" maxlength="200"'
            + ' class="input-field w-full px-3 py-2 rounded-lg text-white text-sm"'
            + ' placeholder="' + (isAr ? 'مثال: ملخص المحاضرة الثالثة' : 'e.g. Lecture 3 Summary') + '">'
            + '</div>'
            // URL
            + '<div class="mb-3">'
            + '<label class="block text-secondary-400 text-xs mb-1">' + (isAr ? 'الرابط *' : 'URL *') + '</label>'
            + '<input type="url" id="resourceUrl" maxlength="2000"'
            + ' class="input-field w-full px-3 py-2 rounded-lg text-white text-sm"'
            + ' placeholder="https://example.com">'
            + '</div>'
            // Type
            + '<div class="mb-3">'
            + '<label class="block text-secondary-400 text-xs mb-1">' + (isAr ? 'النوع' : 'Type') + '</label>'
            + '<select id="resourceType" class="input-field resource-type-select w-full px-3 py-2 rounded-lg text-white text-sm">'
            + Object.keys(RESOURCE_TYPE_LABELS).map(function(key) {
                return '<option value="' + key + '">' + getTypeLabel(key) + '</option>';
            }).join('')
            + '</select>'
            + '</div>'
            // Description
            + '<div class="mb-3">'
            + '<label class="block text-secondary-400 text-xs mb-1">' + (isAr ? 'وصف (اختياري)' : 'Description (optional)') + '</label>'
            + '<textarea id="resourceDesc" maxlength="500" rows="2"'
            + ' class="input-field w-full px-3 py-2 rounded-lg text-white text-sm resize-none"'
            + ' placeholder="' + (isAr ? 'وصف مختصر للمحتوى...' : 'Brief description...') + '"></textarea>'
            + '</div>'
            // Submit
            + '<button onclick="handleSubmitResource(\'' + courseCode + '\', \'' + window.escapeHtml(courseName) + '\', \'' + major + '\')"'
            + ' id="submitResourceBtn"'
            + ' class="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2">'
            + '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">'
            + '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>'
            + '</svg>'
            + (isAr ? 'مشاركة الرابط' : 'Share Link')
            + '</button>'
            + '</div>';
    };

    // ── Event Handlers ──
    window.handleSubmitResource = async function(courseCode, courseName, major) {
        let title = document.getElementById('resourceTitle')?.value?.trim();
        let url = document.getElementById('resourceUrl')?.value?.trim();
        let desc = document.getElementById('resourceDesc')?.value?.trim();
        let type = document.getElementById('resourceType')?.value || 'link';

        if (!title || !url) {
            window.showToast?.(
                getLang() === 'ar' ? 'يرجى ملء العنوان والرابط' : 'Please fill title and URL',
                'error'
            );
            return;
        }

        let btn = document.getElementById('submitResourceBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>'
                + (getLang() === 'ar' ? 'جارٍ المشاركة...' : 'Sharing...');
        }

        let result = await window.addCourseResource(courseCode, courseName, major, title, url, desc, type);

        if (result.error) {
            window.showToast?.(result.error, 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = getLang() === 'ar' ? 'مشاركة الرابط' : 'Share Link';
            }
            return;
        }

        // Clear form
        let titleEl = document.getElementById('resourceTitle');
        let urlEl = document.getElementById('resourceUrl');
        let descEl = document.getElementById('resourceDesc');
        if (titleEl) titleEl.value = '';
        if (urlEl) urlEl.value = '';
        if (descEl) descEl.value = '';

        window.showToast?.(
            getLang() === 'ar' ? 'تمت المشاركة بنجاح!' : 'Shared successfully!',
            'success'
        );

        // Re-render
        let resources = await window.loadCourseResources(courseCode, true);
        let user = window.getCurrentUser?.();
        window.renderCourseResources(resources, 'resourcesList', user?.id);

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">'
                + '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>'
                + '</svg>'
                + (getLang() === 'ar' ? 'مشاركة الرابط' : 'Share Link');
        }
    };

    window.handleDeleteResource = async function(resourceId) {
        if (!confirm(getLang() === 'ar' ? 'هل تريد حذف هذا الرابط؟' : 'Delete this link?')) return;

        let result = await window.deleteCourseResource(resourceId, _currentCourseCode);
        if (result.error) {
            window.showToast?.(result.error, 'error');
            return;
        }

        window.showToast?.(
            getLang() === 'ar' ? 'تم الحذف' : 'Deleted',
            'success'
        );

        let resources = await window.loadCourseResources(_currentCourseCode, true);
        let user = window.getCurrentUser?.();
        window.renderCourseResources(resources, 'resourcesList', user?.id);
    };

    window.handleVoteUp = async function(resourceId) {
        let result = await window.voteCourseResource(resourceId, _currentCourseCode, 1);
        if (!result.error) {
            let el = document.getElementById('votes-' + resourceId);
            if (el) el.textContent = result.votes;
        }
    };

    window.handleVoteDown = async function(resourceId) {
        let result = await window.voteCourseResource(resourceId, _currentCourseCode, -1);
        if (!result.error) {
            let el = document.getElementById('votes-' + resourceId);
            if (el) el.textContent = result.votes;
        }
    };

    // ── Init Resources Tab ──
    window.initCourseResourcesTab = async function(courseCode, courseName, major) {
        _currentCourseCode = courseCode;
        let user = window.getCurrentUser?.();

        // Render form
        window.renderAddResourceForm('addResourceForm', courseCode, courseName, major);

        // Load and render resources
        let resources = await window.loadCourseResources(courseCode);
        window.renderCourseResources(resources, 'resourcesList', user?.id);

        // Update count
        let countEl = document.getElementById('resourcesCount');
        if (countEl) countEl.textContent = resources.length;
    };

})();
