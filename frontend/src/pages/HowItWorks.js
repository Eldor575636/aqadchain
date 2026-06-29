import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation, Trans } from 'react-i18next';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function HowItWorks() {
  const { t } = useTranslation();
  const { loginWithRedirect } = useAuth0();
  const steps = t('howItWorks.steps', { returnObjects: true });

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1">

        {/* Hero */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold font-heading text-gray-900 mb-4">{t('howItWorks.heroTitle')}</h1>
            <p className="text-gray-500 text-lg">{t('howItWorks.heroSubtitle')}</p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-12">
            {steps.map((step, i) => {
              const num = String(i + 1).padStart(2, '0');
              return (
                <div key={num} className="flex gap-6">
                  <div className="text-5xl font-extrabold text-teal-100 font-heading leading-none flex-shrink-0 w-16">{num}</div>
                  <div className="pt-1">
                    <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contract types explained */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-10 text-center">{t('howItWorks.typesTitle')}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-teal-200 rounded-card p-6 bg-teal-50">
                <h3 className="text-xl font-bold font-heading text-teal-800 mb-3">{t('howItWorks.murabahaTitle')}</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{t('howItWorks.murabahaBody1')}</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  <Trans i18nKey="howItWorks.murabahaExample" components={[<strong key="0" />]} />
                </p>
              </div>
              <div className="border border-gold-200 rounded-card p-6 bg-gold-50">
                <h3 className="text-xl font-bold font-heading text-gray-800 mb-3">{t('howItWorks.musawamaTitle')}</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{t('howItWorks.musawamaBody1')}</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  <Trans i18nKey="howItWorks.musawamaExample" components={[<strong key="0" />]} />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Late fee mechanic */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-6 text-center">{t('howItWorks.lateFeeTitle')}</h2>
            <div className="bg-white rounded-card border border-gray-200 p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                <Trans i18nKey="howItWorks.lateFeeBody1" components={[<strong key="0" />]} />
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <Trans i18nKey="howItWorks.lateFeeBody2" components={[<strong key="0" />]} />
              </p>
              <p className="text-gray-700 leading-relaxed">{t('howItWorks.lateFeeBody3')}</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-12 px-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong>{t('howItWorks.disclaimerLabel')}</strong> {t('howItWorks.disclaimer')}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-teal-600">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold font-heading mb-4">{t('howItWorks.ctaTitle')}</h2>
            <p className="text-teal-100 mb-8">{t('howItWorks.ctaSubtitle')}</p>
            <button onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })} className="bg-white text-teal-700 font-bold px-8 py-3 rounded-btn hover:bg-teal-50 transition-colors">
              {t('howItWorks.ctaButton')}
            </button>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
