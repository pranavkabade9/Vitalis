import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ICONS } from '../constants';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof ICONS;
  action?: React.ReactNode;
}

export function Card({ children, className, title, subtitle, icon, action }: CardProps) {
  const Icon = icon ? ICONS[icon] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 card-shadow",
        className
      )}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-slate-800 dark:text-white leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function MetricCard({ 
  label, 
  value, 
  unit, 
  icon, 
  trend, 
  status = 'normal' 
}: { 
  label: string; 
  value: string | number; 
  unit?: string; 
  icon: keyof typeof ICONS;
  trend?: string;
  status?: 'normal' | 'warning' | 'critical'
}) {
  const Icon = ICONS[icon];
  
  const statusColors = {
    normal: 'text-brand-500 bg-brand-50 dark:bg-brand-500/10',
    warning: 'text-warning-500 bg-yellow-50 dark:bg-warning-500/10',
    critical: 'text-critical-500 bg-red-50 dark:bg-critical-500/10',
  };

  return (
    <Card className="hover:border-brand-500/50 transition-colors group cursor-default">
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", statusColors[status])}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>
            {unit && <span className="text-xs font-medium text-slate-400 capitalize">{unit}</span>}
          </div>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
          <ICONS.TrendingUp size={14} className="text-brand-500" />
          <span>{trend} vs last week</span>
        </div>
      )}
    </Card>
  );
}

export function ProgressRing({ value, size = 120, strokeWidth = 10, variant = 'excellent' }: { value: number, size?: number, strokeWidth?: number, variant?: 'excellent' | 'average' | 'poor' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colors = {
    excellent: 'stroke-brand-500',
    average: 'stroke-warning-500',
    poor: 'stroke-critical-500',
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          fill="transparent"
          strokeLinecap="round"
          className={cn("transition-all duration-500", colors[variant])}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-800 dark:text-white">{value}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
      </div>
    </div>
  );
}
