import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer({ dark = false }) {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="font-bold text-white font-heading">Aqad<span className="text-teal-400">Chain</span></span>
            </div>
            <p className="text-sm leading-relaxed">{t('footer.tagline')}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">{t('nav.howItWorks')}</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">{t('nav.pricing')}</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">{t('nav.faq')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">{t('nav.about')}</Link></li>
              <li><a href="mailto:support@aqadchain.com" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            <strong className="text-gray-400">{t('footer.disclaimerLabel')}</strong> {t('footer.disclaimer')}
          </p>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} AqadChain. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
