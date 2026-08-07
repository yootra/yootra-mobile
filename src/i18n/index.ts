import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import faTranslations from './locales/fa.json';

const savedLanguage = localStorage.getItem('yt_app_language') || 'fa';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      fa: { translation: faTranslations }
    },
    lng: savedLanguage,
    fallbackLng: 'fa',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
