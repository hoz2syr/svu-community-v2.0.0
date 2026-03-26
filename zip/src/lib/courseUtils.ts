import { iteData } from '../data/ite_data';
import { Course, SpecializationCourse } from '../types';

export const getCourseDetails = (code: string): Course | SpecializationCourse | undefined => {
  if (iteData.courses[code as keyof typeof iteData.courses]) {
    return iteData.courses[code as keyof typeof iteData.courses] as Course;
  }
  
  for (const spec of Object.values(iteData.specialization_courses)) {
    for (const track of Object.values(spec.tracks)) {
      if (track.courses[code as keyof typeof track.courses]) {
        return track.courses[code as keyof typeof track.courses] as SpecializationCourse;
      }
    }
  }
  return undefined;
};

export const getDirectPrereqs = (code: string): string[] => {
  const course = getCourseDetails(code);
  return course?.prereqs || [];
};

export const getSuccessors = (code: string, specializationId: string | null = null): string[] => {
  const successors = new Set<string>();
  
  // Check core courses
  Object.values(iteData.courses).forEach(course => {
    const c = course as Course;
    if (c.prereqs.includes(code)) {
      successors.add(c.code);
    }
  });

  // Check specialization courses
  if (specializationId) {
    const spec = iteData.specialization_courses[specializationId as keyof typeof iteData.specialization_courses];
    if (spec) {
      Object.values(spec.tracks).forEach(track => {
        Object.values(track.courses).forEach(course => {
          const c = course as SpecializationCourse;
          if (c.prereqs.includes(code)) {
            successors.add(c.code);
          }
        });
      });
    }
  } else {
    Object.values(iteData.specialization_courses).forEach(spec => {
      Object.values(spec.tracks).forEach(track => {
        Object.values(track.courses).forEach(course => {
          const c = course as SpecializationCourse;
          if (c.prereqs.includes(code)) {
            successors.add(c.code);
          }
        });
      });
    });
  }

  return Array.from(successors);
};

export const calculateStudentStatus = (passedCourses: string[]) => {
  let totalCredits = 0;
  
  passedCourses.forEach(code => {
    const course = getCourseDetails(code);
    if (course) {
      totalCredits += course.credits;
    }
  });

  let currentYear = 1;
  for (const threshold of iteData.meta.rules.promotion_thresholds) {
    if (totalCredits >= threshold.min_credits) {
      currentYear = threshold.year;
    }
  }

  return { totalCredits, currentYear };
};

export const getAvailableCourses = (passedCourses: string[]): string[] => {
  const available: string[] = [];
  const passedSet = new Set(passedCourses);

  const checkCourse = (course: Course | SpecializationCourse) => {
    if (passedSet.has(course.code)) return false;

    // Check if all prereqs are met
    // Note: The rule says "يكفي تسجيل الأسبقية (حتى لو رسب الطالب فيها) لفتح المادة التالية، ما عدا الإنجليزي"
    // But in our simulator, "passed" means we took it. If we want to distinguish "registered" vs "passed",
    // we might need a more complex state. For simplicity, let's assume "passed" in the simulator means 
    // the prerequisite is satisfied.
    // Let's implement strict checking: all prereqs must be in passedSet.
    
    const prereqsMet = course.prereqs.every(prereqCode => {
      return passedSet.has(prereqCode);
    });

    return prereqsMet;
  };

  Object.values(iteData.courses).forEach(course => {
    const c = course as Course;
    if (checkCourse(c)) {
      available.push(c.code);
    }
  });

  Object.values(iteData.specialization_courses).forEach(spec => {
    Object.values(spec.tracks).forEach(track => {
      Object.values(track.courses).forEach(course => {
        const c = course as SpecializationCourse;
        if (checkCourse(c)) {
          available.push(c.code);
        }
      });
    });
  });

  return available;
};
