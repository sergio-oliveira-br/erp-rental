// frontend/src/components/ui/Badge.tsx

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray';
}

export function Badge({ children, variant = 'gray', className, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}