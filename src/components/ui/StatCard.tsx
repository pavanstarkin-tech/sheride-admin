import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
  badge?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  trend,
  icon,
  iconBg = 'bg-purple-50 text-primary',
  className,
  badge,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition-all duration-200 hover:shadow-card-hover hover:border-slate-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </div>
        {badge}
      </div>

      {(trend || subtext) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md',
                trend.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
          {subtext && <span className="text-slate-500">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
