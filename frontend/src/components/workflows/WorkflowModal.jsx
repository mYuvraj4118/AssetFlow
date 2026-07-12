import React from 'react';

export default function WorkflowModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className={`relative w-full max-w-lg bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200/60 dark:border-slate-700/60 transition-all transform duration-300 ${className}`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="py-4 text-slate-700 dark:text-slate-350">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
