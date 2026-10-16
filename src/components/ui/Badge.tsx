import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'golden' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  dot = false,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-purple-50 text-purple-700 border-purple-200/80 font-medium',
    golden: 'bg-amber-50 text-amber-900 border-amber-200/80 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-primary animate-pulse',
    golden: 'bg-golden',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500 animate-ping',
    info: 'bg-blue-500',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
