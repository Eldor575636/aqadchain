import Button from './Button';

export default function EmptyState({ title, description, action, actionLabel }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto mb-5 w-20 h-20 text-gray-300">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="16" width="56" height="48" rx="6" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
          <rect x="22" y="28" width="22" height="3" rx="1.5" fill="#D1D5DB" />
          <rect x="22" y="36" width="36" height="3" rx="1.5" fill="#E5E7EB" />
          <rect x="22" y="44" width="30" height="3" rx="1.5" fill="#E5E7EB" />
          <circle cx="56" cy="56" r="14" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="2" />
          <path d="M51 56h10M56 51v10" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 font-heading mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">{description}</p>}
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
}
