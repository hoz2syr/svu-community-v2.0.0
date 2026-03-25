import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type Course = {
  id: string;
  code: string;
  name: string;
  name_ar: string | null;
  major: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true)
          .order('major', { ascending: true })
          .order('code', { ascending: true });

        if (fetchError) throw fetchError;

        setCourses(data ?? []);

        const uniqueMajors = [...new Set((data ?? []).map((c) => c.major))];
        setMajors(uniqueMajors);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return { courses, majors, loading, error };
}
