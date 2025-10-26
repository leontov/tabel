import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Lock, Moon, Sun } from 'lucide-react';

import { Card } from '../components/Card';

const SettingsScreen = () => {
  const { i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const changeLocale = (locale: 'ru' | 'en') => {
    i18n.changeLanguage(locale).catch(console.error);
  };

  return (
    <div className="space-y-4 p-4">
      <Card title="Локализация">
        <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{i18n.language.startsWith('ru') ? 'Русский' : 'English'}</span>
          </div>
          <div className="space-x-2 text-xs">
            <button
              className={`rounded-lg px-3 py-1 ${i18n.language.startsWith('ru') ? 'bg-sky-500 text-white' : 'bg-slate-700'}`}
              onClick={() => changeLocale('ru')}
            >
              RU
            </button>
            <button
              className={`rounded-lg px-3 py-1 ${!i18n.language.startsWith('ru') ? 'bg-sky-500 text-white' : 'bg-slate-700'}`}
              onClick={() => changeLocale('en')}
            >
              EN
            </button>
          </div>
        </div>
      </Card>

      <Card title="Темы">
        <button
          onClick={() => setDarkMode((value) => !value)}
          className="flex w-full items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3 text-sm"
        >
          <span className="flex items-center gap-2 text-slate-200">
            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {darkMode ? 'Тёмная тема' : 'Светлая тема'}
          </span>
          <span className="text-xs text-slate-400">Тапните для переключения</span>
        </button>
      </Card>

      <Card title="Безопасность">
        <div className="space-y-3 text-sm text-slate-200">
          <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              PIN-код
            </span>
            <span className="text-xs text-slate-400">Настроить позже</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsScreen;
