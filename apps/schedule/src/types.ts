export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  major?: string;
  photoURL?: string;
  createdAt: string;
}

export interface Course {
  code: string;
  name: string;
  section?: string;
  instructor?: string;
  time?: string;
}

export interface StudyGroup {
  id: string;
  courseCode: string;
  courseName: string;
  name: string;
  description?: string;
  creatorId: string;
  members: string[];
  createdAt: string;
}

export interface ExtractionResult {
  major: string;
  courses: Course[];
}
