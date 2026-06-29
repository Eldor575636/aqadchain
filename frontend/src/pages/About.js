import { useTranslation } from 'react-i18next';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1">
        <section className="bg-white py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold font-heading text-gray-900 mb-4">{t('about.title')}</h1>
            <p className="text-xl text-gray-500 mb-10">{t('about.subtitle')}</p>

            <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
              <h2 className="text-2xl font-bold font-heading text-gray-900">{t('about.missionTitle')}</h2>
              <p>{t('about.mission1')}</p>
              <p>{t('about.mission2')}</p>

              <h2 className="text-2xl font-bold font-heading text-gray-900 mt-8">{t('about.approachTitle')}</h2>
              <p>{t('about.approach1')}</p>
              <p>{t('about.approach2')}</p>

              <h2 className="text-2xl font-bold font-heading text-gray-900 mt-8">{t('about.advisorTitle')}</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-card p-6">
                <p className="text-gray-500 text-sm italic">{t('about.advisorBody')}</p>
              </div>

              <h2 className="text-2xl font-bold font-heading text-gray-900 mt-8">{t('about.bayAreaTitle')}</h2>
              <p>{t('about.bayAreaBody')}</p>

              <h2 className="text-2xl font-bold font-heading text-gray-900 mt-8">{t('about.contactTitle')}</h2>
              <p>{t('about.contactBody')} <a href="mailto:hello@aqadchain.com" className="text-teal-600 hover:underline">hello@aqadchain.com</a></p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
