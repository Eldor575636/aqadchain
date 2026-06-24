import { useAuth0 } from '@auth0/auth0-react';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Accordion from '../components/Accordion';

const faqItems = [
  { question: 'Is there a free trial?', answer: 'You can create an account and start a contract for free. A subscription is required to send contracts for signature.' },
  { question: 'Can I cancel anytime?', answer: 'Yes. Cancel your subscription anytime from your account settings. You will retain access until the end of the billing period.' },
  { question: 'Are there per-contract fees?', answer: 'No — your subscription covers unlimited access for your plan tier. No surprise fees per document.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit and debit cards via Stripe. ACH bank transfers are available on request for Business plans.' },
];

export default function Pricing() {
  const { loginWithRedirect } = useAuth0();

  const plans = [
    {
      name: 'Individual', price: '$9.99', period: '/month',
      description: 'For individual buyers and sellers doing occasional Halal financing deals.',
      features: [
        { text: 'Up to 5 active contracts', available: true },
        { text: 'Murabaha & Musawama contracts', available: true },
        { text: 'DocuSign e-signatures', available: true },
        { text: 'PDF download of signed contract', available: true },
        { text: 'Email notifications', available: true },
        { text: 'VIN lookup & decode', available: true },
        { text: 'NHTSA recall check', available: true },
        { text: 'Admin dashboard', available: false },
        { text: 'Team members', available: false },
        { text: 'Priority support', available: false },
      ],
      highlight: false,
    },
    {
      name: 'Business', price: '$49', period: '/month',
      description: 'For dealerships, brokers, and high-volume sellers.',
      features: [
        { text: 'Unlimited active contracts', available: true },
        { text: 'Murabaha & Musawama contracts', available: true },
        { text: 'DocuSign e-signatures', available: true },
        { text: 'PDF download of signed contract', available: true },
        { text: 'Email notifications', available: true },
        { text: 'VIN lookup & decode', available: true },
        { text: 'NHTSA recall check', available: true },
        { text: 'Admin dashboard', available: true },
        { text: 'Team members (coming soon)', available: true },
        { text: 'Priority support', available: true },
      ],
      highlight: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1 bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold font-heading text-gray-900 mb-4">Transparent pricing</h1>
            <p className="text-gray-500 text-lg">No per-contract fees. No surprises. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
            {plans.map((plan) => (
              <div key={plan.name} className={`bg-white rounded-card p-8 border-2 ${plan.highlight ? 'border-teal-500 shadow-md' : 'border-gray-200'}`}>
                {plan.highlight && (
                  <div className="inline-block bg-teal-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">Most Popular</div>
                )}
                <h2 className="text-2xl font-bold font-heading text-gray-900">{plan.name}</h2>
                <p className="text-gray-500 text-sm mt-1 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold font-heading text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <button onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })} className={`w-full mb-8 ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                  Get started
                </button>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`flex items-center text-sm ${f.available ? 'text-gray-700' : 'text-gray-400'}`}>
                      {f.available
                        ? <svg className="w-4 h-4 text-teal-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-4 h-4 text-gray-300 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      }
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold font-heading text-gray-900 text-center mb-8">Pricing FAQ</h2>
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
