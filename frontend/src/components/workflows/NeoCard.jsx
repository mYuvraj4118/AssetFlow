import React from 'react';

export default function NeoCard({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-slate-100 rounded-2xl p-6 shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.9)] dark:bg-slate-800 dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.05)] border border-slate-200/50 dark:border-slate-700/50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
