import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 transition-all duration-200 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-slate-300',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
