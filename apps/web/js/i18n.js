/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — i18n (Internationalization)
 * نظام ثنائي اللغة: عربي / إنجليزي
 * ════════════════════════════════════════════════════════════════
 */

const STORAGE_KEY = 'svu_lang';

const TRANSLATIONS = {
  ar: {
    // Common
    appName: 'SVU Community',
    appTagline: 'مجتمع تقنية المعلومات',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    close: 'إغلاق',
    search: 'بحث',
    filter: 'تصفية',
    noResults: 'لا توجد نتائج',
    backToHome: 'العودة للرئيسية',
    comingSoon: 'قريباً',

    // Auth
    login: 'تسجيل الدخول',
    loginTitle: 'تسجيل الدخول',
    loginEmail: 'البريد الإلكتروني أو اسم المستخدم',
    loginPassword: 'كلمة المرور',
    loginRemember: 'تذكرني',
    loginForgot: 'نسيت كلمة المرور؟',
    loginBtn: 'تسجيل الدخول',
    loginNoAccount: 'ليس لديك حساب؟',
    loginCreateAccount: 'إنشاء حساب جديد',
    loginSuccess: 'مرحباً بك!',
    loginError: 'خطأ في تسجيل الدخول',
    loginInvalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    loginUserNotFound: 'المستخدم غير موجود. يرجى إنشاء حساب جديد.',
    loginEmailNotConfirmed: 'يرجى تفعيل بريدك الإلكتروني أولاً',
    loginTooManyAttempts: 'محاولات كثيرة جداً',
    loginNetworkError: 'خطأ في الاتصال، يرجى المحاولة مرة أخرى',

    // Registration
    register: 'إنشاء حساب',
    registerTitle: 'إنشاء حساب جديد',
    registerUsername: 'اسم المستخدم',
    registerUsernameHint: 'مثال: name_123456',
    registerFirstName: 'الاسم الأول',
    registerMiddleName: 'الاسم الأوسط',
    registerLastName: 'اسم العائلة',
    registerEmail: 'البريد الإلكتروني',
    registerMajor: 'التخصص',
    registerPhone: 'رقم الهاتف',
    registerPassword: 'كلمة المرور',
    registerConfirmPassword: 'تأكيد كلمة المرور',
    registerBtn: 'إنشاء حساب',
    registerHaveAccount: 'لديك حساب بالفعل؟',
    registerLogin: 'تسجيل الدخول',
    registerSuccess: 'تم إنشاء الحساب بنجاح!',
    registerEmailSent: 'تحقق من بريدك الإلكتروني لتفعيل الحساب',
    registerUsernameFormat: 'صيغة اسم المستخدم غير صحيحة! المطلوب: name_123456',
    registerMajorRequired: 'الرجاء اختيار التخصص!',
    registerPhoneRequired: 'رقم الهاتف غير صالح أو غير مكتمل',
    registerPasswordMismatch: 'كلمتا المرور غير متطابقتين!',
    registerPasswordWeak: 'كلمة المرور ضعيفة جداً',
    registerEmailExists: 'البريد الإلكتروني مسجّل مسبقاً',
    registerUsernameExists: 'اسم المستخدم مسجّل مسبقاً',

    // Password
    passwordStrength: 'قوة كلمة المرور',
    passwordVeryWeak: 'ضعيفة جداً',
    passwordWeak: 'ضعيفة',
    passwordMedium: 'متوسطة',
    passwordStrong: 'قوية',
    passwordMinChars: '8 أحرف على الأقل',
    passwordRequires: 'يجب أن تحتوي على',

    // Forgot password
    forgotPassword: 'استعادة كلمة المرور',
    forgotPasswordDesc: 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.',
    forgotPasswordBtn: 'إرسال رابط الاستعادة',
    forgotPasswordSuccess: 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني!',
    forgotPasswordError: 'فشل إرسال رابط الاستعادة',

    // Reset password
    resetPassword: 'إعادة تعيين كلمة المرور',
    resetPasswordNew: 'كلمة المرور الجديدة',
    resetPasswordConfirm: 'تأكيد كلمة المرور الجديدة',
    resetPasswordBtn: 'تغيير كلمة المرور',
    resetPasswordSuccess: 'تم تغيير كلمة المرور بنجاح!',
    resetPasswordError: 'فشل تغيير كلمة المرور',
    resetPasswordInvalidLink: 'رابط غير صالح أو منتهي الصلاحية',

    // Dashboard
    dashboardTitle: 'لوحة التحكم',
    dashboardWelcome: 'مرحباً',
    dashboardGroups: 'المجموعات الدراسية',
    dashboardGroupsDesc: 'انضم لمجموعاتك الدراسية',
    dashboardMaterials: 'المقررات الدراسية',
    dashboardMaterialsDesc: 'تصفح مقرراتك الدراسية',
    dashboardForum: 'المنتدى',
    dashboardForumDesc: 'شارك مع زملائك',
    dashboardProfile: 'الملف الشخصي',
    dashboardProfileDesc: 'إدارة بياناتك',
    dashboardLogout: 'تسجيل الخروج',
    dashboardLogoutSuccess: 'تم تسجيل الخروج بنجاح',

    // Groups
    groupsTitle: 'المجموعات الدراسية',
    groupsSearch: 'ابحث عن مجموعة...',
    groupsCreate: 'إنشاء مجموعة',
    groupsNoGroups: 'لا توجد مجموعات',
    groupsJoin: 'انضمام',
    groupsJoined: 'منضم',
    groupsFull: 'ممتلئة',
    groupsMembers: 'أعضاء',
    groupsMaxMembers: 'الحد الأقصى',
    groupsCourse: 'المقرر',
    groupsYear: 'السنة',
    groupsClass: 'الشعبة',
    groupsStatus: 'الحالة',
    groupsAllYears: 'كل السنوات',
    groupsAllClasses: 'كل الشعب',
    groupsAllStatuses: 'كل الحالات',
    groupsActive: 'نشطة',
    groupsInactive: 'غير نشطة',
    groupsCreateTitle: 'إنشاء مجموعة جديدة',
    groupsCreateBtn: 'إنشاء',
    groupsWhatsApp: 'واتساب',
    groupsJoinWhatsApp: 'انضم عبر واتساب',
    groupsCreatedBy: 'أنشأها',
    groupsCreator: 'المنشئ',
    groupsDetails: 'تفاصيل المجموعة',

    // Materials
    materialsTitle: 'المقررات الدراسية',
    materialsSearch: 'ابحث عن مقرر...',
    materialsAllYears: 'كل السنوات',
    materialsAllCategories: 'كل التصنيفات',
    materialsCode: 'الرمز',
    materialsCategory: 'التصنيف',
    materialsYear: 'السنة',
    materialsNoCourses: 'لا توجد مقررات',

    // Categories
    catProgramming: 'برمجة',
    catDatabase: 'قواعد بيانات',
    catNetworks: 'شبكات',
    catAI: 'ذكاء اصطناعي',
    catSecurity: 'أمن سيبراني',
    catSystems: 'نظم وعمارة',
    catMath: 'رياضيات',
    catSoftware: 'هندسة برمجيات',
    catGeneral: 'عامة',

    // Years
    year1: 'السنة الأولى',
    year2: 'السنة الثانية',
    year3: 'السنة الثالثة',
    year4: 'السنة الرابعة',

    // Footer / Meta
    footerAbout: 'عن المجتمع',
    footerAboutText: 'مجتمع طلاب تقنية المعلومات في الجامعة السورية الافتراضية',
    footerLinks: 'روابط سريعة',
    footerContact: 'تواصل معنا',
    footerPrivacy: 'سياسة الخصوصية',
    footerTerms: 'شروط الاستخدام',
    footerCopyright: '© 2025 SVU Community. جميع الحقوق محفوظة.',

    // SEO
    seoDescription: 'مجتمع طلاب تقنية المعلومات في الجامعة السورية الافتراضية - انضم لمجموعات دراسية وشارك المقررات',
    seoKeywords: 'SVU, سورية, افتراضية, تقنية, معلومات, مجتمع, مجموعات, مقررات',

    // Schedule Extraction
    scheduleTitle: 'استخراج الجدول',
    scheduleNavTitle: 'استخراج الجدول',
    scheduleUploadTitle: 'ارفع صورة جدولك الدراسي',
    scheduleUploadDesc: 'سيقوم الذكاء الاصطناعي باستخراج المواد والمجموعات المطابقة',
    scheduleDropText: 'اسحب الصورة هنا أو انقر للاختيار',
    scheduleDropHint: 'PNG, JPG حتى 10MB',
    scheduleClearImage: 'إزالة الصورة',
    scheduleExtractBtn: 'استخراج الجدول',
    scheduleExtracting: 'جاري الاستخراج...',
    scheduleExtractError: 'فشل الاستخراج. تأكد من وضوح الصورة.',
    scheduleApiKeyMissing: 'مفتاح Gemini غير مكوّن. عيّن GEMINI_API_KEY في ملف env.js (انظر README)',
    scheduleCourse: 'المادة',
    scheduleSection: 'الشعبة',
    scheduleInstructor: 'الدكتور',
    scheduleTime: 'الوقت',
    scheduleResultsTitle: 'المواد المستخرجة',
    scheduleMatchedGroups: 'المجموعات المطابقة',
    scheduleNoMatchedGroups: 'لا توجد مجموعات لهذه المادة',
    scheduleCreateGroup: 'إنشاء مجموعة',
    scheduleCreateGroupTitle: 'إنشاء مجموعة للمادة',
    scheduleCreateGroupBtn: 'إنشاء المجموعة',
    scheduleGroupCreated: 'تم إنشاء المجموعة بنجاح!',
    scheduleAllGroups: 'جميع المجموعات المتاحة',
    scheduleNoCourses: 'لم يتم استخراج أي مواد',
    scheduleMajor: 'التخصص',
    scheduleDashboard: 'لوحة التحكم',
    scheduleGroups: 'المجموعات',
    scheduleCode: 'الرمز',
    scheduleGroupName: 'اسم المجموعة',
    scheduleWhatsAppRequired: 'رابط الواتساب (إلزامي)',
    scheduleMaxMembers: 'الحد الأقصى للأعضاء',
    scheduleJoin: 'انضمام',
    scheduleFull: 'ممتلئة',
    scheduleMembers: 'أعضاء',

    // ═══ Onboarding Tour v6 — Page-Based Steps ═══

    // Tour controls
    tourNext: 'التالي',
    tourPrev: 'سابق',
    tourSkip: 'تخطي',
    tourFinish: 'تم',
    tourRestart: 'إعادة الجولة',

    // ── Dashboard Steps ──
    welcomeTitle: 'أهلاً بك في مجتمع SVU! 🎓',
    welcomeText: 'هذه منصتك الأكاديمية المتكاملة لطلاب تقنية المعلومات. سنجول معك عبر كل صفحة لنشرح لك كل ميزة بالتفصيل. لنبدأ!',

    dashUserCardTitle: 'بطاقتك الشخصية',
    dashUserCardText: 'هنا يظهر اسمك الكامل، بريدك الإلكتروني، وتخصصك الأكاديمي. يمكنك أيضاً تسجيل الخروج من أيقونة الخروج في الزاوية.',

    dashLangTitle: 'اللغة والمظهر',
    dashLangText: 'اضغط "EN" للتبديل للإنجليزية. أيقونة القمر/الشمس تبدّل المظهر بين الفاتح والداكن.',

    dashGroupsTitle: 'المجموعات الدراسية',
    dashGroupsText: 'انقر هنا للدخول إلى صفحة المجموعات. ستجد مجموعات لمقرراتك، وتستطيع إنشاء مجموعات جديدة والانضمام عبر واتساب.',

    dashMaterialsTitle: 'المواد الدراسية',
    dashMaterialsText: 'تصفح جميع مقررات تخصصك مرتبة حسب السنة والتصنيف. اضغط لمعرفة تفاصيل كل مادة ومتطلباتها.',

    dashScheduleTitle: 'استخراج الجدول',
    dashScheduleText: 'ارفع صورة جدولك الدراسي وسيقوم الذكاء الاصطناعي باستخراج المواد تلقائياً مع عرض المجموعات المطابقة.',

    dashProfileTitle: 'الملف الشخصي',
    dashProfileText: 'عدّل بياناتك، شاهد المجموعات التي انضممت إليها، وأدر المجموعات التي أنشأتها.',

    // ── Groups Steps ──
    grpSearchTitle: 'البحث عن مجموعة',
    grpSearchText: 'اكتب اسم المادة أو الدكتور هنا للعثور على المجموعات المناسبة بسرعة.',

    grpCreateTitle: 'إنشاء مجموعة جديدة',
    grpCreateText: 'اضغط هنا لإنشاء مجموعة دراسية جديدة. ستختار المادة، الشعبة، عدد الأعضاء، وتضيف رابط واتساب.',

    grpFilterTitle: 'الفلاتر والتصفيات',
    grpFilterText: 'صفّ المجموعات حسب التخصص، المادة، الشعبة، أو الحالة (متاحة/ممتلئة). يمكنك مسح كل الفلاتر بزر "مسح".',

    grpListTitle: 'قائمة المجموعات',
    grpListText: 'هنا تظهر كل المجموعات كبطاقات. كل بطاقة تعرض اسم المجموعة، المادة، وعدد الأعضاء.',

    grpCardTitle: 'بطاقة المجموعة',
    grpCardText: 'اضغط على أي بطاقة لفتح نافذة التفاصيل. ستشاهد معلومات المجموعة وزر الانضمام.',

    grpJoinTitle: 'الانضمام للمجموعة',
    grpJoinText: 'بعد فتح تفاصيل المجموعة، اضغط "انضمام" ثم "تأكيد الانضمام". سيظهر لك رابط واتساب للدخول مباشرة.',

    // ── Materials Steps ──
    matSearchTitle: 'البحث عن مادة',
    matSearchText: 'اكتب اسم المادة أو رمزها هنا للعثور عليها فوراً.',

    matYearTitle: 'تصنيف حسب السنة',
    matYearText: 'اضغط على السنة لعرض مقرراتها فقط. "الكل" يعرض جميع المقررات.',

    matCatTitle: 'التصنيفات',
    matCatText: 'فلتر حسب التخصص: برمجة، قواعد بيانات، شبكات، ذكاء اصطناعي، أمن سيبراني، وغيرها.',

    matCardTitle: 'بطاقات المقررات',
    matCardText: 'اضغط على أي بطاقة لفتح نافذة التفاصيل. ستشاهد المتطلبات السابقة، المواد التابعة، والروابط المشاركة.',

    matStatsTitle: 'إحصائيات المواد',
    matStatsText: 'هنا تعرض أعداد المواد الإجمالية وحسب كل سنة. مفيد لمعرفة עומس المقررات.',

    // ── Schedule Steps ──
    schUploadTitle: 'رفع الجدول الدراسي',
    schUploadText: 'اسحب صورة جدولك وأفلتها هنا، أو انقر لاختيارها. يدعم PNG و JPG حتى 10 ميجابايت.',

    schExtractTitle: 'زر الاستخراج',
    schExtractText: 'بعد رفع الصورة، اضغط هنا ليقوم الذكاء الاصطناعي بتحليل الجدول واستخراج أسماء المواد.',

    schResultsTitle: 'نتائج الاستخراج',
    schResultsText: 'بعد الاستخراج، ستظهر المواد المستخرجة هنا. اضغط على أي مادة لعرض المجموعات المطابقة أو إنشاء مجموعة جديدة.',

    schGroupsTitle: 'المجموعات المتاحة',
    schGroupsText: 'في الأسفل تظهر جميع المجموعات المتاحة. يمكنك تصفحها والانضمام مباشرة.',

    // ── Profile Steps ──
    profHeaderTitle: 'ملفك الشخصي',
    profHeaderText: 'هنا يظهر اسمك، بريدك، وتخصصك. يمكنك تعديل اسمك بالضغط على زر "تعديل".',

    profEditTitle: 'تعديل البيانات',
    profEditText: 'اضغط "تعديل" لفتح نافذة تغيير اسمك الأول واسم العائلة. احفظ التغييرات وستظهر فوراً.',

    profJoinedTitle: 'المجموعات المنضمة',
    profJoinedText: 'تبويب "مجموعاتي" يعرض كل المجموعات التي انضممت إليها. اضغط على أي مجموعة لعرض تفاصيلها.',

    profCreatedTitle: 'المجموعات التي أنشأتها',
    profCreatedText: 'تبويب "إنشائي" يعرض المجموعات التي أنشأتها. يمكنك عدّلها، عرض الأعضاء، أو حذفها.',

    profStatsTitle: 'إحصائياتك',
    profStatsText: 'هنا تعرض عدد المجموعات التي انضممت إليها والتي أنشأتها. مؤشر على نشاطك في المجتمع.',

    // ═══ Onboarding Tour v8 — Dashboard Tour ═══
    tour_welcome_title: 'أهلاً بك في مجتمع SVU!',
    tour_welcome_desc: 'هذه جولة سريعة نرشّحك فيها عبر أهم ميزات لوحة التحكم. استكشف المنصة وابدأ رحلتك الأكاديمية!',

    tour_usercard_title: 'بطاقتك الشخصية',
    tour_usercard_desc: 'هنا يظهر اسمك، بريدك الإلكتروني، وتخصصك. يمكنك تسجيل الخروج من أيقونة الخروج في الزاوية.',

    tour_groups_title: 'المجموعات الدراسية',
    tour_groups_desc: 'انضم لمجموعات دراسية لمقرراتك، أو أنشئ مجموعة جديدة وشارك رابط الواتساب مع زملائك.',

    tour_materials_title: 'المواد الدراسية',
    tour_materials_desc: 'تصفح جميع مقررات تخصصك مرتبة حسب السنة والتصنيف. اضغط لمعرفة تفاصيل كل مادة.',

    tour_schedule_title: 'استخراج الجدول',
    tour_schedule_desc: 'ارفع صورة جدولك الدراسي وسيقوم الذكاء الاصطناعي باستخراج المواد والمجموعات المطابقة.',

    tour_profile_title: 'الملف الشخصي',
    tour_profile_desc: 'عدّل بياناتك، شاهد المجموعات التي انضممت إليها، وأدر المجموعات التي أنشأتها.',

    tour_forum_title: 'المنتدى',
    tour_forum_desc: 'شارك أفكارك وناقش مع زملائك. هذه الميزة ستكون متاحة قريباً!',

    // ═══ Tooltips ═══
    tipSearch: 'ابحث عن مجموعات أو مواد',
    tipCreateGroup: 'أنشئ مجموعة دراسية جديدة',
    tipFilter: 'صفّ النتائج حسب رغبتك',
    tipJoin: 'انضم للمجموعة عبر واتساب',
    tipUpload: 'ارفع صورة جدولك الدراسي',
    tipExtract: 'استخرج المواد بالذكاء الاصطناعي',
    tipLangToggle: 'بدّل اللغة إلى الإنجليزية',
    tipThemeToggle: 'غيّر المظهر (فاتح/داكن)',
    tipLogout: 'تسجيل الخروج من الحساب',
    tipDashboard: 'العودة للوحة التحكم',
    tipGroups: 'عرض المجموعات الدراسية',
    tipMaterials: 'تصفح المواد الدراسية',
    tipSchedule: 'استخراج الجدول بالذكاء الاصطناعي',
    tipProfile: 'إدارة ملفك الشخصي',
    tipEditProfile: 'عدّل اسمك وبياناتك',
    tipRestartTour: 'أعد الجولة التعريفية',
    tipYearTab: 'عرض مقررات سنة معينة',
    tipCategory: 'فلتر حسب تصنيف المادة',
    tipCourseCard: 'اضغط لعرض تفاصيل المادة',

    // ═══ Feedback System ═══
    fbTitle: 'كيف كانت تجربتك؟ 💬',
    fbSubtitle: 'رأيك يهمنا! شاركنا تقييمك لنساعد زملائك الطلاب بشكل أفضل.',
    fbPickRating: 'اضغط على النجوم لتقييم تجربتك',
    fbRate1: 'للأسف لم تعجبني 😕',
    fbRate2: 'مقبولة لكن تحتاج تحسين 🤔',
    fbRate3: 'تجربة جيدة 👍',
    fbRate4: 'تجربة ممتازة! 🌟',
    fbRate5: 'تجربة رائعة ومذهلة! 🤩',
    fbFeedbackLabel: 'شاركنا ملاحظاتك أو اقتراحك (اختياري)',
    fbPlaceholder: 'ما الذي أعجبك؟ وما الذي يمكن تحسينه؟',
    fbSubmit: 'إرسال التقييم',
    fbSkip: 'تخطي الآن',
    fbSuccessTitle: 'شكراً لك! 🙏',
    fbSuccessText: 'نقدّر وقتك وملاحظاتك. رأيك يساعدنا على تحسين المنصة لجميع الطلاب.',
  },

  en: {
    // Common
    appName: 'SVU Community',
    appTagline: 'Information Technology Community',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    noResults: 'No results found',
    backToHome: 'Back to Home',
    comingSoon: 'Coming Soon',

    // Auth
    login: 'Sign In',
    loginTitle: 'Sign In',
    loginEmail: 'Email or Username',
    loginPassword: 'Password',
    loginRemember: 'Remember me',
    loginForgot: 'Forgot password?',
    loginBtn: 'Sign In',
    loginNoAccount: "Don't have an account?",
    loginCreateAccount: 'Create Account',
    loginSuccess: 'Welcome!',
    loginError: 'Login failed',
    loginInvalidCredentials: 'Invalid email or password',
    loginUserNotFound: 'User not found. Please create an account.',
    loginEmailNotConfirmed: 'Please confirm your email first',
    loginTooManyAttempts: 'Too many attempts',
    loginNetworkError: 'Connection error, please try again',

    // Registration
    register: 'Sign Up',
    registerTitle: 'Create Account',
    registerUsername: 'Username',
    registerUsernameHint: 'Example: name_123456',
    registerFirstName: 'First Name',
    registerMiddleName: 'Middle Name',
    registerLastName: 'Last Name',
    registerEmail: 'Email',
    registerMajor: 'Major',
    registerPhone: 'Phone Number',
    registerPassword: 'Password',
    registerConfirmPassword: 'Confirm Password',
    registerBtn: 'Create Account',
    registerHaveAccount: 'Already have an account?',
    registerLogin: 'Sign In',
    registerSuccess: 'Account created successfully!',
    registerEmailSent: 'Check your email to verify your account',
    registerUsernameFormat: 'Invalid username format! Required: name_123456',
    registerMajorRequired: 'Please select a major!',
    registerPhoneRequired: 'Invalid or incomplete phone number',
    registerPasswordMismatch: 'Passwords do not match!',
    registerPasswordWeak: 'Password is too weak',
    registerEmailExists: 'Email already registered',
    registerUsernameExists: 'Username already registered',

    // Password
    passwordStrength: 'Password strength',
    passwordVeryWeak: 'Very Weak',
    passwordWeak: 'Weak',
    passwordMedium: 'Medium',
    passwordStrong: 'Strong',
    passwordMinChars: 'At least 8 characters',
    passwordRequires: 'Must contain',

    // Forgot password
    forgotPassword: 'Forgot Password',
    forgotPasswordDesc: 'Enter your email and we will send you a reset link.',
    forgotPasswordBtn: 'Send Reset Link',
    forgotPasswordSuccess: 'Reset link sent to your email!',
    forgotPasswordError: 'Failed to send reset link',

    // Reset password
    resetPassword: 'Reset Password',
    resetPasswordNew: 'New Password',
    resetPasswordConfirm: 'Confirm New Password',
    resetPasswordBtn: 'Change Password',
    resetPasswordSuccess: 'Password changed successfully!',
    resetPasswordError: 'Failed to change password',
    resetPasswordInvalidLink: 'Invalid or expired link',

    // Dashboard
    dashboardTitle: 'Dashboard',
    dashboardWelcome: 'Welcome',
    dashboardGroups: 'Study Groups',
    dashboardGroupsDesc: 'Join your study groups',
    dashboardMaterials: 'Course Materials',
    dashboardMaterialsDesc: 'Browse your courses',
    dashboardForum: 'Forum',
    dashboardForumDesc: 'Connect with peers',
    dashboardProfile: 'Profile',
    dashboardProfileDesc: 'Manage your info',
    dashboardLogout: 'Sign Out',
    dashboardLogoutSuccess: 'Signed out successfully',

    // Groups
    groupsTitle: 'Study Groups',
    groupsSearch: 'Search groups...',
    groupsCreate: 'Create Group',
    groupsNoGroups: 'No groups found',
    groupsJoin: 'Join',
    groupsJoined: 'Joined',
    groupsFull: 'Full',
    groupsMembers: 'Members',
    groupsMaxMembers: 'Max',
    groupsCourse: 'Course',
    groupsYear: 'Year',
    groupsClass: 'Section',
    groupsStatus: 'Status',
    groupsAllYears: 'All Years',
    groupsAllClasses: 'All Sections',
    groupsAllStatuses: 'All Statuses',
    groupsActive: 'Active',
    groupsInactive: 'Inactive',
    groupsCreateTitle: 'Create New Group',
    groupsCreateBtn: 'Create',
    groupsWhatsApp: 'WhatsApp',
    groupsJoinWhatsApp: 'Join via WhatsApp',
    groupsCreatedBy: 'Created by',
    groupsCreator: 'Creator',
    groupsDetails: 'Group Details',

    // Materials
    materialsTitle: 'Course Materials',
    materialsSearch: 'Search courses...',
    materialsAllYears: 'All Years',
    materialsAllCategories: 'All Categories',
    materialsCode: 'Code',
    materialsCategory: 'Category',
    materialsYear: 'Year',
    materialsNoCourses: 'No courses found',

    // Categories
    catProgramming: 'Programming',
    catDatabase: 'Database',
    catNetworks: 'Networks',
    catAI: 'Artificial Intelligence',
    catSecurity: 'Cyber Security',
    catSystems: 'Systems & Architecture',
    catMath: 'Mathematics',
    catSoftware: 'Software Engineering',
    catGeneral: 'General',

    // Years
    year1: 'Year 1',
    year2: 'Year 2',
    year3: 'Year 3',
    year4: 'Year 4',

    // Footer / Meta
    footerAbout: 'About',
    footerAboutText: 'IT Students Community at Syrian Virtual University',
    footerLinks: 'Quick Links',
    footerContact: 'Contact Us',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    footerCopyright: '© 2025 SVU Community. All rights reserved.',

    // SEO
    seoDescription: 'Information Technology Students Community at Syrian Virtual University - Join study groups and share course materials',
    seoKeywords: 'SVU, Syria, virtual, university, IT, community, groups, courses',

    // Schedule Extraction
    scheduleTitle: 'Schedule Extraction',
    scheduleNavTitle: 'Schedule Extraction',
    scheduleUploadTitle: 'Upload your schedule image',
    scheduleUploadDesc: 'AI will extract your courses and find matching study groups',
    scheduleDropText: 'Drop image here or click to select',
    scheduleDropHint: 'PNG, JPG up to 10MB',
    scheduleClearImage: 'Remove image',
    scheduleExtractBtn: 'Extract Schedule',
    scheduleExtracting: 'Extracting...',
    scheduleExtractError: 'Extraction failed. Make sure the image is clear.',
    scheduleApiKeyMissing: 'Gemini API key not configured. Set GEMINI_API_KEY in env.js (see README)',
    scheduleCourse: 'Course',
    scheduleSection: 'Section',
    scheduleInstructor: 'Instructor',
    scheduleTime: 'Time',
    scheduleResultsTitle: 'Extracted Courses',
    scheduleMatchedGroups: 'Matched Groups',
    scheduleNoMatchedGroups: 'No groups for this course',
    scheduleCreateGroup: 'Create Group',
    scheduleCreateGroupTitle: 'Create Group for Course',
    scheduleCreateGroupBtn: 'Create Group',
    scheduleGroupCreated: 'Group created successfully!',
    scheduleAllGroups: 'All Available Groups',
    scheduleNoCourses: 'No courses extracted',
    scheduleMajor: 'Major',
    scheduleDashboard: 'Dashboard',
    scheduleGroups: 'Groups',
    scheduleCode: 'Code',
    scheduleGroupName: 'Group Name',
    scheduleWhatsAppRequired: 'WhatsApp link (required)',
    scheduleMaxMembers: 'Max Members',
    scheduleJoin: 'Join',
    scheduleFull: 'Full',
    scheduleMembers: 'Members',

    // ═══ Onboarding Tour v6 — Page-Based Steps ═══

    // Tour controls
    tourNext: 'Next',
    tourPrev: 'Previous',
    tourSkip: 'Skip',
    tourFinish: 'Done',
    tourRestart: 'Restart Tour',

    // ── Dashboard Steps ──
    welcomeTitle: 'Welcome to SVU Community! 🎓',
    welcomeText: 'This is your complete academic platform for IT students. We will walk you through each page to explain every feature in detail. Let\'s start!',

    dashUserCardTitle: 'Your Profile Card',
    dashUserCardText: 'Here you see your full name, email, and major. You can sign out using the logout icon in the corner.',

    dashLangTitle: 'Language & Theme',
    dashLangText: 'Press "EN" to switch to English. The moon/sun icon toggles between light and dark themes.',

    dashGroupsTitle: 'Study Groups',
    dashGroupsText: 'Click here to enter the Groups page. You\'ll find study groups for your courses, and can create new groups and join via WhatsApp.',

    dashMaterialsTitle: 'Course Materials',
    dashMaterialsText: 'Browse all your major courses organized by year and category. Click to see course details and prerequisites.',

    dashScheduleTitle: 'Schedule Extraction',
    dashScheduleText: 'Upload a photo of your schedule and AI will extract courses automatically with matching groups.',

    dashProfileTitle: 'Your Profile',
    dashProfileText: 'Edit your info, view groups you joined, and manage groups you created.',

    // ── Groups Steps ──
    grpSearchTitle: 'Search for a Group',
    grpSearchText: 'Type a course or professor name here to quickly find matching groups.',

    grpCreateTitle: 'Create New Group',
    grpCreateText: 'Click here to create a new study group. You\'ll choose the course, section, member count, and add a WhatsApp link.',

    grpFilterTitle: 'Filters',
    grpFilterText: 'Filter groups by major, course, section, or status (available/full). Use "Clear" to reset all filters.',

    grpListTitle: 'Groups List',
    grpListText: 'All groups appear as cards here. Each card shows the group name, course, and member count.',

    grpCardTitle: 'Group Card',
    grpCardText: 'Click any card to open the details window. You\'ll see group info and the join button.',

    grpJoinTitle: 'Joining a Group',
    grpJoinText: 'After opening group details, press "Join" then "Confirm Join". A WhatsApp link will appear for direct access.',

    // ── Materials Steps ──
    matSearchTitle: 'Search Course',
    matSearchText: 'Type a course name or code here to find it instantly.',

    matYearTitle: 'Filter by Year',
    matYearText: 'Tap a year to show only its courses. "All" shows every course.',

    matCatTitle: 'Categories',
    matCatText: 'Filter by specialization: Programming, Databases, Networks, AI, Cybersecurity, and more.',

    matCardTitle: 'Course Cards',
    matCardText: 'Click any card to open details. You\'ll see prerequisites, dependent courses, and shared resources.',

    matStatsTitle: 'Course Statistics',
    matStatsText: 'Total course counts by year are shown here. Useful for understanding your workload.',

    // ── Schedule Steps ──
    schUploadTitle: 'Upload Schedule',
    schUploadText: 'Drag your schedule image and drop it here, or click to select. Supports PNG and JPG up to 10MB.',

    schExtractTitle: 'Extract Button',
    schExtractText: 'After uploading, click here for AI to analyze and extract course names from your schedule.',

    schResultsTitle: 'Extraction Results',
    schResultsText: 'After extraction, extracted courses appear here. Click any course to view matching groups or create a new group.',

    schGroupsTitle: 'Available Groups',
    schGroupsText: 'At the bottom, all available groups are shown. Browse and join directly.',

    // ── Profile Steps ──
    profHeaderTitle: 'Your Profile',
    profHeaderText: 'Your name, email, and major are shown here. Click "Edit" to change your name.',

    profEditTitle: 'Edit Info',
    profEditText: 'Click "Edit" to open a window for changing your first and last name. Changes appear immediately after saving.',

    profJoinedTitle: 'Joined Groups',
    profJoinedText: 'The "My Groups" tab shows all groups you joined. Click any group to view details.',

    profCreatedTitle: 'Groups You Created',
    profCreatedText: 'The "Created" tab shows groups you made. You can edit, view members, or delete them.',

    profStatsTitle: 'Your Stats',
    profStatsText: 'Your joined and created group counts are shown here. A measure of your community activity.',

    // ═══ Onboarding Tour v8 — Dashboard Tour ═══
    tour_welcome_title: 'Welcome to SVU Community!',
    tour_welcome_desc: 'This is a quick tour to guide you through the key dashboard features. Explore the platform and start your academic journey!',

    tour_usercard_title: 'Your Profile Card',
    tour_usercard_desc: 'Here you see your name, email, and major. You can sign out using the logout icon in the corner.',

    tour_groups_title: 'Study Groups',
    tour_groups_desc: 'Join study groups for your courses, or create a new group and share a WhatsApp link with your peers.',

    tour_materials_title: 'Course Materials',
    tour_materials_desc: 'Browse all your major courses organized by year and category. Click to see course details.',

    tour_schedule_title: 'Schedule Extraction',
    tour_schedule_desc: 'Upload a photo of your schedule and AI will extract courses and find matching groups automatically.',

    tour_profile_title: 'Your Profile',
    tour_profile_desc: 'Edit your info, view groups you joined, and manage groups you created.',

    tour_forum_title: 'Forum',
    tour_forum_desc: 'Share ideas and discuss with your peers. This feature will be available soon!',

    // ═══ Tooltips ═══
    tipSearch: 'Search for groups or materials',
    tipCreateGroup: 'Create a new study group',
    tipFilter: 'Filter results to your preference',
    tipJoin: 'Join group via WhatsApp',
    tipUpload: 'Upload your schedule image',
    tipExtract: 'Extract courses with AI',
    tipLangToggle: 'Switch language to English',
    tipThemeToggle: 'Toggle light/dark theme',
    tipLogout: 'Sign out of your account',
    tipDashboard: 'Return to dashboard',
    tipGroups: 'View study groups',
    tipMaterials: 'Browse course materials',
    tipSchedule: 'AI schedule extraction',
    tipProfile: 'Manage your profile',
    tipEditProfile: 'Edit your name and info',
    tipRestartTour: 'Restart the guided tour',
    tipYearTab: 'Show courses for a specific year',
    tipCategory: 'Filter by course category',
    tipCourseCard: 'Click to view course details',

    // ═══ Feedback System ═══
    fbTitle: 'How was your experience? 💬',
    fbSubtitle: 'Your opinion matters! Share your rating to help us serve fellow students better.',
    fbPickRating: 'Tap the stars to rate your experience',
    fbRate1: 'Unfortunately not great 😕',
    fbRate2: 'Acceptable but needs improvement 🤔',
    fbRate3: 'Good experience 👍',
    fbRate4: 'Excellent experience! 🌟',
    fbRate5: 'Amazing and wonderful! 🤩',
    fbFeedbackLabel: 'Share your feedback or suggestion (optional)',
    fbPlaceholder: 'What did you like? What could be improved?',
    fbSubmit: 'Submit Rating',
    fbSkip: 'Skip for now',
    fbSuccessTitle: 'Thank You! 🙏',
    fbSuccessText: 'We appreciate your time and feedback. Your input helps us improve the platform for all students.',
  },
};

// Current language
let currentLang = localStorage.getItem(STORAGE_KEY) || 'ar';

/**
 * الحصول على النص المترجم
 */
function t(key) {
  const lang = currentLang === 'en' ? 'en' : 'ar';
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.ar[key] || key;
}

/**
 * تغيير اللغة
 */
function setLang(lang) {
  if (!['ar', 'en'].includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  applyLanguage(lang);
}

/**
 * الحصول على اللغة الحالية
 */
function getLang() {
  return currentLang;
}

/**
 * تبديل اللغة
 */
function toggleLang() {
  setLang(currentLang === 'ar' ? 'en' : 'ar');
  return currentLang;
}

/**
 * تطبيق اللغة على الصفحة
 */
function applyLanguage(lang) {
  const isArabic = lang === 'ar';
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });

  // Update all [data-i18n-placeholder] elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });

  // Update title
  const titleEl = document.querySelector('title[data-i18n]');
  if (titleEl) {
    titleEl.textContent = t(titleEl.getAttribute('data-i18n'));
  }

  // Update lang toggle button
  const langBtn = document.querySelector('[data-lang-toggle]');
  if (langBtn) {
    langBtn.textContent = isArabic ? 'EN' : 'AR';
  }
}

/**
 * تهيئة اللغة عند تحميل الصفحة
 */
function initLang() {
  applyLanguage(currentLang);
}

// Export for window globals
window.i18n = { t, setLang, getLang, toggleLang, applyLanguage, initLang };
