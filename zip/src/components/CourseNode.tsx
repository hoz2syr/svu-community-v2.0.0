import { Handle, Position } from '@xyflow/react';
import { Course, SpecializationCourse, CourseState } from '../types';
import { BookOpen, CheckCircle, Lock, Unlock, Sparkles } from 'lucide-react';

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

  // Dark theme colors based on course type
  let bgColor = 'rgba(30, 41, 59, 0.6)';
  let borderColor = 'rgba(148, 163, 184, 0.2)';
  let accentColor = '#94a3b8';
  let textColor = '#e2e8f0';
  let codeBg = 'rgba(148, 163, 184, 0.15)';
  let icon = <BookOpen className="w-4 h-4 text-slate-400" />;
  let glowColor = 'transparent';

  if (simulatorMode) {
    if (state === 'passed') {
      bgColor = 'rgba(16, 185, 129, 0.12)';
      borderColor = 'rgba(16, 185, 129, 0.5)';
      accentColor = '#10b981';
      textColor = '#6ee7b7';
      codeBg = 'rgba(16, 185, 129, 0.2)';
      icon = <CheckCircle className="w-4 h-4 text-emerald-400" />;
      glowColor = 'rgba(16, 185, 129, 0.15)';
    } else if (state === 'available') {
      bgColor = 'rgba(59, 130, 246, 0.12)';
      borderColor = 'rgba(59, 130, 246, 0.5)';
      accentColor = '#3b82f6';
      textColor = '#93c5fd';
      codeBg = 'rgba(59, 130, 246, 0.2)';
      icon = <Unlock className="w-4 h-4 text-blue-400" />;
      glowColor = 'rgba(59, 130, 246, 0.15)';
    } else {
      bgColor = 'rgba(30, 41, 59, 0.4)';
      borderColor = 'rgba(71, 85, 105, 0.3)';
      accentColor = '#475569';
      textColor = '#64748b';
      codeBg = 'rgba(71, 85, 105, 0.15)';
      icon = <Lock className="w-4 h-4 text-slate-500" />;
    }
  } else {
    if ('type' in course) {
      switch (course.type) {
        case 'core':
          bgColor = 'rgba(59, 130, 246, 0.1)';
          borderColor = 'rgba(59, 130, 246, 0.35)';
          accentColor = '#3b82f6';
          textColor = '#93c5fd';
          codeBg = 'rgba(59, 130, 246, 0.2)';
          glowColor = 'rgba(59, 130, 246, 0.1)';
          break;
        case 'general':
          bgColor = 'rgba(16, 185, 129, 0.1)';
          borderColor = 'rgba(16, 185, 129, 0.35)';
          accentColor = '#10b981';
          textColor = '#6ee7b7';
          codeBg = 'rgba(16, 185, 129, 0.2)';
          glowColor = 'rgba(16, 185, 129, 0.1)';
          break;
        case 'english':
          bgColor = 'rgba(168, 85, 247, 0.1)';
          borderColor = 'rgba(168, 85, 247, 0.35)';
          accentColor = '#a855f7';
          textColor = '#d8b4fe';
          codeBg = 'rgba(168, 85, 247, 0.2)';
          glowColor = 'rgba(168, 85, 247, 0.1)';
          break;
        case 'project':
          bgColor = 'rgba(249, 115, 22, 0.1)';
          borderColor = 'rgba(249, 115, 22, 0.35)';
          accentColor = '#f97316';
          textColor = '#fdba74';
          codeBg = 'rgba(249, 115, 22, 0.2)';
          glowColor = 'rgba(249, 115, 22, 0.1)';
          break;
      }
    } else {
      bgColor = 'rgba(99, 102, 241, 0.1)';
      borderColor = 'rgba(99, 102, 241, 0.35)';
      accentColor = '#6366f1';
      textColor = '#a5b4fc';
      codeBg = 'rgba(99, 102, 241, 0.2)';
      icon = <Sparkles className="w-4 h-4 text-indigo-400" />;
      glowColor = 'rgba(99, 102, 241, 0.1)';
    }
  }

  // Highlight states
  if (isSelected) {
    borderColor = accentColor;
    glowColor = accentColor + '40';
  } else if (isPrereq) {
    borderColor = '#eab308';
    glowColor = 'rgba(234, 179, 8, 0.25)';
  } else if (isSuccessor) {
    borderColor = '#06b6d4';
    glowColor = 'rgba(6, 182, 212, 0.25)';
  }

  const opacity = isDimmed ? 'opacity-25' : 'opacity-100';
  const scale = (isSelected || isPrereq || isSuccessor) ? 'scale-105' : '';

  return (
    <div
      className={`relative w-[200px] rounded-2xl border p-4 cursor-pointer transition-all duration-300 ${opacity} ${scale}`}
      style={{
        background: bgColor,
        borderColor: borderColor,
        boxShadow: glowColor !== 'transparent' ? `0 0 20px ${glowColor}` : '0 4px 15px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={() => onClick(course.code)}
      dir="rtl"
    >
      <Handle
        type="target"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-slate-700 !bg-slate-400 !rounded-full transition-all hover:!bg-indigo-400"
      />

      <div className="flex items-start justify-between mb-3">
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-lg tracking-wide"
          style={{ background: codeBg, color: accentColor }}
        >
          {course.code}
        </span>
        <div className="p-1 rounded-lg" style={{ background: codeBg }}>
          {icon}
        </div>
      </div>

      <h3 className="font-bold text-[13px] leading-relaxed mb-3" style={{ color: textColor }}>
        {course.name_ar}
      </h3>

      <div className="flex items-center justify-between text-[11px]" style={{ color: accentColor, opacity: 0.8 }}>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {course.credits} ساعات
        </span>
        {'year' in course && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            سنة {course.year}
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-slate-700 !bg-slate-400 !rounded-full transition-all hover:!bg-indigo-400"
      />
    </div>
  );
}
