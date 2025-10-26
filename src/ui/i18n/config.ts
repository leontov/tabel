import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        today: 'Today',
        employees: 'Employees',
        sites: 'Sites',
        calendar: 'Timesheet',
        reports: 'Reports',
        settings: 'Settings',
        queue: 'Queue'
      },
      actions: {
        addShift: 'Add shift',
        addEmployee: 'Add employee',
        addSite: 'Add site',
        generateReport: 'Generate report'
      },
      common: {
        offline: 'Offline',
        online: 'Online',
        loading: 'Loading...'
      }
    }
  },
  ru: {
    translation: {
      nav: {
        today: 'Сегодня',
        employees: 'Сотрудники',
        sites: 'Объекты',
        calendar: 'Табель',
        reports: 'Отчёты',
        settings: 'Ещё',
        queue: 'Очередь'
      },
      actions: {
        addShift: 'Добавить смену',
        addEmployee: 'Добавить сотрудника',
        addSite: 'Добавить объект',
        generateReport: 'Сформировать отчёт'
      },
      common: {
        offline: 'Оффлайн',
        online: 'Онлайн',
        loading: 'Загрузка...'
      }
    }
  }
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: navigator.language.startsWith('ru') ? 'ru' : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })
  .catch((error) => {
    console.error('i18n init failed', error);
  });

export default i18n;
