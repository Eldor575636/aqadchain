import Button from '../../components/Button';

export default function StepType({ formData, updateForm, goToStep }) {
  const select = (type) => {
    updateForm({ contract_type: type });
    goToStep(2);
  };

  const types = [
    {
      key: 'MURABAHA',
      title: 'Murabaha',
      subtitle: 'Cost-Plus Financing',
      badge: 'Most Common',
      badgeColor: '#0D6E63',
      description: 'The seller discloses their purchase cost to the buyer. Both parties agree on a fixed markup above that cost. The most transparent Shariah-compliant structure.',
      details: ['Seller cost disclosed', 'Agreed markup % on cost', 'Fixed installment payments', 'No hidden charges'],
    },
    {
      key: 'MUSAWAMA',
      title: 'Musawama',
      subtitle: 'Negotiated Price Sale',
      badge: null,
      badgeColor: null,
      description: 'Both parties negotiate and agree on a final selling price. The seller is not required to disclose their actual cost. Equally Shariah-compliant — cost transparency is optional.',
      details: ['No cost disclosure required', 'Negotiated selling price', 'Fixed installment payments', 'More privacy for seller'],
    },
    {
      key: 'IJARAH',
      title: 'Ijarah',
      subtitle: 'Islamic Lease',
      badge: 'Lease',
      badgeColor: '#1D4ED8',
      description: 'The lessor owns the vehicle and leases it to the lessee for a fixed rental period. Rental payments (Ujrah) cover the right to use the vehicle only. Optionally ends with ownership transfer (IMIT).',
      details: ['Lessor retains ownership', 'Periodic rental payments (Ujrah)', 'Optional buy-out at end (IMIT)', 'AAOIFI Standard No. 9'],
    },
  ];

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-5 mb-6">
        {types.map((t) => {
          const isSelected = formData.contract_type === t.key;
          const accentColor = t.badgeColor || '#6B7280';
          return (
            <button
              key={t.key}
              onClick={() => select(t.key)}
              className={`text-left border-2 rounded-card p-6 transition-all hover:shadow-md focus:outline-none ${isSelected ? 'bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              style={isSelected ? { borderColor: accentColor, background: `${accentColor}08` } : {}}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold font-heading text-gray-900">{t.title}</h3>
                    {t.badge && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${t.badgeColor}18`, color: t.badgeColor }}>
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium" style={{ color: accentColor }}>{t.subtitle}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5`}
                  style={isSelected ? { borderColor: accentColor, background: accentColor } : { borderColor: '#D1D5DB' }}>
                  {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.description}</p>
              <ul className="space-y-1.5">
                {t.details.map((d) => (
                  <li key={d} className="flex items-center text-sm text-gray-700">
                    <span className="mr-2 font-bold" style={{ color: accentColor }}>✓</span>{d}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 text-center">All three structures are Shariah-compliant per AAOIFI standards. Choose the one that best fits your transaction.</p>
    </div>
  );
}
