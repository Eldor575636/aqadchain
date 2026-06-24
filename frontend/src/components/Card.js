export default function Card({ children, header, footer, className = '', padding = true }) {
  return (
    <div className={`card ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-100">
          {typeof header === 'string'
            ? <h3 className="text-base font-semibold text-gray-900 font-heading">{header}</h3>
            : header}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-card">{footer}</div>}
    </div>
  );
}
