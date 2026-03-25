-- 06-courses-catalog.sql
-- Creates the courses catalog table imported from svu_courses.json
-- This table stores the full list of SVU courses across all majors

BEGIN;

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  major TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_major ON public.courses(major);
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(is_active) WHERE is_active = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_courses_updated_at();

-- RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Everyone can view active courses
CREATE POLICY "courses_select_all" ON public.courses
  FOR SELECT
  USING (is_active = true);

-- Only admins can insert/update/delete courses
CREATE POLICY "courses_admin_all" ON public.courses
  FOR ALL
  USING (public.is_admin());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;

COMMIT;
