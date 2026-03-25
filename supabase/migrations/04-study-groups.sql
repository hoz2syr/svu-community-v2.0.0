-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                                                                            ║
-- ║   SVU Community — Study Groups (Schedule App)                              ║
-- ║   جدول مجموعات الدراسة لتطبيق الجدول الدراسي                               ║
-- ║                                                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. جدول مجموعات الدراسة
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.study_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    members UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. الفهارس
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_study_groups_course_code ON public.study_groups(course_code);
CREATE INDEX idx_study_groups_creator ON public.study_groups(creator_id);
CREATE INDEX idx_study_groups_created ON public.study_groups(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Trigger لتحديث updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TRIGGER study_groups_updated_at
    BEFORE UPDATE ON public.study_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Row Level Security
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- القراءة: الجميع
CREATE POLICY "study_groups_select_all" ON public.study_groups
    FOR SELECT TO anon, authenticated
    USING (true);

-- الإدراج: المستخدمون المصادقون فقط — معرفه هو المنشئ
CREATE POLICY "study_groups_insert_auth" ON public.study_groups
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = creator_id);

-- التحديث: المنشئ أو الأدمن (أو عضو يريد الانضمام/المغادرة)
CREATE POLICY "study_groups_update_auth" ON public.study_groups
    FOR UPDATE TO authenticated
    USING (
        creator_id = auth.uid()
        OR public.is_admin(auth.uid())
        OR auth.uid() = ANY(members)
    )
    WITH CHECK (
        creator_id = auth.uid()
        OR public.is_admin(auth.uid())
        OR auth.uid() = ANY(members)
    );

-- الحذف: المنشئ أو الأدمن
CREATE POLICY "study_groups_delete_creator_or_admin" ON public.study_groups
    FOR DELETE TO authenticated
    USING (
        creator_id = auth.uid()
        OR public.is_admin(auth.uid())
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Realtime
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.study_groups;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ تم الإنشاء
-- ═══════════════════════════════════════════════════════════════════════════════
