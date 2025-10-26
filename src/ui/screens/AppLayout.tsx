import { Outlet, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wifi, Users2, CalendarDays, FileChartColumn, Settings, MapPin, Timer, ListChecks } from 'lucide-react';
import { useEffect, useState } from 'react';

const tabs = [
  { to: '/', icon: Timer, labelKey: 'nav.today' },
  { to: '/employees', icon: Users2, labelKey: 'nav.employees' },
  { to: '/sites', icon: MapPin, labelKey: 'nav.sites' },
  { to: '/calendar', icon: CalendarDays, labelKey: 'nav.calendar' },
  { to: '/reports', icon: FileChartColumn, labelKey: 'nav.reports' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
  { to: '/queue', icon: ListChecks, labelKey: 'nav.queue' }
];

export const AppLayout = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Tabel</h1>
          <p className="text-xs text-slate-400">PWA · Offline-first</p>
        </div>
        <div className={`flex items-center gap-1 text-xs ${online ? 'text-emerald-400' : 'text-amber-400'}`}>
          <Wifi className={`h-4 w-4 ${online ? '' : 'rotate-45'}`} />
          {online ? t('common.online') : t('common.offline')}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-slate-900">
        <Outlet />
      </main>
      <nav className="sticky bottom-0 flex justify-between gap-1 border-t border-slate-800 bg-slate-950/80 px-1 py-2 backdrop-blur">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to || (tab.to !== '/' && location.pathname.startsWith(tab.to));
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] ${
                isActive ? 'bg-slate-800 text-sky-300' : 'text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-center leading-tight">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
