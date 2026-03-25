-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                                                                            ║
-- ║   SVU Community — CREATE ALL Script                                        ║
-- ║   سكربت إنشاء كل شيء — الجداول والدوال والسياسات والتخزين                  ║
-- ║                                                                            ║
-- ║   ⚠️ شغّل 01-drop-all.sql أولاً قبل هذا السكربت                           ║
-- ║                                                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- الجزء 1: الجداول (Tables)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1.1 جدول المستخدمين
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    major TEXT NOT NULL,
    phone TEXT,
    country_code TEXT,
    country_name TEXT,
    country_dial TEXT,
    country_flag TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 جدول المجموعات
CREATE TABLE public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    class_number TEXT,
    doctor_name TEXT,
    max_members INTEGER DEFAULT 5,
    current_members INTEGER DEFAULT 1,
    whatsapp_link TEXT NOT NULL,
    group_link TEXT,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    creator_name TEXT,
    major TEXT NOT NULL,
    is_full BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 جدول أعضاء المجموعات
CREATE TABLE public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- الجزء 2: الفهارس (Indexes)
-- ═══════════════════════════════════════════════════════════════════════════════

-- فهارس المستخدمين
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_major ON public.users(major);
CREATE INDEX idx_users_country ON public.users(country_code);
CREATE INDEX idx_users_is_admin ON public.users(is_admin) WHERE is_admin = true;

-- فهارس المجموعات
CREATE INDEX idx_groups_major ON public.groups(major);
CREATE INDEX idx_groups_course_code ON public.groups(course_code);
CREATE INDEX idx_groups_class ON public.groups(class_number);
CREATE INDEX idx_groups_creator ON public.groups(creator_id);
CREATE INDEX idx_groups_created ON public.groups(created_at DESC);
CREATE INDEX idx_groups_is_full ON public.groups(is_full) WHERE is_full = false;

-- فهارس الأعضاء
CREATE INDEX idx_members_group ON public.group_members(group_id);
CREATE INDEX idx_members_user ON public.group_members(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- الجزء 3: الدوال (Functions)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 3.1 دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 دالة حساب عدد الأعضاء تلقائياً
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.groups
    SET
        current_members = (
            SELECT COUNT(*) FROM public.group_members
            WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
        ),
        is_full = (
            SELECT COUNT(*) >= max_members FROM public.group_members
            WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
        )
    WHERE id = COALESCE(NEW.group_id, OLD.group_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3.3 إنشاء profile تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, username, email,
        first_name, middle_name, last_name,
        major, phone,
        country_code, country_name, country_dial, country_flag
    ) VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'middle_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'major', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'country_code', ''),
        COALESCE(NEW.raw_user_meta_data->>'country_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'country_dial', ''),
        COALESCE(NEW.raw_user_meta_data->>'country_flag', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3.4 دالة التحقق من صلاحيات الأدمن
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id AND is_admin = true AND is_active = true
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3.5 دالة التحقق من نشاط المستخدم
CREATE OR REPLACE FUNCTION public.is_user_active(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT is_active FROM public.users WHERE id = user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3.6 دالة جلب بيانات آمنة (بدون حساسية)
CREATE OR REPLACE FUNCTION public.get_safe_user_data(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    major TEXT,
    avatar_url TEXT
) AS $$
    SELECT id, username, first_name, last_name, major, avatar_url
    FROM public.users
    WHERE id = user_uuid AND is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3.7 دالة إحصائيات المشرف (Dashboard Admin)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
    total_users BIGINT,
    active_users BIGINT,
    total_groups BIGINT,
    full_groups BIGINT,
    total_memberships BIGINT
) AS $$
    SELECT
        (SELECT COUNT(*) FROM public.users),
        (SELECT COUNT(*) FROM public.users WHERE is_active = true),
        (SELECT COUNT(*) FROM public.groups),
        (SELECT COUNT(*) FROM public.groups WHERE is_full = true),
        (SELECT COUNT(*) FROM public.group_members);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- الجزء 4: الـ Triggers
-- ═══════════════════════════════════════════════════════════════════════════════

-- 4.1 تحديث updated_at عند تعديل المستخدم
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 4.2 تحديث updated_at عند تعديل المجموعة
CREATE TRIGGER groups_updated_at
    BEFORE UPDATE ON public.groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 4.3 حساب عدد الأعضاء عند إضافة عضو
CREATE TRIGGER group_member_count_insert
    AFTER INSERT ON public.group_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_group_member_count();

-- 4.4 حساب عدد الأعضاء عند حذف عضو
CREATE TRIGGER group_member_count_delete
    AFTER DELETE ON public.group_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_group_member_count();

-- 4.5 إنشاء profile تلقائياً عند التسجيل
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- الجزء 5: Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 5.1 تفعيل RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5.2 سياسات جدول المستخدمين
-- ═══════════════════════════════════════════════════════════════════════════════

-- القراءة: الجميع يمكنهم رؤية الملفات العامة
CREATE POLICY "users_select_all" ON public.users
    FOR SELECT TO anon, authenticated
    USING (true);

-- الإدراج: authenticated فقط — handle_new_user() trigger يتجاوز RLS بـ SECURITY DEFINER
-- لا حاجة لـ anon INSERT policy لأن الـ trigger ينشئ المستخدم تلقائياً

-- الإدراج: authenticated (بعد التفعيل)
CREATE POLICY "users_insert_auth" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- التحديث: المستخدم يحدّث بياناته فقط
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5.3 سياسات جدول المجموعات
-- ═══════════════════════════════════════════════════════════════════════════════

-- القراءة: الجميع
CREATE POLICY "groups_select_all" ON public.groups
    FOR SELECT TO anon, authenticated
    USING (true);

-- الإدراج: المستخدمون المصادقون فقط — معرفه هو المنشئ
CREATE POLICY "groups_insert_auth" ON public.groups
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = creator_id);

-- التحديث: المنشئ أو الأدمن
CREATE POLICY "groups_update_creator_or_admin" ON public.groups
    FOR UPDATE TO authenticated
    USING (
        creator_id = auth.uid()
        OR public.is_admin(auth.uid())
    )
    WITH CHECK (
        creator_id = auth.uid()
        OR public.is_admin(auth.uid())
    );

-- الحذف: المنشئ أو الأدمن
CREATE POLICY "groups_delete_creator_or_admin" ON public.groups
    FOR DELETE TO authenticated
    USING (
        creator_id = auth.uid()
        OR public.is_admin(auth.uid())
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5.4 سياسات جدول أعضاء المجموعات
-- ═══════════════════════════════════════════════════════════════════════════════

-- القراءة: الجميع
CREATE POLICY "members_select_all" ON public.group_members
    FOR SELECT TO anon, authenticated
    USING (true);

-- الانضمام: المستخدم يُضيف نفسه فقط
CREATE POLICY "members_insert_auth" ON public.group_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- المغادرة/الحذف: العضو نفسه أو منشئ المجموعة أو الأدمن
CREATE POLICY "members_delete_creator_or_admin" ON public.group_members
    FOR DELETE TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.groups
            WHERE groups.id = group_members.group_id
            AND groups.creator_id = auth.uid()
        )
        OR public.is_admin(auth.uid())
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- الجزء 6: Storage (تخزين الصور)
-- ═══════════════════════════════════════════════════════════════════════════════

-- إنشاء bucket للصور الشخصية
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- سياسات Storage للصور الشخصية

-- الجميع يمكنه رؤية الصور
CREATE POLICY "avatars_select_public" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'avatars');

-- المستخدم يرفع صورته فقط (داخل مجلده)
CREATE POLICY "avatars_insert_own" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- المستخدم يحدّث صورته فقط
CREATE POLICY "avatars_update_own" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- المستخدم يحذف صورته فقط
CREATE POLICY "avatars_delete_own" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- الجزء 7: Realtime (التحديثات الفورية)
-- ═══════════════════════════════════════════════════════════════════════════════

-- تفعيل Realtime على جدول المجموعات
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;

-- تفعيل Realtime على جدول الأعضاء
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;

-- ═══════════════════════════════════════════════════════════════════════════════
-- الجزء 8: التحقق النهائي (Verification)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 8.1 عرض الجداول المُنشأة
SELECT '=== الجداول ===' AS section;
SELECT schemaname, tablename, tableowner
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('users', 'groups', 'group_members')
ORDER BY tablename;

-- 8.2 عرض سياسات RLS
SELECT '=== سياسات RLS ===' AS section;
SELECT schemaname, tablename, policyname, cmd AS operation, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8.3 عرض الفهارس
SELECT '=== الفهارس ===' AS section;
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('users', 'groups', 'group_members')
ORDER BY tablename, indexname;

-- 8.4 عرض الدوال
SELECT '=== الدوال ===' AS section;
SELECT p.proname AS function_name, pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname IN (
    'update_updated_at', 'update_group_member_count', 'handle_new_user',
    'is_admin', 'is_user_active', 'get_safe_user_data', 'get_admin_stats'
)
ORDER BY p.proname;

-- 8.5 عرض الـ Triggers
SELECT '=== الـ Triggers ===' AS section;
SELECT trigger_name, event_object_table AS table_name, event_manipulation AS event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 8.6 عرض Storage Buckets
SELECT '=== Storage Buckets ===' AS section;
SELECT id, name, public, file_size_limit FROM storage.buckets;

-- 8.7 عرض Realtime Tables
SELECT '=== Realtime Tables ===' AS section;
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ تم الإنشاء بنجاح!
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- الخطوات بعد التشغيل:
--
-- 1️⃣  انتقل إلى Authentication > Providers وفعّل Email
--
-- 2️⃣  انتقل إلى Authentication > Settings:
--     - Site URL: https://your-domain.com (أو رابطك)
--     - Redirect URLs: أضف كل الروابط المطلوبة
--     - فعّل/عطّل "Enable email confirmations" حسب حاجتك
--
-- 3️⃣  لتعيين أدمن — سجّل دخول أولاً ثم شغّل:
--     UPDATE public.users SET is_admin = true WHERE email = 'your-email@example.com';
--
-- ═══════════════════════════════════════════════════════════════════════════════
