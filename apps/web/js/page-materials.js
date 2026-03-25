/**
 * Materials Page Logic
 */
(function() {
    'use strict';

    // ── Global Tab Switching ──
    function switchModalTab(tab) {
        let infoBtn = document.getElementById('modalTabInfo');
        let resBtn = document.getElementById('modalTabResources');
        let infoContent = document.getElementById('modalTabInfoContent');
        let resContent = document.getElementById('modalTabResourcesContent');

        if (!infoBtn || !resBtn || !infoContent || !resContent) return;

        if (tab === 'info') {
            infoBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-primary-600 text-white';
            resBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-secondary-800 text-secondary-400 hover:bg-secondary-700';
            infoContent.classList.remove('hidden');
            resContent.classList.add('hidden');
        } else {
            infoBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-secondary-800 text-secondary-400 hover:bg-secondary-700';
            resBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-primary-600 text-white';
            infoContent.classList.add('hidden');
            resContent.classList.remove('hidden');
        }
    }
    window.switchModalTab = switchModalTab;

    function setupModalTabButtons() {
        let container = document.getElementById('modalTabButtons');
        if (!container) return;
        container.addEventListener('click', function(e) {
            let btn = e.target.closest('button[data-tab]');
            if (!btn) return;
            switchModalTab(btn.dataset.tab);
        });
    }

    let currentYear = 'all';
    let currentCategory = 'all';
    let searchQuery = '';
    let currentMajor = 'ITE (Information Technology Engineering)';
    let _loadedCourses = null;
    let _isITE = true;

    // ── Major code → full JSON key mapping ──
    function resolveMajorKey(shortCode, jsonKeys) {
        if (!shortCode) return null;
        let upper = shortCode.toUpperCase();
        for (let i = 0; i < jsonKeys.length; i++) {
            if (jsonKeys[i].toUpperCase() === upper) return jsonKeys[i];
        }
        for (let j = 0; j < jsonKeys.length; j++) {
            if (jsonKeys[j].toUpperCase().indexOf(upper) === 0) return jsonKeys[j];
        }
        return null;
    }

    function detectUserMajor() {
        let user = window.getCurrentUser?.();
        if (user && user.major) {
            let majors = window.MAJORS || [];
            if (majors.indexOf(user.major) !== -1) return user.major;
        }
        return null;
    }

    async function initMajor() {
        let userCode = detectUserMajor();
        if (!userCode) { currentMajor = 'ITE (Information Technology Engineering)'; _isITE = true; return; }
        if (userCode.toUpperCase() === 'ITE') { currentMajor = 'ITE (Information Technology Engineering)'; _isITE = true; return; }
        let jsonKeys = await window.getMajorsList();
        let resolved = resolveMajorKey(userCode, jsonKeys);
        if (resolved) { currentMajor = resolved; _isITE = false; }
        else { currentMajor = 'ITE (Information Technology Engineering)'; _isITE = true; }
    }

    async function getCoursesForCurrentMajor() {
        if (_isITE) return window.ITE_COURSES;
        let courses = await window.getCoursesByMajor(currentMajor);
        return courses.map(function(c, i) {
            return { id: i + 1, name: c.name, code: c.code, year: 0, category: 'general', prerequisites: [] };
        });
    }

    // ── Prerequisite Helpers ──
    function resolvePrereqName(code) {
        let courses = window.ITE_COURSES || [];
        for (let i = 0; i < courses.length; i++) {
            if (courses[i].code === code) return courses[i].name;
        }
        return code;
    }

    function findDependentCourses(code) {
        let courses = window.ITE_COURSES || [];
        let result = [];
        for (let i = 0; i < courses.length; i++) {
            if (courses[i].prerequisites && courses[i].prerequisites.indexOf(code) !== -1) {
                result.push(courses[i]);
            }
        }
        return result;
    }

    // ── SVG Prereq Chart ──
    function buildPrereqChart(course) {
        let container = document.getElementById('prereqChart');
        if (!container) return;
        container.innerHTML = '';

        let prereqs = course.prerequisites || [];
        let dependents = findDependentCourses(course.code);

        if (prereqs.length === 0 && dependents.length === 0) {
            container.innerHTML = '<div class="flex items-center gap-2 text-green-400 text-sm py-3">'
                + '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
                + 'مادة مفتوحة — لا توجد متطلبات سابقة'
                + '</div>';
            return;
        }

        let BOX_W = 130, BOX_H = 44, GAP_Y = 12;
        let maxSide = Math.max(prereqs.length, dependents.length, 1);
        let SVG_H = Math.max(maxSide * (BOX_H + GAP_Y) + 40, 120);
        let SVG_W = BOX_W * 3 + 60 * 2 + 20;

        function colY(count, i) {
            let total = count * BOX_H + (count - 1) * GAP_Y;
            let startY = (SVG_H - total) / 2;
            return startY + i * (BOX_H + GAP_Y);
        }

        // RTL: prereqs on right, current center, dependents on left
        let xPrereq = SVG_W - BOX_W - 10;
        let xCenter = (SVG_W - BOX_W) / 2;
        let xDep = 10;
        let centerY = (SVG_H - BOX_H) / 2;

        let svg = '<svg width="' + SVG_W + '" height="' + SVG_H + '" xmlns="http://www.w3.org/2000/svg" style="font-family:Cairo,sans-serif">';

        // Arrow markers
        svg += '<defs>'
            + '<marker id="arrowY" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">'
            + '<path d="M0,0 L0,6 L8,3 z" fill="rgba(234,179,8,0.8)"/></marker>'
            + '<marker id="arrowB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">'
            + '<path d="M0,0 L0,6 L8,3 z" fill="rgba(56,189,248,0.7)"/></marker>'
            + '</defs>';

        // Column labels
        if (prereqs.length > 0) {
            svg += '<text x="' + (xPrereq + BOX_W / 2) + '" y="13" text-anchor="middle" fill="rgba(148,163,184,0.5)" font-size="10">متطلبات سابقة</text>';
        }
        svg += '<text x="' + (xCenter + BOX_W / 2) + '" y="13" text-anchor="middle" fill="rgba(56,189,248,0.5)" font-size="10">المادة</text>';
        if (dependents.length > 0) {
            svg += '<text x="' + (xDep + BOX_W / 2) + '" y="13" text-anchor="middle" fill="rgba(148,163,184,0.5)" font-size="10">تفتح هذه المواد</text>';
        }

        // Prereq boxes + arrows → center
        prereqs.forEach(function(code, i) {
            let pc = (window.ITE_COURSES || []).find(function(c) { return c.code === code; });
            let label = pc ? pc.name : code;
            let shortLabel = label.length > 15 ? label.substring(0, 14) + '…' : label;
            let y = colY(prereqs.length, i);
            let py = y + BOX_H / 2;
            let cy = centerY + BOX_H / 2;

            // Curved path
            let x1 = xPrereq;
            let x2 = xCenter + BOX_W;
            let mx = (x1 + x2) / 2;
            svg += '<path d="M' + x1 + ',' + py + ' C' + mx + ',' + py + ' ' + mx + ',' + cy + ' ' + x2 + ',' + cy + '" '
                + 'fill="none" stroke="rgba(234,179,8,0.4)" stroke-width="1.5" marker-end="url(#arrowY)"/>';

            // Box
            svg += '<rect x="' + xPrereq + '" y="' + y + '" width="' + BOX_W + '" height="' + BOX_H + '" '
                + 'rx="8" fill="rgba(234,179,8,0.1)" stroke="rgba(234,179,8,0.4)" stroke-width="1"/>';
            svg += '<text x="' + (xPrereq + BOX_W / 2) + '" y="' + (y + BOX_H / 2 - 7) + '" '
                + 'text-anchor="middle" fill="rgba(253,224,71,0.9)" font-size="10" font-weight="bold">' + code + '</text>';
            svg += '<text x="' + (xPrereq + BOX_W / 2) + '" y="' + (y + BOX_H / 2 + 9) + '" '
                + 'text-anchor="middle" fill="rgba(253,224,71,0.65)" font-size="9">' + shortLabel + '</text>';
        });

        // Center box (current course)
        svg += '<rect x="' + xCenter + '" y="' + centerY + '" width="' + BOX_W + '" height="' + BOX_H + '" '
            + 'rx="8" fill="rgba(14,165,233,0.2)" stroke="rgba(14,165,233,0.8)" stroke-width="2"/>';
        let shortName = course.name.length > 15 ? course.name.substring(0, 14) + '…' : course.name;
        svg += '<text x="' + (xCenter + BOX_W / 2) + '" y="' + (centerY + BOX_H / 2 - 7) + '" '
            + 'text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="bold">' + course.code + '</text>';
        svg += '<text x="' + (xCenter + BOX_W / 2) + '" y="' + (centerY + BOX_H / 2 + 9) + '" '
            + 'text-anchor="middle" fill="rgba(56,189,248,0.75)" font-size="9">' + shortName + '</text>';

        // Dependent boxes + arrows center → dependents
        dependents.forEach(function(dep, i) {
            let label = dep.name.length > 15 ? dep.name.substring(0, 14) + '…' : dep.name;
            let y = colY(dependents.length, i);
            let dy = y + BOX_H / 2;
            let cy = centerY + BOX_H / 2;

            let x1 = xCenter;
            let x2 = xDep + BOX_W;
            let mx = (x1 + x2) / 2;
            svg += '<path d="M' + x1 + ',' + cy + ' C' + mx + ',' + cy + ' ' + mx + ',' + dy + ' ' + x2 + ',' + dy + '" '
                + 'fill="none" stroke="rgba(56,189,248,0.35)" stroke-width="1.5" marker-end="url(#arrowB)"/>';

            svg += '<rect x="' + xDep + '" y="' + y + '" width="' + BOX_W + '" height="' + BOX_H + '" '
                + 'rx="8" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.35)" stroke-width="1"/>';
            svg += '<text x="' + (xDep + BOX_W / 2) + '" y="' + (y + BOX_H / 2 - 7) + '" '
                + 'text-anchor="middle" fill="rgba(165,180,252,0.9)" font-size="10" font-weight="bold">' + dep.code + '</text>';
            svg += '<text x="' + (xDep + BOX_W / 2) + '" y="' + (y + BOX_H / 2 + 9) + '" '
                + 'text-anchor="middle" fill="rgba(165,180,252,0.65)" font-size="9">' + label + '</text>';
        });

        svg += '</svg>';
        container.innerHTML = svg;
    }

    function updateMajorHeader() {
        let el = document.getElementById('majorTitle');
        if (el) {
            if (_isITE) {
                el.innerHTML = 'تخصص هندسة تقانة المعلومات - <span class="gradient-text font-semibold">ITE</span>';
            } else {
                el.innerHTML = 'تخصص <span class="gradient-text font-semibold">' + currentMajor + '</span>';
            }
        }
        let yearTabs = document.getElementById('yearTabs');
        if (yearTabs) { _isITE ? yearTabs.classList.remove('hidden') : yearTabs.classList.add('hidden'); }
        let catFilters = document.getElementById('categoryFilters');
        if (catFilters) { _isITE ? catFilters.classList.remove('hidden') : catFilters.classList.add('hidden'); }
    }

    async function updateStats() {
        let courses = await getCoursesForCurrentMajor();
        let el;
        el = document.getElementById('statTotal'); if (el) el.textContent = courses.length;
        el = document.getElementById('statYear2'); if (el) el.textContent = courses.filter(function(c) { return c.year === 2; }).length;
        el = document.getElementById('statYear3'); if (el) el.textContent = courses.filter(function(c) { return c.year === 3; }).length;
        el = document.getElementById('statYear4'); if (el) el.textContent = courses.filter(function(c) { return c.year === 4; }).length;
    }

    function setupSearch() {
        let input = document.getElementById('searchInput');
        if (!input) return;
        input.addEventListener('input', window.debounce(function() {
            searchQuery = input.value.trim().toLowerCase();
            renderCourses();
        }, 300));
    }

    function setupYearTabs() {
        document.querySelectorAll('.year-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.year-tab').forEach(function(t) {
                    t.classList.remove('active', 'text-white');
                    t.classList.add('text-secondary-400');
                });
                tab.classList.add('active', 'text-white');
                tab.classList.remove('text-secondary-400');
                currentYear = tab.dataset.year;
                renderCourses();
            });
        });
    }

    function setupCategoryFilters() {
        document.querySelectorAll('.cat-filter').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.cat-filter').forEach(function(b) {
                    b.classList.remove('active', 'bg-primary-500/20', 'text-primary-400');
                    b.classList.add('bg-secondary-800', 'text-secondary-400');
                });
                btn.classList.add('active', 'bg-primary-500/20', 'text-primary-400');
                btn.classList.remove('bg-secondary-800', 'text-secondary-400');
                currentCategory = btn.dataset.cat;
                renderCourses();
            });
        });
    }

    async function renderCourses() {
        let allCourses = await getCoursesForCurrentMajor();
        _loadedCourses = allCourses;
        let filtered = allCourses;

        if (currentYear !== 'all') {
            filtered = filtered.filter(function(c) { return c.year === parseInt(currentYear); });
        }
        if (currentCategory !== 'all') {
            filtered = filtered.filter(function(c) { return c.category === currentCategory; });
        }
        if (searchQuery) {
            filtered = filtered.filter(function(c) {
                return c.name.toLowerCase().includes(searchQuery) ||
                    c.code.toLowerCase().includes(searchQuery) ||
                    (CATEGORY_LABELS[c.category] || '').includes(searchQuery);
            });
        }

        filtered.sort(function(a, b) { return a.year - b.year || a.code.localeCompare(b.code); });

        let container = document.getElementById('coursesContainer');
        let emptyState = document.getElementById('emptyState');
        let countEl = document.getElementById('courseCount');

        if (countEl) countEl.textContent = filtered.length + ' مادة';

        if (filtered.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        container.innerHTML = filtered.map(function(course, i) {
            let cat = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.general;
            let catLabel = CATEGORY_LABELS[course.category] || course.category;
            let yearLabel = YEAR_LABELS[course.year] || '';

            let prereqBadge = '';
            if (_isITE && course.prerequisites) {
                if (course.prerequisites.length === 0) {
                    prereqBadge = '<span class="text-xs text-green-400 font-semibold">✓ مفتوحة</span>';
                } else {
                    prereqBadge = '<span class="text-xs text-yellow-400 font-semibold">🔗 يحتاج ' + course.prerequisites.length + '</span>';
                }
            }

            return '<div class="course-card glass rounded-xl p-4 cursor-pointer animate-in" '
                + 'style="animation-delay: ' + Math.min(i * 30, 300) + 'ms" '
                + 'onclick="openCourseModal(' + course.id + ')">'
                + '<div class="flex items-start justify-between gap-2 mb-3">'
                + '<span class="code-tag px-2 py-1 bg-primary-600/20 text-primary-400 rounded-md font-semibold">' + course.code + '</span>'
                + prereqBadge
                + '</div>'
                + '<h3 class="text-white font-semibold text-sm leading-relaxed mb-2 line-clamp-2">' + course.name + '</h3>'
                + '<div class="flex items-center justify-between text-xs text-secondary-500">'
                + '<span class="cat-badge ' + cat.bg + ' ' + cat.text + '">' + catLabel + '</span>'
                + '<span>' + yearLabel + '</span>'
                + '</div>'
                + '</div>';
        }).join('');
    }

    window.openCourseModal = function(id) {
        let courses = _loadedCourses || window.ITE_COURSES;
        let course = courses.find(function(c) { return c.id === id; });
        if (!course) return;

        document.getElementById('modalName').textContent = course.name;
        document.getElementById('modalCode').textContent = course.code;
        document.getElementById('modalId').textContent = '#' + course.id;
        document.getElementById('modalYear').textContent = YEAR_LABELS[course.year] || '';
        document.getElementById('modalCategory').textContent = CATEGORY_LABELS[course.category] || course.category;

        window.switchModalTab('info');

        // Hide old text sections, show chart container
        let prereqSection = document.getElementById('prereqSection');
        let dependentsSection = document.getElementById('dependentsSection');
        let prereqChart = document.getElementById('prereqChart');

        if (_isITE) {
            if (prereqSection) prereqSection.classList.add('hidden');
            if (dependentsSection) dependentsSection.classList.add('hidden');
            if (prereqChart) prereqChart.classList.remove('hidden');
            buildPrereqChart(course);
        } else {
            if (prereqSection) prereqSection.classList.add('hidden');
            if (dependentsSection) dependentsSection.classList.add('hidden');
            if (prereqChart) prereqChart.classList.add('hidden');
        }

        let groupsLink = document.getElementById('modalGroupsLink');
        if (groupsLink) groupsLink.href = 'groups.html?course=' + encodeURIComponent(course.code) + '&major=' + encodeURIComponent(currentMajor);

        if (window.initCourseResourcesTab) {
            window.initCourseResourcesTab(course.code, course.name, currentMajor);
        }

        let modal = document.getElementById('courseModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    function closeCourseModal() {
        let modal = document.getElementById('courseModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
    window.closeCourseModal = closeCourseModal;

    window.handleLogout = function(e) {
        if (e) e.preventDefault();
        logout();
    };

    document.addEventListener('DOMContentLoaded', async function() {
        window.initializeTheme?.();
        window.i18n?.initLang?.();

        initSupabase();

        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        await initMajor();
        updateMajorHeader();
        await updateStats();
        await renderCourses();
        setupSearch();
        setupYearTabs();
        setupCategoryFilters();
        setupModalTabButtons();

        document.getElementById('courseModal').addEventListener('click', function(e) {
            if (e.target.id === 'courseModal') closeCourseModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeCourseModal();
        });
    });
})();