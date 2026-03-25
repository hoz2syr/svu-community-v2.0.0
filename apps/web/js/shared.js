/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Shared Data & Functions
 * البيانات والدوال المشتركة
 * ════════════════════════════════════════════════════════════════
 */

// Ensure namespace exists (core.js loads first, but be safe)
window.SVU = window.SVU || {};

// ════════════════════════════════════════════════════════════════
// Logger — تسجيل موحد مع إمكانية التعطيل في الإنتاج
// ════════════════════════════════════════════════════════════════
window.log = {
  debug: function() { if (window.SVU_DEBUG) console.debug.apply(console, arguments); },
  info: function() { if (window.SVU_DEBUG) console.info.apply(console, arguments); },
  warn: function() { if (window.SVU_DEBUG) console.warn.apply(console, arguments); },
  error: function() { console.error.apply(console, arguments); }, // always log errors
};

// ════════════════════════════════════════════════════════════════
// STATIC JSON COURSES LOADER
// ════════════════════════════════════════════════════════════════
window._svuCoursesData = null;

window.loadSVUCourses = async function() {
  if (window._svuCoursesData) return window._svuCoursesData;
  try {
    const res = await fetch('/svu_courses.json');
    if (!res.ok) throw new Error('Failed to load courses data');
    window._svuCoursesData = await res.json();
    return window._svuCoursesData;
  } catch (err) {
    window.log.error('[Courses] Failed to load course data:', err);
    return {};
  }
};

window.getMajorsList = async function() {
  const data = await window.loadSVUCourses();
  return Object.keys(data);
};

window.getCoursesByMajor = async function(majorKey) {
  const data = await window.loadSVUCourses();
  if (data[majorKey]) return data[majorKey];
  let found = Object.keys(data).find(function(k) { return k.toUpperCase().startsWith(majorKey.toUpperCase()); });
  return found ? data[found] : [];
};

window.resolveMajorKey = async function(majorCode) {
  const data = await window.loadSVUCourses();
  if (data[majorCode]) return majorCode;
  let found = Object.keys(data).find(function(k) { return k.toUpperCase().startsWith(majorCode.toUpperCase()); });
  return found || majorCode;
};

// ════════════════════════════════════════════════════════════════
// matchMajor — مقارنة مرنة للتخصصات (كود مختصر ↔ اسم كامل)
// ════════════════════════════════════════════════════════════════
// 'ISE' يطابق 'ISE (Information Systems Engineering)'
// 'ISE (Information Systems Engineering)' يطابق 'ISE (Information Systems Engineering)'
window.matchMajor = function(filterMajor, groupMajor) {
  if (!filterMajor || !groupMajor) return true; // لا فلتر = عرض الكل
  // تطابق تام
  if (filterMajor === groupMajor) return true;
  // استخراج الكود المختصر (قبل أول مسافة أو قوس)
  let filterCode = filterMajor.split(/[\s(]/)[0].toUpperCase();
  let groupCode = groupMajor.split(/[\s(]/)[0].toUpperCase();
  return filterCode === groupCode;
};

// ════════════════════════════════════════════════════════════════
// MAJORS DATABASE
// ════════════════════════════════════════════════════════════════
window.MAJORS = [
  'MBA','ACM','Afaq','Afaq_m','AFL','AHND','ALS','ATP','BACT','BAIT','BBA','BECT',
  'BIMM','BIS','BIT','BIT_Bridging','BL','BL_R','BMC','BRIDG','BSCE','BSCM','BTHM',
  'DAC','DL','DP','EDU','EDUC','EHND','ENG','Exam','FDOCT','HRM','ICDLTP','IMNR',
  'ISE','ITE','KPT','LFLBIMM','LFLDmail','LFLEmployees','LFLTOT','LFL_ALS','LFL_ELL',
  'LFL_PMP','LFL_RUSS','MAL','MCS','MDA','MDT','MedE','MedE_R','MHA','MIHL','MiQ',
  'MITE','MMA','MNE','MNGO','MNT','MQM','MTM','MWS','MWT','NEP','NIST','PMTM','PY',
  'TIBA','tiba_r','TIC','TIEMD','TITH','TPCOFC','TRE','TRI','UOG',
];

// ════════════════════════════════════════════════════════════════
// ITE COURSES DATABASE
// ════════════════════════════════════════════════════════════════
window.ITE_COURSES = [
  // ── Year 1 — No prerequisites ──
  { id: 1156, name: 'Algebraic Structures',                    code: 'BLA401',  year: 1, category: 'math',        prerequisites: [] },
  { id: 1155, name: 'Mathematical Analysis I',                 code: 'BMA401',  year: 1, category: 'math',        prerequisites: [] },
  { id: 1157, name: 'Programming I',                           code: 'BPG401',  year: 1, category: 'programming', prerequisites: [] },
  { id: 1154, name: 'Physics',                                 code: 'BPH401',  year: 1, category: 'general',     prerequisites: [] },
  { id: 1152, name: 'Computer Skills-ICDL',                   code: 'GCS301',  year: 1, category: 'general',     prerequisites: [] },
  { id: 1153, name: 'Introduction to On-Line Education',      code: 'GOE301',  year: 1, category: 'general',     prerequisites: [] },
  { id: 1225, name: 'Electronic Circuits',                    code: 'BEC401',  year: 1, category: 'systems',     prerequisites: [] },
  { id: 1222, name: 'Communications Skills and Technical Writing', code: 'GTW301', year: 1, category: 'general', prerequisites: [] },
  { id: 1373, name: 'Fundamentals of Management',             code: 'GMN401',  year: 1, category: 'general',     prerequisites: [] },

  // ── Year 1 → 2 transition ──
  { id: 1226, name: 'Logical Circuits',                       code: 'BLC401',  year: 1, category: 'systems',     prerequisites: ['BLA401', 'BEC401'] },
  { id: 1224, name: 'Mathematical Analysis II',               code: 'BMA402',  year: 1, category: 'math',        prerequisites: ['BMA401'] },
  { id: 1227, name: 'Programming II',                         code: 'BPG402',  year: 1, category: 'programming', prerequisites: ['BPG401'] },
  { id: 1223, name: 'Linear Algebra',                         code: 'BLA401',  year: 1, category: 'math',        prerequisites: [] },

  // ── Year 2 ──
  { id: 1364, name: 'Numerical Analysis',                     code: 'BNA401',  year: 2, category: 'math',        prerequisites: ['BMA402'] },
  { id: 1367, name: 'Signal Processing',                      code: 'BSP501',  year: 2, category: 'systems',     prerequisites: ['BMA402'] },
  { id: 1375, name: 'Telecommunication Systems',              code: 'BTS501',  year: 2, category: 'networks',    prerequisites: ['BSP501'] },
  { id: 1374, name: 'Discrete Mathematics',                   code: 'BDM501',  year: 2, category: 'math',        prerequisites: ['BLC401'] },
  { id: 1366, name: 'Computer Architecture I',                code: 'BCA501',  year: 2, category: 'systems',     prerequisites: ['BLC401'] },
  { id: 1381, name: 'Operating Systems I',                    code: 'BOS501',  year: 2, category: 'systems',     prerequisites: ['BCA501'] },
  { id: 1382, name: 'Operating Systems Lab I',                code: 'BOSL501', year: 2, category: 'systems',     prerequisites: ['BOS501'] },
  { id: 1383, name: 'Automata & Formal Languages',            code: 'BAU501',  year: 2, category: 'systems',     prerequisites: ['BDM501'] },
  { id: 1380, name: 'Probability & Statistics',               code: 'BPS601',  year: 2, category: 'math',        prerequisites: ['BDM501'] },
  { id: 1368, name: 'Data Structures and Algorithms I',       code: 'BDA501',  year: 2, category: 'programming', prerequisites: ['BPG402'] },
  { id: 1376, name: 'Database Systems I',                     code: 'BDB501',  year: 2, category: 'database',    prerequisites: ['BDA501'] },
  { id: 1377, name: 'Database Systems Lab I',                 code: 'BDBL501', year: 2, category: 'database',    prerequisites: ['BDB501'] },
  { id: 1385, name: 'Artificial Intelligence',                code: 'BAI501',  year: 2, category: 'ai',          prerequisites: ['BDA501', 'BDM501'] },
  { id: 1386, name: 'Computer Networks I',                    code: 'BNT501',  year: 2, category: 'networks',    prerequisites: ['BCA501', 'BOS501'] },
  { id: 1365, name: 'Web Programming I',                      code: 'BWP401',  year: 2, category: 'programming', prerequisites: ['BPG402'] },
  { id: 1378, name: 'Web Programming II',                     code: 'BWP501',  year: 2, category: 'programming', prerequisites: ['BWP401'] },
  { id: 1384, name: 'Programming III',                        code: 'BPG601',  year: 2, category: 'programming', prerequisites: ['BPG402'] },
  { id: 1389, name: 'Computer Graphics',                      code: 'BCG601',  year: 2, category: 'systems',     prerequisites: ['BPS601', 'BDA501'] },
  { id: 1396, name: 'Multimedia Systems',                     code: 'BMM601',  year: 2, category: 'general',     prerequisites: ['BCG601'] },
  { id: 1395, name: 'Information Systems Analysis and Design',code: 'BID601',  year: 2, category: 'software',    prerequisites: ['BDA501', 'BDB501'] },

  // ── Year 3 — Core ──
  { id: 1405, name: 'Data Structures & Algorithms II',        code: 'SDA601',  year: 3, category: 'programming', prerequisites: ['BDA501'] },
  { id: 1406, name: 'Database Systems II',                    code: 'SDB601',  year: 3, category: 'database',    prerequisites: ['BDB501'] },
  { id: 1407, name: 'Database Systems Lab II',                code: 'SDBL601', year: 3, category: 'database',    prerequisites: ['SDB601'] },
  { id: 1387, name: 'Software Engineering I',                 code: 'BSE601',  year: 3, category: 'software',    prerequisites: ['BPG601'] },
  { id: 1404, name: 'Software Engineering II',                code: 'SSE602',  year: 3, category: 'software',    prerequisites: ['BSE601'] },
  { id: 1410, name: 'Algorithm Analysis & Design',            code: 'SAD601',  year: 3, category: 'programming', prerequisites: ['SDA601'] },
  { id: 1388, name: 'Compilers',                              code: 'BCM601',  year: 3, category: 'systems',     prerequisites: ['BAU501'] },
  { id: 1394, name: 'Mobile Applications Programming',        code: 'BMP601',  year: 3, category: 'programming', prerequisites: ['BWP501'] },
  { id: 1409, name: 'Information System Security',            code: 'BIS601',  year: 3, category: 'security',    prerequisites: ['BAI501'] },
  { id: 1393, name: 'Intelligent Algorithms',                 code: 'BIA601',  year: 3, category: 'ai',          prerequisites: ['BAI501'] },
  { id: 1392, name: 'IT Project Management',                  code: 'GPM601',  year: 3, category: 'general',     prerequisites: ['BID601'] },
  { id: 1408, name: 'Project I',                              code: 'BPR601',  year: 3, category: 'general',     prerequisites: ['BID601', 'GPM601'] },
  { id: 1413, name: 'Project II',                             code: 'BPR602',  year: 4, category: 'general',     prerequisites: ['BPR601'] },
  { id: 1415, name: 'Simulation, Modelling and Verification', code: 'BSM601',  year: 4, category: 'software',    prerequisites: ['BPR601'] },
  { id: 1403, name: 'Ethics of Profession & Society',         code: 'GET601',  year: 3, category: 'general',     prerequisites: ['GPM601'] },
  { id: 1414, name: 'Epistemology & Computer Science',        code: 'GEP601',  year: 3, category: 'general',     prerequisites: [] },

  // ── Year 3/4 — SCN Networks/Security ──
  { id: 1427, name: 'Computer Architecture II',               code: 'NCA601',  year: 3, category: 'systems',     prerequisites: ['BCA501'] },
  { id: 1432, name: 'Computer Networks II',                   code: 'NNT601',  year: 3, category: 'networks',    prerequisites: ['BNT501'] },
  { id: 1435, name: 'Computer Networks Security',             code: 'NSS601',  year: 4, category: 'security',    prerequisites: ['BIS601', 'NNT601'] },
  { id: 1429, name: 'Operating Systems II',                   code: 'NOS601',  year: 3, category: 'systems',     prerequisites: ['BOS501'] },
  { id: 1430, name: 'Operating Systems Lab II',               code: 'NOSL601', year: 3, category: 'systems',     prerequisites: ['NOS601'] },
  { id: 1428, name: 'Network Application Programming',        code: 'NNP601',  year: 3, category: 'networks',    prerequisites: ['BPG402', 'BNT501'] },
  { id: 1434, name: 'Network Management',                     code: 'NNM601',  year: 4, category: 'networks',    prerequisites: ['NNT601'] },
  { id: 1431, name: 'Network Services',                       code: 'NNS601',  year: 3, category: 'networks',    prerequisites: ['NOS601', 'NNP601'] },
  { id: 1433, name: 'Distributed & Cloud Systems',            code: 'NDS601',  year: 4, category: 'networks',    prerequisites: ['NOS601', 'NNS601'] },
  { id: 1436, name: 'Real Time Systems',                      code: 'NRT601',  year: 4, category: 'networks',    prerequisites: ['NNS601'] },

  // ── Year 4 — SE Software Engineering ──
  { id: 1412, name: 'Data Mining',                            code: 'SDE601',  year: 4, category: 'ai',          prerequisites: ['BID601', 'BIA601'] },
  { id: 1411, name: 'Compiler Project',                       code: 'SCP601',  year: 4, category: 'systems',     prerequisites: ['BCM601'] },
  { id: 1416, name: 'Information Retrieval',                  code: 'SIR601',  year: 4, category: 'ai',          prerequisites: ['BDA501', 'BDM501', 'BWP501'] },
  { id: 1417, name: 'Semantic Web',                           code: 'SSW601',  year: 4, category: 'programming', prerequisites: ['BWP501'] },
  { id: 1418, name: 'Software Quality',                       code: 'SSQ601',  year: 4, category: 'software',    prerequisites: ['SSE602'] },

  // ── Year 4 — AI ──
  { id: 1419, name: 'Expert Systems',                         code: 'AES601',  year: 4, category: 'ai',          prerequisites: ['GPM601', 'BPS601'] },
  { id: 1426, name: 'Machine Learning',                       code: 'AML601',  year: 4, category: 'ai',          prerequisites: ['BPS601', 'BAI501'] },
  { id: 1421, name: 'Neural Networks & Fuzzy Logic',          code: 'ANN601',  year: 4, category: 'ai',          prerequisites: ['BAI501', 'BIA601'] },
  { id: 1420, name: 'Digital Image Processing',               code: 'AIP601',  year: 4, category: 'ai',          prerequisites: ['BCG601', 'BAI501'] },
  { id: 1423, name: 'Natural Language Processing',            code: 'ANL601',  year: 4, category: 'ai',          prerequisites: ['ANN601', 'AIP601'] },
  { id: 1422, name: 'Computer Vision',                        code: 'ACV601',  year: 4, category: 'ai',          prerequisites: ['SIR601', 'BCG601'] },
  { id: 1425, name: 'Virtual Reality',                        code: 'AVR601',  year: 4, category: 'ai',          prerequisites: ['ACV601', 'SIR601'] },

  // ── Year 4 — Security ──
  { id: 1813, name: 'Security Management',                    code: 'CSM601',  year: 4, category: 'security',    prerequisites: ['GPM601'] },
  { id: 1815, name: 'Security Incident Response',             code: 'CIR601',  year: 4, category: 'security',    prerequisites: ['BIS601'] },
  { id: 1816, name: 'Security of Operating Systems',          code: 'CSO601',  year: 4, category: 'security',    prerequisites: ['NOS601'] },
  { id: 1814, name: 'Cryptosystems',                          code: 'CCR601',  year: 4, category: 'security',    prerequisites: ['BPG601'] },
  { id: 1817, name: 'Security in Modern Systems',             code: 'CMS601',  year: 4, category: 'security',    prerequisites: ['NNT601'] },
  { id: 1818, name: 'Ethical Hacking',                        code: 'CEH601',  year: 4, category: 'security',    prerequisites: ['CSO601'] },

  // ── Year 4 — Data Science ──
  { id: 1787, name: 'Statistics and Data Analysis',           code: 'DSA601',  year: 4, category: 'math',        prerequisites: ['BPS601', 'BDA501'] },
  { id: 1784, name: 'Programming for Data Science',           code: 'DPD601',  year: 4, category: 'programming', prerequisites: ['BPG601'] },
  { id: 1786, name: 'NoSQL Databases',                        code: 'DNL601',  year: 4, category: 'database',    prerequisites: ['BDB501'] },
  { id: 1785, name: 'Open Data and Big Data',                 code: 'DOB601',  year: 4, category: 'ai',          prerequisites: [] },
  { id: 1790, name: 'Big Data Analysis',                      code: 'MDA601',  year: 4, category: 'ai',          prerequisites: ['AML601', 'BAI501', 'BIA601'] },
  { id: 1792, name: 'Deep Learning',                          code: 'MDL601',  year: 4, category: 'ai',          prerequisites: ['AML601', 'ANN601'] },
  { id: 1791, name: 'Internet of Things and Block Chaining',  code: 'MBC601',  year: 4, category: 'ai',          prerequisites: ['BAI501', 'BIA601'] },
  { id: 1789, name: 'Data Visualization',                     code: 'DDV601',  year: 4, category: 'ai',          prerequisites: ['DSA601'] },
  { id: 1788, name: 'Advanced Topics in Big Data',            code: 'DBD601',  year: 4, category: 'ai',          prerequisites: ['MDA601'] },
];

// ════════════════════════════════════════════════════════════════
// CATEGORY & YEAR LABELS
// ════════════════════════════════════════════════════════════════
window.CATEGORY_LABELS = {
  programming: 'catProgramming',
  database: 'catDatabase',
  networks: 'catNetworks',
  ai: 'catAI',
  security: 'catSecurity',
  systems: 'catSystems',
  math: 'catMath',
  software: 'catSoftware',
  general: 'catGeneral',
};

window.CATEGORY_COLORS = {
  programming: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  database: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  networks: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  ai: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  security: { bg: 'bg-red-500/20', text: 'text-red-400' },
  systems: { bg: 'bg-green-500/20', text: 'text-green-400' },
  math: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  software: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  general: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

window.YEAR_LABELS = { 1: 'year1', 2: 'year2', 3: 'year3', 4: 'year4' };

// ════════════════════════════════════════════════════════════════
// CLASSES DATABASE
// ════════════════════════════════════════════════════════════════
window.CLASSES = Array.from({ length: 50 }, (_, i) => 'C' + (i + 1));

// ════════════════════════════════════════════════════════════════
// Toast — النسخة الوحيدة المعتمدة
// ════════════════════════════════════════════════════════════════
window.showToast = function(message, type = 'success') {
  let toast = document.getElementById('toast');
  let content = document.getElementById('toastContent');

  // Auto-create toast if missing
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 transform transition-all duration-300 z-[9999] opacity-0 translate-y-4';
    toast.style.minWidth = '250px';
    content = document.createElement('div');
    content.id = 'toastContent';
    content.className = 'text-white px-6 py-3 rounded-xl shadow-2xl border text-center font-medium';
    toast.appendChild(content);
    document.body.appendChild(toast);
  }

  if (!content) content = document.getElementById('toastContent');
  if (!content) return;

  content.textContent = message;
  content.className = (type === 'success' ? 'bg-green-600' : 'bg-red-600')
    + ' text-white px-6 py-3 rounded-xl shadow-2xl border text-center font-medium';

  toast.classList.remove('opacity-0', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 3500);
};

// ════════════════════════════════════════════════════════════════
// formatDate
// ════════════════════════════════════════════════════════════════
window.formatDate = function(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const hours = Math.floor((now - date) / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const isAr = (window.i18n?.getLang?.() || 'ar') === 'ar';

  if (hours < 1) return isAr ? 'الآن' : 'Just now';
  if (hours < 24) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
  if (days < 7) return isAr ? `منذ ${days} يوم` : `${days}d ago`;
  return date.toLocaleDateString(isAr ? 'ar' : 'en');
};

// NOTE: timeAgo intentionally differs from packages/utils version —
// this one delegates to formatDate() for i18n (Arabic/English) support.
window.timeAgo = function(dateStr) {
  return window.formatDate(dateStr);
};

// ════════════════════════════════════════════════════════════════
// enrichCreators — إثراء بيانات المنشئين (حل N+1)
// ════════════════════════════════════════════════════════════════
window.enrichCreators = async function(groups, db) {
  if (!groups || groups.length === 0) return;
  if (!db) {
    db = window.getDb?.();
    if (!db) return;
  }

  let creatorIds = [];
  let seenIds = {};
  for (let i = 0; i < groups.length; i++) {
    let cid = groups[i].creator_id;
    if (cid && !seenIds[cid]) {
      seenIds[cid] = true;
      creatorIds.push(cid);
    }
  }

  if (creatorIds.length === 0) return;

  try {
    let creatorsResult = await db
      .from('users')
      .select('id, first_name, last_name, username')
      .in('id', creatorIds);

    let creatorMap = {};
    if (creatorsResult.data) {
      for (let j = 0; j < creatorsResult.data.length; j++) {
        creatorMap[creatorsResult.data[j].id] = creatorsResult.data[j];
      }
    }

    for (let k = 0; k < groups.length; k++) {
      let creator = creatorMap[groups[k].creator_id];
      groups[k]._creatorFullName = creator
        ? ((creator.first_name || '') + ' ' + (creator.last_name || '')).trim() || creator.username || 'مستخدم'
        : 'مستخدم';
      groups[k]._creatorUsername = creator ? creator.username || '' : '';
    }
  } catch (e) {
    // ignore enrichment errors
  }
};

// ════════════════════════════════════════════════════════════════
// logout
// ════════════════════════════════════════════════════════════════
window.logout = async function() {
  try {
    const db = window.getDb?.() || window._supabaseClient;
    if (db) await db.auth.signOut();
  } catch { /* ignore */ }
  window.clearUserSession();
  showToast(window.i18n?.t('dashboardLogoutSuccess') || 'Signed out successfully', 'success');
  setTimeout(() => { window.location.href = 'login.html'; }, 1000);
};

// ════════════════════════════════════════════════════════════════
// Category label helper (supports i18n)
// ════════════════════════════════════════════════════════════════
window.getCategoryLabel = function(category) {
  const key = window.CATEGORY_LABELS[category];
  return window.i18n?.t(key) || category;
};

window.getYearLabel = function(year) {
  const key = window.YEAR_LABELS[year];
  return window.i18n?.t(key) || `Year ${year}`;
};

// ════════════════════════════════════════════════════════════════
// URL helpers
// ════════════════════════════════════════════════════════════════
window.getUrlParam = function(name) {
  return new URLSearchParams(window.location.search).get(name);
};

// ════════════════════════════════════════════════════════════════
// Debounce
// DUPLICATE: packages/utils/src/index.ts has identical logic (TS version).
// TODO: Consolidate when web app migrates to ES modules.
// ════════════════════════════════════════════════════════════════
window.debounce = function(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

// ════════════════════════════════════════════════════════════════
// Country data (for phone input)
// ════════════════════════════════════════════════════════════════
window.COUNTRIES = [
  { code: 'SY', name: { ar: 'سوريا', en: 'Syria' }, dial: '+963', flag: '🇸🇾', localPfx: ['9'], minLen: 9, maxLen: 9 },
  { code: 'SA', name: { ar: 'السعودية', en: 'Saudi Arabia' }, dial: '+966', flag: '🇸🇦', localPfx: ['5'], minLen: 9, maxLen: 9 },
  { code: 'AE', name: { ar: 'الإمارات', en: 'UAE' }, dial: '+971', flag: '🇦🇪', localPfx: ['5'], minLen: 9, maxLen: 9 },
  { code: 'EG', name: { ar: 'مصر', en: 'Egypt' }, dial: '+20', flag: '🇪🇬', localPfx: ['1'], minLen: 10, maxLen: 10 },
  { code: 'JO', name: { ar: 'الأردن', en: 'Jordan' }, dial: '+962', flag: '🇯🇴', localPfx: ['7'], minLen: 9, maxLen: 9 },
  { code: 'LB', name: { ar: 'لبنان', en: 'Lebanon' }, dial: '+961', flag: '🇱🇧', localPfx: ['3', '7', '8'], minLen: 7, maxLen: 8 },
  { code: 'IQ', name: { ar: 'العراق', en: 'Iraq' }, dial: '+964', flag: '🇮🇶', localPfx: ['7'], minLen: 10, maxLen: 10 },
  { code: 'KW', name: { ar: 'الكويت', en: 'Kuwait' }, dial: '+965', flag: '🇰🇼', localPfx: ['5', '6', '9'], minLen: 8, maxLen: 8 },
  { code: 'TR', name: { ar: 'تركيا', en: 'Turkey' }, dial: '+90', flag: '🇹🇷', localPfx: ['5'], minLen: 10, maxLen: 10 },
  { code: 'US', name: { ar: 'الولايات المتحدة', en: 'USA' }, dial: '+1', flag: '🇺🇸', localPfx: [], minLen: 10, maxLen: 10 },
  { code: 'GB', name: { ar: 'بريطانيا', en: 'UK' }, dial: '+44', flag: '🇬🇧', localPfx: ['7'], minLen: 10, maxLen: 10 },
  { code: 'DE', name: { ar: 'ألمانيا', en: 'Germany' }, dial: '+49', flag: '🇩🇪', localPfx: ['15', '16', '17'], minLen: 10, maxLen: 11 },
];

// Get localized country name
window.getCountryName = function(country) {
  const lang = window.i18n?.getLang?.() || 'ar';
  return typeof country.name === 'object' ? country.name[lang] || country.name.ar : country.name;
};
