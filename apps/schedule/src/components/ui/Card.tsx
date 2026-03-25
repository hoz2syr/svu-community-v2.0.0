import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden', className)}>
      {children}
    </div>
  );
}
