export type CourseType = 'core' | 'general' | 'english' | 'project';

export interface Course {
  code: string;
  name_ar: string;
  credits: number;
  year: number;
  type: CourseType;
  prereqs: string[];
  english_must_pass?: boolean;
}

export interface SpecializationCourse {
  code: string;
  name_ar: string;
  credits: number;
  prereqs: string[];
}

export interface Track {
  id: string;
  name_ar: string;
  courses: Record<string, SpecializationCourse>;
}

export interface Specialization {
  name_ar: string;
  prereqs_from_core: string[];
  tracks: Record<string, Track>;
}

export type CourseState = 'locked' | 'available' | 'passed';
