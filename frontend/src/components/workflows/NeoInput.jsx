import React from 'react';

export default function NeoInput({
  label,
  error,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={id}
          className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-all duration-200 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-100 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
          }`}
          rows={3}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-all duration-200 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-100 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
          }`}
          {...props}
        />
      )}
      {error && (
        <span className="text-xs text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
}
