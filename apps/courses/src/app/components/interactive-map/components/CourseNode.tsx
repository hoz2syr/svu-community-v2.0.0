import { Handle, Position } from '@xyflow/react';
import { Course, SpecializationCourse, CourseState } from '../types';
import { BookOpen, CheckCircle, Lock, Unlock } from 'lucide-react';

interface CourseNodeProps {
  data: {
    course: Course | SpecializationCourse;
    state: CourseState;
    isSelected: boolean;
    isPrereq: boolean;
    isSuccessor: boolean;
    isDimmed: boolean;
    simulatorMode: boolean;
    onClick: (code: string) => void;
  };
}

export function CourseNode({ data }: CourseNodeProps) {
  const { course, state, isSelected, isPrereq, isSuccessor, isDimmed, simulatorMode, onClick } = data;

  let bgColor = 'bg-white';
  let borderColor = 'border-gray-200';
  let textColor = 'text-gray-900';
  let icon = <BookOpen className="w-4 h-4 text-gray-400" />;

  if (simulatorMode) {
    if (state === 'passed') {
      bgColor = 'bg-green-50';
      borderColor = 'border-green-500';
      textColor = 'text-green-900';
      icon = <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (state === 'available') {
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-400';
      textColor = 'text-blue-900';
      icon = <Unlock className="w-4 h-4 text-blue-500" />;
    } else {
      bgColor = 'bg-gray-50';
      borderColor = 'border-gray-300';
      textColor = 'text-gray-500';
      icon = <Lock className="w-4 h-4 text-gray-400" />;
    }
  } else {
    if ('type' in course) {
      switch (course.type) {
        case 'core': bgColor = 'bg-blue-50'; borderColor = 'border-blue-200'; break;
        case 'general': bgColor = 'bg-emerald-50'; borderColor = 'border-emerald-200'; break;
        case 'english': bgColor = 'bg-purple-50'; borderColor = 'border-purple-200'; break;
        case 'project': bgColor = 'bg-orange-50'; borderColor = 'border-orange-200'; break;
      }
    } else {
      bgColor = 'bg-indigo-50'; borderColor = 'border-indigo-200';
    }
  }

  let transform = '';
  let zIndex = '';

  if (isSelected) {
    borderColor = 'border-indigo-600 ring-4 ring-indigo-200';
    bgColor = 'bg-indigo-50';
    textColor = 'text-indigo-900';
    transform = 'scale-105';
    zIndex = 'z-20';
  } else if (isPrereq) {
    borderColor = 'border-yellow-500 ring-4 ring-yellow-200';
    bgColor = 'bg-yellow-50';
    textColor = 'text-yellow-900';
    transform = 'scale-105';
    zIndex = 'z-10';
  } else if (isSuccessor) {
    borderColor = 'border-cyan-500 ring-4 ring-cyan-200';
    bgColor = 'bg-cyan-50';
    textColor = 'text-cyan-900';
    transform = 'scale-105';
    zIndex = 'z-10';
  }

  const opacity = isDimmed ? 'opacity-30 grayscale' : 'opacity-100';

  return (
    <div 
      className={`relative w-48 rounded-xl border-2 p-3 shadow-sm transition-all duration-300 cursor-pointer ${bgColor} ${borderColor} ${opacity} ${transform} ${zIndex}`}
      onClick={() => onClick(course.code)}
      dir="rtl"
    >
      <Handle type="target" position={Position.Right} className="w-2 h-2 !bg-gray-400 !border-white" />
      
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-bold px-2 py-1 rounded-md bg-white/60 ${textColor}`}>
          {course.code}
        </span>
        {icon}
      </div>
      
      <h3 className={`font-bold text-sm leading-tight mb-2 ${textColor}`}>
        {course.name_ar}
      </h3>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
        <span>{course.credits} ساعات</span>
        {'year' in course && <span>سنة {course.year}</span>}
      </div>

      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-gray-400 !border-white" />
    </div>
  );
}
