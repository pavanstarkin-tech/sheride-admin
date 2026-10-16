import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LoadingSpinner: React.FC<{ message?: string; className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  message = 'Loading live data...',
  className,
  size = 'md',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <Loader2 className={cn('text-primary animate-spin mb-3', sizes[size])} />
      {message && <p className="text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-purple-100/80 rounded-2xl bg-white/70', className)}>
      {icon && <div className="p-3 bg-purple-50 text-primary border border-purple-100/80 rounded-2xl mb-4 shadow-sm">{icon}</div>}
      <h4 className="text-base font-semibold text-slate-800 font-heading">{title}</h4>
      {description && <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
