const variants = {
  info: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', icon: 'ℹ️' },
  success: { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-800', icon: '✓' },
  warning: { border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-800', icon: '⚠' },
  error: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-800', icon: '✕' },
};

export default function Alert({ variant = 'info', title, children, className = '' }) {
  const v = variants[variant];
  return (
    <div className={`border-l-4 ${v.border} ${v.bg} p-4 rounded-r-card ${className}`}>
      {title && <p className={`font-semibold text-sm ${v.text} mb-1`}>{title}</p>}
      <p className={`text-sm ${v.text}`}>{children}</p>
    </div>
  );
}
