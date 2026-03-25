# SVU Community

منصة مجتمع طلاب جامعة SVU - نظام موحد لإدارة المقررات الدراسية والمواد التعليمية والجداول الدراسية.

## الهيكل

```
svu-community/
├── apps/                    # التطبيقات الرئيسية
│   ├── web/                 # التطبيق الرئيسي (Vanilla JS + Vite)
│   ├── courses/             # صفحة المواد الدراسية (React + TS)
│   └── schedule/            # مطابقة الجداول (React + TS + Gemini AI)
├── packages/                # حزم مشتركة
│   ├── ui/                  # مكتبة مكونات واجهة المستخدم
│   ├── config/              # إعدادات مشتركة (ESLint, TS, Tailwind)
│   └── utils/               # أدوات مساعدة مشتركة
├── supabase/                # قاعدة البيانات و Supabase
│   ├── migrations/          # هجرات قاعدة البيانات
│   ├── functions/           # Edge Functions (ocr-proxy, gemini-proxy)
│   └── seed/                # بيانات تجريبية
├── docs/                    # التوثيق
├── scripts/                 # سكربتات التشغيل
└── .github/                 # GitHub Actions (CI/CD)
```

## التطبيقات

### apps/web - التطبيق الرئيسي
- **الטכנולוגיה**: Vanilla JavaScript + Vite + Tailwind CSS v4 + Supabase
- **الوصف**: المنصة الرئيسية - تسجيل الدخول، لوحة التحكم، المجموعات، الملف الشخصي
- **التشغيل**: `npm run dev:web`

### apps/courses - المواد الدراسية
- **الטכנולוגיה**: React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- **الوصف**: عرض وتصفح المقررات الدرسية حسب التخصص
- **التشغيل**: `npm run dev:courses`

### apps/schedule - مطابقة الجداول
- **الטכנולוגיה**: React 19 + TypeScript + Vite + Gemini AI
- **الوصف**: العثور على الأشخاص المشاركين نفس الجدول الدراسي
- **التشغيل**: `npm run dev:schedule`

## التشغيل

```bash
# تثبيت التبعيات
npm install

# تشغيل جميع التطبيقات
npm run dev

# تشغيل تطبيق محدد
npm run dev:web
npm run dev:courses
npm run dev:schedule

# بناء الإنتاج
npm run build

# فحص الجودة
npm run lint
npm run typecheck
```

## متغيرات البيئة

### أين توضع المفاتيح؟

| المفتاح | أين يُوضع | ملاحظات |
|---------|-----------|---------|
| `SUPABASE_URL` | `.env.local` (محلي) + GitHub Secrets (CI/CD) | VITE_ prefix للبناء |
| `SUPABASE_ANON_KEY` | `.env.local` (محلي) + GitHub Secrets (CI/CD) | VITE_ prefix للبناء |
| `OCR_API_KEY` | Supabase Edge Functions Secrets | `supabase secrets set` |
| `GEMINI_API_KEY` | Supabase Edge Functions Secrets | `supabase secrets set` |
| `CF_API_TOKEN` | GitHub Secrets | للنشر على Cloudflare |
| `CF_ACCOUNT_ID` | GitHub Secrets | للنشر على Cloudflare |

### الإعداد المحلي

```bash
# 1. انسخ ملف المتغيرات
cp .env.example .env.local

# 2. أدخل قيم Supabase في apps/web/.env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### إعداد Supabase Edge Functions Secrets

```bash
# تثبيت Supabase CLI
npm install -g supabase

# ربط المشروع
supabase link --project-ref your-project-ref

# تعيين الأسرار
supabase secrets set OCR_API_KEY=your-ocr-key
supabase secrets set GEMINI_API_KEY=your-gemini-key
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com

# أو استخدم السكريبت
bash scripts/setup-secrets.sh
```

### إعداد GitHub Secrets (لـ CI/CD)

في GitHub repo → Settings → Secrets and variables → Actions:

| Secret | القيمة |
|--------|--------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ...` (anon key من Supabase) |
| `CF_ACCOUNT_ID` | Cloudflare Account ID |
| `CF_API_TOKEN` | Cloudflare API Token |

### إعداد قاعدة البيانات

```bash
# تشغيل سكربت القاعدة (مرة واحدة)
# انسخ محتوى supabase/complete-schema.sql في Supabase SQL Editor
```

### إعداد Supabase Dashboard

1. **Authentication > Providers**: فعّل Email
2. **Authentication > Settings**:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: أضف روابطك
3. **Edge Functions**: تأكد من نشر `ocr-proxy` و `gemini-proxy`
4. **Storage**: تم إنشاء `avatars` bucket تلقائياً عبر السكربت

## النشر

النشر تلقائي عند push على فرع `main` عبر GitHub Actions:
1. CI: lint + typecheck + build
2. CD: نشر `apps/web/dist` على Cloudflare Pages

## المساهمة

1. أنشئ فرع جديد: `git checkout -b feature/name`
2. اكتب الكود مع اختبارات
3. ارفع التغييرات: `git push origin feature/name`
4. افتح Pull Request
