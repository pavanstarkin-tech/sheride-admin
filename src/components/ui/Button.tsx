import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'golden' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-primary hover:bg-primary-600 text-white shadow-sm hover:shadow-md shadow-purple-500/25 focus:ring-primary-400 font-semibold',
    golden: 'bg-golden hover:bg-golden-600 text-[#180D2B] shadow-sm hover:shadow-md shadow-amber-500/25 focus:ring-golden-400 font-bold',
    secondary: 'bg-purple-50/80 hover:bg-purple-100/90 text-purple-950 font-medium focus:ring-purple-300 border border-purple-100',
    outline: 'border border-purple-200/80 bg-white hover:bg-purple-50/50 text-slate-800 hover:border-primary/50 focus:ring-primary-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-400',
    ghost: 'hover:bg-purple-50/60 text-slate-700 hover:text-primary focus:ring-purple-300',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 focus:ring-emerald-400',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2 rounded-xl',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
