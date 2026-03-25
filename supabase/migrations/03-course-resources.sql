-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                                                                            ║
-- ║   SVU Community — Course Resources (Links)                                 ║
-- ║   جدول مشاركة روابط المواد الدراسية                                        ║
-- ║                                                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. جدول الموارد (روابط مشاركة)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.course_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    major TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL DEFAULT 'link',
    uploader_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    uploader_name TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. الفهارس
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_course_resources_code ON public.course_resources(course_code);
CREATE INDEX idx_course_resources_major ON public.course_resources(major);
CREATE INDEX idx_course_resources_uploader ON public.course_resources(uploader_id);
CREATE INDEX idx_course_resources_created ON public.course_resources(created_at DESC);
CREATE INDEX idx_course_resources_active ON public.course_resources(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Trigger لتحديث updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TRIGGER course_resources_updated_at
    BEFORE UPDATE ON public.course_resources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Row Level Security
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

-- القراءة: الجميع يمكنهم رؤية الموارد النشطة
CREATE POLICY "resources_select_all" ON public.course_resources
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

-- الإدراج: المستخدمون المصادقون فقط
CREATE POLICY "resources_insert_auth" ON public.course_resources
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = uploader_id);

-- التحديث: صاحب المورد أو الأدمن (للتصويت أو التعديل)
CREATE POLICY "resources_update_own_or_admin" ON public.course_resources
    FOR UPDATE TO authenticated
    USING (
        uploader_id = auth.uid()
        OR public.is_admin(auth.uid())
    )
    WITH CHECK (
        uploader_id = auth.uid()
        OR public.is_admin(auth.uid())
    );

-- الحذف: صاحب المورد أو الأدمن
CREATE POLICY "resources_delete_own_or_admin" ON public.course_resources
    FOR DELETE TO authenticated
    USING (
        uploader_id = auth.uid()
        OR public.is_admin(auth.uid())
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Realtime
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.course_resources;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ تم الإنشاء
-- ═══════════════════════════════════════════════════════════════════════════════
