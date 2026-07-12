import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const statusStyles = {
    // Allocation Statuses
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-800/30",
    "return requested": "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-450 border border-amber-200/50 dark:border-amber-800/30",
    returned: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-450 border border-blue-200/50 dark:border-blue-800/30",

    // Transfer Statuses
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-450 border border-amber-200/50 dark:border-amber-800/30",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-800/30",
    rejected: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-450 border border-red-200/50 dark:border-red-800/30",
    completed: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-450 border border-sky-200/50 dark:border-sky-800/30",

    // Booking Statuses
    upcoming: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-455 border border-indigo-200/50 dark:border-indigo-800/30",
    ongoing: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-455 border border-purple-200/50 dark:border-purple-800/30",
    cancelled: "bg-slate-105 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/30",

    // Maintenance Statuses
    "technician assigned": "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-450 border border-cyan-200/50 dark:border-cyan-800/30",
    "in progress": "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-455 border border-purple-200/50 dark:border-purple-800/30",
    resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-455 border border-emerald-200/50 dark:border-emerald-800/30",
  };

  const normalizedStatus = (status || '').toLowerCase();
  const currentStyle = statusStyles[normalizedStatus] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide inline-flex items-center justify-center ${currentStyle} ${className}`}>
      {status}
    </span>
  );
}
