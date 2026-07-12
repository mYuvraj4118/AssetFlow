export default function StatusBadge({
  status,
  className = '',
}) {
  const statusStyles = {
    active:
      'bg-emerald-100 text-emerald-700 border-emerald-200',
    'return requested':
      'bg-amber-100 text-amber-700 border-amber-200',
    returned:
      'bg-violet-100 text-violet-700 border-violet-200',

    pending:
      'bg-amber-100 text-amber-700 border-amber-200',
    approved:
      'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected:
      'bg-red-100 text-red-700 border-red-200',
    completed:
      'bg-sky-100 text-sky-700 border-sky-200',

    upcoming:
      'bg-indigo-100 text-indigo-700 border-indigo-200',
    ongoing:
      'bg-purple-100 text-purple-700 border-purple-200',
    cancelled:
      'bg-slate-200 text-slate-600 border-slate-300',

    'technician assigned':
      'bg-cyan-100 text-cyan-700 border-cyan-200',
    'in progress':
      'bg-purple-100 text-purple-700 border-purple-200',
    resolved:
      'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  const normalizedStatus = String(
    status || ''
  ).toLowerCase()

  const currentStyle =
    statusStyles[normalizedStatus] ||
    'bg-slate-200 text-slate-700 border-slate-300'

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full border
        px-3 py-1
        text-xs font-semibold
        ${currentStyle}
        ${className}
      `}
    >
      {status}
    </span>
  )
}
