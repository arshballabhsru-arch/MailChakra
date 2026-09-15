import React from 'react';
import { Verdict } from '../types';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  size = 'md',
  showIcon = true
}) => {
  const config = {
    safe: {
      label: 'Safe',
      icon: ShieldCheck,
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
    },
    suspicious: {
      label: 'Suspicious',
      icon: AlertTriangle,
      classes: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
    },
    unsafe: {
      label: 'Unsafe',
      icon: ShieldAlert,
      classes: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
    }
  }[verdict];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 font-medium gap-1',
    md: 'text-sm px-3 py-1 font-semibold gap-1.5',
    lg: 'text-base px-4 py-1.5 font-bold gap-2'
  }[size];

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase shadow-xs transition-colors ${sizeClasses} ${config.classes}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      <span>{config.label}</span>
    </span>
  );
};
