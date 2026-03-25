import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type Resource = {
  id: string;
  course_code: string;
  course_name: string;
  major: string;
  title: string;
  url: string;
  description: string | null;
  resource_type: string;
  uploader_id: string | null;
  uploader_name: string;
  votes: number;
  is_active: boolean;
  created_at: string;
};

export function useCourseResources(courseCode: string | null) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseCode) {
      setResources([]);
      return;
    }

    async function fetchResources() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('course_resources')
          .select('*')
          .eq('course_code', courseCode!)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setResources(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, [courseCode]);

  return { resources, loading, error };
}
