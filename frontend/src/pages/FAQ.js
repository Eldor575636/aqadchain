import { useTranslation } from 'react-i18next';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Accordion from '../components/Accordion';

export default function FAQ() {
  const { t } = useTranslation();
  const sections = t('faq.sections', { returnObjects: true });

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1 py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold font-heading text-gray-900 mb-4">{t('faq.title')}</h1>
            <p className="text-gray-500">{t('faq.subtitle')}</p>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.category}>
                <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">{section.category}</h2>
                <Accordion items={section.items} />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">{t('faq.stillHaveQuestions')}</p>
            <a href="mailto:support@aqadchain.com" className="text-teal-600 font-semibold hover:underline text-sm">{t('faq.contactUs')}</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
