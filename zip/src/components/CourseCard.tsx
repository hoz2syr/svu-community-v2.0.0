import React from 'react';
import { Course, SpecializationCourse, CourseState } from '../types';
import { CheckCircle, Lock, Unlock } from 'lucide-react';

interface CourseCardProps {
  course: Course | SpecializationCourse;
  state?: CourseState;
  isSelected: boolean;
  isPrereq: boolean;
  isSuccessor: boolean;
  isDimmed: boolean;
  onClick: () => void;
  simulatorMode: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  state = 'locked',
  isSelected,
  isPrereq,
  isSuccessor,
  isDimmed,
  onClick,
  simulatorMode,
}) => {
  const isCore = 'year' in course;
  const type = isCore ? (course as Course).type : 'specialization';

  let baseColor = 'bg-gray-100 border-gray-300 text-gray-800';
  if (type === 'core') baseColor = 'bg-green-50 border-green-400 text-green-900';
  if (type === 'general') baseColor = 'bg-blue-50 border-blue-400 text-blue-900';
  if (type === 'english') baseColor = 'bg-purple-50 border-purple-400 text-purple-900';
  if (type === 'project') baseColor = 'bg-orange-50 border-orange-400 text-orange-900';
  if (type === 'specialization') baseColor = 'bg-indigo-50 border-indigo-400 text-indigo-900';

  let highlightClass = '';
  if (isSelected) highlightClass = 'ring-4 ring-blue-500 shadow-lg scale-105 z-10';
  else if (isPrereq) highlightClass = 'ring-4 ring-yellow-400 shadow-md z-10';
  else if (isSuccessor) highlightClass = 'ring-4 ring-cyan-400 shadow-md z-10';

  const opacityClass = isDimmed ? 'opacity-40 grayscale-[50%]' : 'opacity-100';

  let stateIcon = null;
  if (simulatorMode) {
    if (state === 'passed') stateIcon = <CheckCircle className="w-5 h-5 text-green-600" />;
    else if (state === 'available') stateIcon = <Unlock className="w-5 h-5 text-blue-500" />;
    else stateIcon = <Lock className="w-5 h-5 text-gray-400" />;
  }

  return (
    <div
      onClick={onClick}
      className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between h-28
        ${baseColor} ${highlightClass} ${opacityClass}
        hover:shadow-md hover:-translate-y-1
      `}
    >
      <div className="flex justify-between items-start">
        <span className="font-bold text-sm tracking-wider">{course.code}</span>
        {stateIcon}
      </div>
      <div className="text-sm font-semibold leading-tight mt-1 flex-grow overflow-hidden text-ellipsis">
        {course.name_ar}
      </div>
      <div className="flex justify-between items-end mt-2 text-xs font-medium opacity-80">
        <span>{course.credits} س.م</span>
        {isCore && <span>سنة {(course as Course).year}</span>}
      </div>
    </div>
  );
};
