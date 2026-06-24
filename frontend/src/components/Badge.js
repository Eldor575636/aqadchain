const variants = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  default: 'bg-gray-100 text-gray-700',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

const statusMap = {
  DRAFT: { label: 'Draft', variant: 'default' },
  PENDING_SIGNATURE: { label: 'Pending Signature', variant: 'pending' },
  SIGNED: { label: 'Signed', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'error' },
};

export function ContractStatusBadge({ status }) {
  const { label, variant } = statusMap[status] || { label: status, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}
