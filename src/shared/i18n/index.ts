import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

const storedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem('tabel:locale') : undefined;

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: storedLocale ?? 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('tabel:locale', lng);
  }
});

export default i18n;
