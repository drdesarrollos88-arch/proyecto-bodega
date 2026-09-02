import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-900 border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-calibri-normal font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

