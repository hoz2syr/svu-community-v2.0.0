import { useState } from 'react';
import { CourseGrid } from './components/course-grid';
import { MajorSelector } from './components/major-selector';
import { CourseModal } from './components/course-modal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useCourses, type Course } from '../hooks/useCourses';

const ALL_MAJORS = 'جميع التخصصات';

export type { Course };

export default function App() {
  const { courses, majors, loading, error } = useCourses();
  const [selectedMajor, setSelectedMajor] = useState(ALL_MAJORS);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = selectedMajor === ALL_MAJORS
    ? courses
    : courses.filter((course) => course.major === selectedMajor);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir="rtl">
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Main content */}
        <div className="relative">
          {/* Header */}
          <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl text-white mb-1">المواد الدراسية</h1>
                  <p className="text-slate-400">مجتمع طلاب الجامعة</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                </div>
              </div>
            </div>
          </header>

          {/* Major selector */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {loading ? (
              <div className="h-12 w-[280px] bg-slate-800/50 rounded-xl animate-pulse" />
            ) : (
              <MajorSelector
                majors={[ALL_MAJORS, ...majors]}
                selectedMajor={selectedMajor}
                onSelectMajor={setSelectedMajor}
              />
            )}
          </div>

          {/* Course grid */}
          <div className="max-w-7xl mx-auto px-6 pb-12">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-slate-800/30 border border-white/10 p-6 h-48 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 text-lg mb-2">حدث خطأ في تحميل المواد</p>
                <p className="text-slate-500 text-sm">{error}</p>
              </div>
            ) : (
              <CourseGrid courses={filteredCourses} onCourseClick={setSelectedCourse} />
            )}
          </div>
        </div>

        {/* Course modal */}
        {selectedCourse && (
          <CourseModal
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
