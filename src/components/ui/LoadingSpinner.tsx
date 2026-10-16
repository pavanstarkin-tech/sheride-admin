import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
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

export default LoadingSpinner;
