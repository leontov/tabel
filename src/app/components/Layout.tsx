import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../shared/ui/ui.css';

const links = [
  { to: '/home', key: 'nav.home' },
  { to: '/shifts', key: 'nav.shifts' },
  { to: '/reports', key: 'nav.reports' },
  { to: '/staff', key: 'nav.staff' },
  { to: '/rates', key: 'nav.rates' },
  { to: '/settings', key: 'nav.settings' }
];

export function Layout() {
  const { t } = useTranslation();
  return (
    <div>
      <nav className="navbar" aria-label={t('app.title')}>
        <strong>{t('app.title')}</strong>
        <div className="navbar__links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'navbar__link navbar__link--active' : 'navbar__link')}
            >
              {t(link.key)}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="app-shell">
        <Outlet />
      </main>
    </div>
  );
}
