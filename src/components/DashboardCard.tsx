
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  children?: React.ReactNode;
}

const DashboardCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  children,
}: DashboardCardProps) => {
  return (
    <div 
      className={cn(
        "rounded-xl border bg-card p-6 shadow-subtle transition-all duration-200 hover:shadow-elevation-1 animate-scale-in",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-semibold">{value}</p>
            {trend && (
              <span 
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  trend.positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}
              >
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-primary/10">
            {icon}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default DashboardCard;
