import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Accordion from '../components/Accordion';

export default function Pricing() {
  const { t } = useTranslation();
  const { loginWithRedirect } = useAuth0();

  const faqItems = t('pricing.faq', { returnObjects: true });

  const plans = [
    {
      key: 'individual', price: '$9.99', period: '/month',
      featureAvailability: [true, true, true, true, true, true, true, false, false, false],
      highlight: false,
    },
    {
      key: 'business', price: '$49', period: '/month',
      featureAvailability: [true, true, true, true, true, true, true, true, true, true],
      highlight: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1 bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold font-heading text-gray-900 mb-4">{t('pricing.title')}</h1>
            <p className="text-gray-500 text-lg">{t('pricing.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
            {plans.map((plan) => {
              const name = t(`pricing.plans.${plan.key}.name`);
              const description = t(`pricing.plans.${plan.key}.description`);
              const features = t(`pricing.plans.${plan.key}.features`, { returnObjects: true });
              return (
                <div key={plan.key} className={`bg-white rounded-card p-8 border-2 ${plan.highlight ? 'border-teal-500 shadow-md' : 'border-gray-200'}`}>
                  {plan.highlight && (
                    <div className="inline-block bg-teal-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">{t('pricing.mostPopular')}</div>
                  )}
                  <h2 className="text-2xl font-bold font-heading text-gray-900">{name}</h2>
                  <p className="text-gray-500 text-sm mt-1 mb-4">{description}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold font-heading text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <button onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })} className={`w-full mb-8 ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                    {t('pricing.getStarted')}
                  </button>
                  <ul className="space-y-3">
                    {features.map((text, i) => {
                      const available = plan.featureAvailability[i];
                      return (
                        <li key={text} className={`flex items-center text-sm ${available ? 'text-gray-700' : 'text-gray-400'}`}>
                          {available
                            ? <svg className="w-4 h-4 text-teal-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            : <svg className="w-4 h-4 text-gray-300 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          }
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold font-heading text-gray-900 text-center mb-8">{t('pricing.faqTitle')}</h2>
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
