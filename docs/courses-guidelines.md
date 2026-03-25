# إرشادات المقررات الدراسية — Courses Guidelines

## تسمية المقررات

### رمز المقرر (Course Code)
- الصيغة: `{prefix}{number}` — مثال: `CS201`, `EE150`, `MATH301`
- البادئات المعتمدة:
  - `CS` — علوم الحاسب (Computer Science)
  - `ISE` — هندسة نظم المعلومات (Information Systems Engineering)
  - `EE` — الهندسة الكهربائية (Electrical Engineering)
  - `MATH` — الرياضيات (Mathematics)
  - `CE` — الهندسة المدنية (Civil Engineering)
  - `BBA` — إدارة الأعمال (Business Administration)
  - `ENG` — اللغة الإنجليزية (English)

### اسم المقرر
- يُحفظ بالإنجليزية في حقل `name`
- يُحفظ بالعربية في حقل `name_ar` (إن وُجد)
- لا تُستخدم اختصارات غير واضحة في الاسم

## التخصصات (Majors)

التخصصات مُعرّفة في جدول `courses` حقل `major`. القيم المعتمدة:

| المفتاح | الاسم بالعربية |
|---------|---------------|
| ISE (Information Systems Engineering) | هندسة نظم المعلومات |
| EDU (Educational Qualification Diploma) | دبلوم التأهيل التربوي |
| AHND | هندسة معمارية |
| PY | الصيدلة |
| EHND | هندسة كهربائية |
| ENG | اللغة الإنجليزية |
| BIT | تكنولوجيا معلومات الأعمال |
| BSCE | هندسة مدنية |
| MBA | إدارة أعمال |
| BBA | إدارة أعمال |
| MTM | إدارة تكنولوجيا |
| MQM | إدارة جودة |
| MWT | تكنولوجيا الويب |
| BL | القانون |

> مرجع: `apps/web/public/svu_courses.json`

## أنواع الموارد (Resource Types)

القيم المسموحة في حقل `resource_type` بجدول `course_resources`:

| النوع | الوصف | الأيقونة |
|-------|-------|---------|
| `PDF` | مستندات PDF | FileText |
| `فيديو` | روابط فيديو تعليمية | Video |
| `رابط` | روابط خارجية مفيدة | Link |
| `كود` | ملفات برمجية وأمثلة | Code |
| `شرائح` | عروض تقديمية | Presentation |

## قيود الرفع

- حجم الملف الأقصى: 5MB (حسب إعدادات Supabase Storage)
- الصيغ المدعومة: PDF, MP4, ZIP, RAR
- يجب أن يكون الرابط `https://` حصراً (لا تُقبل `javascript:` أو `data:`)

## تنسيق المحتوى العربي

- اتجاه النص: RTL دائماً
- الخط: Cairo (مُحمّل من Google Fonts)
- الأرقام: أرقام عربية-هندية (٠١٢٣٤٥٦٧٨٩) مفضلة

## سياسات RLS

| العملية | الشرط |
|---------|-------|
| SELECT | الجميع (للموارد النشطة فقط `is_active = true`) |
| INSERT | المستخدم المسجّل (يصبح `uploader_id`) |
| UPDATE | المالك أو المشرف |
| DELETE | المالك أو المشرف |

## روابط مفيدة

- [Supabase Migrations](../supabase/migrations/)
- [Course Resources Table](../supabase/migrations/03-course-resources.sql)
- [Courses Catalog Table](../supabase/migrations/06-courses-catalog.sql)
- [Architecture](./architecture.md)
