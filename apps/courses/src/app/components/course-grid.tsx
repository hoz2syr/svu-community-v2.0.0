import { Badge } from './ui/badge';
import type { Course } from '../../hooks/useCourses';

type CourseGridProps = {
  courses: Course[];
  onCourseClick: (course: Course) => void;
};

export function CourseGrid({ courses, onCourseClick }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <button
          key={course.id}
          onClick={() => onCourseClick(course)}
          className="group relative overflow-hidden rounded-2xl bg-slate-800/30 backdrop-blur-xl border border-white/10 p-6 text-right hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20"
        >
          {/* Glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative">
            {/* Course code badge */}
            <div className="mb-4">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 text-sm px-3 py-1">
                {course.code}
              </Badge>
            </div>

            {/* Course name */}
            <h3 className="text-xl text-white mb-3 group-hover:text-blue-300 transition-colors">
              {course.name_ar ?? course.name}
            </h3>

            {/* Major badge */}
            <div className="mb-4">
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
              >
                {course.major}
              </Badge>
            </div>

            {/* Course info */}
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">الاسم:</span>
                <span>{course.name}</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
