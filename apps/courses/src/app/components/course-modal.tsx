import { X, FileText, Video, Link as LinkIcon, Code, Presentation, Search, Filter, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { useCourseResources, type Resource } from '../../hooks/useCourseResources';
import type { Course } from '../../hooks/useCourses';

type CourseModalProps = {
  course: Course;
  onClose: () => void;
};

const resourceTypeIcons: Record<string, typeof FileText> = {
  'PDF': FileText,
  'فيديو': Video,
  'رابط': LinkIcon,
  'كود': Code,
  'شرائح': Presentation,
};

const resourceTypeColors: Record<string, string> = {
  'PDF': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'فيديو': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'رابط': 'bg-green-500/20 text-green-300 border-green-500/30',
  'كود': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'شرائح': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export function CourseModal({ course, onClose }: CourseModalProps) {
  const { resources, loading, error } = useCourseResources(course.code);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('الكل');

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'الكل' || resource.resource_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const resourceTypes = ['الكل', ...new Set(resources.map((r) => r.resource_type))];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-900/95 backdrop-blur-2xl border-white/10 text-white rounded-2xl p-0 overflow-hidden max-h-[85vh]" dir="rtl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-b border-white/10 p-6">
          <button
            onClick={onClose}
            className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
            aria-label="إغلاق"
          >
            <X size={24} aria-hidden="true" />
          </button>

          <div className="pr-8">
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {course.code}
              </Badge>
              <h2 className="text-2xl text-white">{course.name_ar ?? course.name}</h2>
            </div>
            <p className="text-slate-400 text-sm">{course.major}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="flex flex-col" dir="rtl">
          <TabsList className="w-full bg-slate-800/30 border-b border-white/10 rounded-none px-6 pt-4 justify-start gap-2">
            <TabsTrigger
              value="info"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg px-6 py-3"
            >
              معلومات المادة
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg px-6 py-3"
            >
              موارد الطلاب
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1">
            <TabsContent value="info" className="p-6 m-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg text-blue-300 mb-3">وصف المادة</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {course.description ?? 'لا يوجد وصف متاح لهذه المادة.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-sm mb-1">رمز المقرر</p>
                    <p className="text-white">{course.code}</p>
                  </div>
                  <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-sm mb-1">التخصص</p>
                    <p className="text-white">{course.major}</p>
                  </div>
                  <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-sm mb-1">الاسم بالإنجليزية</p>
                    <p className="text-white">{course.name}</p>
                  </div>
                  <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-sm mb-1">عدد الموارد</p>
                    <p className="text-blue-300 text-xl">
                      {loading ? '...' : resources.length}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="p-6 m-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <span className="mr-3 text-slate-400">جارٍ تحميل الموارد...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-2">حدث خطأ في تحميل الموارد</p>
                  <p className="text-slate-500 text-sm">{error}</p>
                </div>
              ) : (
                <>
                  {/* Search and Filter */}
                  <div className="mb-6 space-y-4">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />
                      <input
                        type="text"
                        placeholder="ابحث في الموارد..."
                        aria-label="البحث في الموارد"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl pr-12 pl-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter size={16} className="text-slate-400" />
                      <span className="text-slate-400 text-sm">التصفية:</span>
                      {resourceTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            filterType === type
                              ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                              : 'bg-slate-800/30 text-slate-400 border border-white/10 hover:bg-slate-800/50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resources list */}
                  <div className="space-y-3">
                    {filteredResources.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        {resources.length === 0
                          ? 'لا توجد موارد مضافة لهذه المادة بعد'
                          : 'لا توجد موارد متطابقة مع البحث'}
                      </div>
                    ) : (
                      filteredResources.map((resource) => (
                        <ResourceItem key={resource.id} resource={resource} />
                      ))
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ResourceItem({ resource }: { resource: Resource }) {
  const Icon = resourceTypeIcons[resource.resource_type] ?? LinkIcon;
  const colorClass = resourceTypeColors[resource.resource_type] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30';

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon size={24} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white mb-2 group-hover:text-blue-300 transition-colors">
            {resource.title}
          </h4>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <Badge className={`${colorClass} text-xs`}>
              {resource.resource_type}
            </Badge>
            {resource.description && (
              <span className="truncate">{resource.description}</span>
            )}
            <span>•</span>
            <span>{resource.uploader_name}</span>
          </div>
        </div>

        {/* Resource link indicator */}
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 opacity-0 group-hover:opacity-100 transition-all">
          <LinkIcon size={20} aria-hidden="true" />
        </div>
      </div>
    </a>
  );
}
