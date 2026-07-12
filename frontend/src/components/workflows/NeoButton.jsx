import React from 'react';

export default function NeoButton({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyle = "px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 text-white shadow-[4px_4px_10px_rgba(37,99,235,0.25),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:bg-blue-700 hover:shadow-lg dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3)]",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3)] dark:hover:bg-slate-700",
    danger: "bg-red-600 text-white shadow-[4px_4px_10px_rgba(220,38,38,0.25),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:bg-red-700 hover:shadow-lg dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3)]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
