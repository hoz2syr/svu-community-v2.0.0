# Architecture - الهندسة المعمارية

## نظرة عامة

مشروع SVU Community هو Monorepo يحتوي على 4 تطبيقات منفصلة تتقاسم نفس البنية التحتية.
النشر على Cloudflare Pages، والبيانات على Supabase.

## التطبيقات

### 1. web (التطبيق الرئيسي)
```
apps/web/
├── public/            # ملفات ثابتة (HTML, assets, svu_courses.json)
├── src/
│   ├── components/    # مكونات واجهة المستخدم
│   │   ├── ui/        # عناصر أساسية
│   │   ├── layout/    # تخطيط الصفحة
│   │   └── common/    # مكونات عامة
│   ├── features/      # ميزات حسب النطاق
│   │   ├── auth/      # المصادقة
│   │   ├── courses/   # المقررات
│   │   ├── groups/    # المجموعات
│   │   ├── schedule/  # الجدول
│   │   └── profile/   # الملف الشخصي
│   ├── services/      # خدمات API
│   ├── utils/         # أدوات مساعدة
│   └── styles/        # أنماط CSS
├── wrangler.toml      # إعداد Cloudflare Pages
└── package.json
```

### 2. courses (المواد الدرسية)
```
apps/courses/
├── src/
│   ├── app/
│   │   ├── components/   # مكونات المواد
│   │   │   ├── course-grid.tsx
│   │   │   ├── course-modal.tsx
│   │   │   ├── major-selector.tsx
│   │   │   └── ui/       # shadcn/ui components
│   │   └── App.tsx
│   ├── hooks/            # React hooks (useCourses, useCourseResources)
│   ├── lib/              # Supabase client
│   ├── assets/           # ملفات ثابتة
│   └── styles/           # أنماط Tailwind
└── package.json
```

### 3. schedule (مطابقة الجداول)
```
apps/schedule/
├── src/
│   ├── components/    # مكونات UI
│   ├── lib/           # مكتبات مساعدة
│   ├── services/      # خدمات Gemini AI
│   ├── types.ts       # TypeScript interfaces
│   ├── supabase.ts    # إعداد Supabase
│   └── App.tsx
├── scripts/           # سكربتات مساعدة
└── package.json
```

### 4. admin (لوحة الإدارة)
```
apps/admin/
├── src/               # (قيد التطوير)
└── package.json
```

## الحزم المشتركة (packages/)

| الحزمة | الوظيفة |
|--------|---------|
| `@svu-community/config` | إعدادات TypeScript, ESLint, Tailwind |
| `@svu-community/ui` | مكتبة مكونات مشتركة |
| `@svu-community/utils` | أدوات: cn, timeAgo, debounce, escapeHtml, safeJsonParse |

## القواعد المشتركة

### التسمية
- **Components**: PascalCase (e.g., `CourseCard.tsx`)
- **Hooks**: camelCase مع prefix `use` (e.g., `useAuth.ts`)
- **Services**: camelCase (e.g., `auth.service.js`)
- **Types**: PascalCase (e.g., `UserProfile.ts`)

### التبعيات المشتركة
- **Turbo**: إدارة الـ Monorepo
- **ESLint**: فحص الجودة
- **TypeScript**: التحقق من الأنواع
- **Vite**: البناء والتشغيل

## Backend — Supabase

### قاعدة البيانات
| الجدول | الوظيفة | الملف |
|--------|---------|-------|
| `users` | ملفات المستخدمين | `02-create-all.sql` |
| `groups` | مجموعات الدراسة | `02-create-all.sql` |
| `group_members` | أعضاء المجموعات | `02-create-all.sql` |
| `course_resources` | موارد المقررات | `03-course-resources.sql` |
| `study_groups` | مجموعات مطابقة الجدول | `04-study-groups.sql` |
| `courses` | كتالوج المقررات | `06-courses-catalog.sql` |

### Edge Functions
| الدالة | الوظيفة |
|--------|---------|
| `ocr-proxy` | وسيط لـ OCR.space API (إخفاء المفتاح) |
| `gemini-proxy` | وسيط لـ Google Gemini (تحليل صور الجدول) |

### Auth
- البريد الإلكتروني + كلمة المرور
- Google OAuth (لتطبيق schedule)
- إنشاء الملف الشخصي تلقائياً عبر `handle_new_user()` trigger

### RLS (Row Level Security)
- مُفعّل على جميع الجداول
- SELECT: الجميع (للسجلات النشطة)
- INSERT: المستخدم المسجّل
- UPDATE/DELETE: المالك أو المشرف

## النشر — Cloudflare Pages

| التطبيق | الوجهة | الإعداد |
|---------|--------|---------|
| web | Cloudflare Pages | `apps/web/wrangler.toml` |
| courses | Cloudflare Pages | (يحتاج إعداد) |
| schedule | Cloudflare Pages | (يحتاج إعداد) |

Security Headers (في `wrangler.toml`):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000`

## CI/CD

GitHub Actions:
- `ci.yml`: lint + typecheck + build (على كل push و PR)
- `deploy.yml`: بناء ونشر على Cloudflare Pages (على main فقط)

## أنظمة خارجية

| النظام | الاستخدام | التكامل |
|--------|---------|---------|
| Supabase | قاعدة البيانات + Auth + Storage | `@supabase/supabase-js` |
| Google Gemini | تحليل صور الجدول | Edge Function proxy |
| OCR.space | استخراج النصوص من الصور | Edge Function proxy |
| Cloudflare Pages | استضافة التطبيقات | wrangler CLI |

## أسرار Edge Functions (Supabase Secrets)

الأسرار تُعيَّن على مستوى Supabase Project وتُقرأ تلقائياً من قبل Edge Functions.

| المتغير | الاستخدام | الدالة | ملاحظات |
|---------|---------|--------|---------|
| `OCR_API_KEY` | مفتاح OCR.space API | `ocr-proxy` | مفتاح `K85419997088957` — يستخدم لاستخراج النصوص من صور الجداول |
| `GEMINI_API_KEY` | مفتاح Google Gemini | `gemini-proxy` | لتحليل صور الجداول |
| `ALLOWED_ORIGINS` | أصول CORS المسموحة | كلاهما | اختياري — افتراضي `http://localhost:3000` / `http://localhost:3001` |

### تعيين الأسرار

**مهم:** هذه الأوامر تُشغّل في **Terminal** (CMD/PowerShell/bash) — وليست في SQL Editor.

```bash
# ─── Bash / Git Bash ───
supabase secrets set OCR_API_KEY=K85419997088957
supabase secrets set GEMINI_API_KEY=your-gemini-key
supabase secrets set ALLOWED_ORIGINS=https://your-app.pages.dev

# ─── PowerShell ───
supabase secrets set OCR_API_KEY=K85419997088957
supabase secrets set GEMINI_API_KEY=your-gemini-key

# ─── التحقق من الأسرار المُعيّنة ───
supabase secrets list
```

**بديل: عبر Supabase Dashboard** (إذا فشل CLI بسبب DNS/شبكة):
1. https://supabase.com/dashboard → مشروعك → Edge Functions → Secrets
2. أضف: `OCR_API_KEY` = `K85419997088957`

### ملاحظة أمنية
- الأسرار **لا تُوضع** في `.env` أو `env.js` — تبقى على Supabase فقط
- Edge Functions تقرأها عبر `Deno.env.get('SECRET_NAME')`
- العميل لا يصل للمفاتح أبداً — يمر عبر Edge Function كوسيط

### سكريبت الإعداد السريع
```bash
# تشغيل سكريبت تعيين كل الأسرار مرة واحدة
bash scripts/setup-secrets.sh
```

## هيكل الملفات البيئية

```
.env.example          # قوالب المتغيرات المطلوبة
supabase/
├── config.toml       # إعداد Supabase المحلي
├── migrations/       # ترحيلات قاعدة البيانات
├── functions/        # Edge Functions (Deno)
└── seed/             # بيانات أولية
scripts/              # سكربتات البناء والنشر
.github/workflows/    # CI/CD pipelines
```
