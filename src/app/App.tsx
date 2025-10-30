import { Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../shared/i18n';
import { Layout } from './components/Layout';
import { useDBReady } from '../entities/db';
import { useDataStore } from '../features/data/store';
import { Snackbar } from '../shared/ui/Snackbar';
import { useSnackbar } from '../shared/hooks/useSnackbar';
import { useOfflineStatus } from '../shared/hooks/useOffline';
import { setupBackupScheduler } from '../shared/backup';
import { HomePage } from '../pages/Home/HomePage';
import { ShiftsPage } from '../pages/Shifts/ShiftsPage';
import { ReportsPage } from '../pages/Reports/ReportsPage';
import { StaffPage } from '../pages/Staff/StaffPage';
import { RatesPage } from '../pages/Rates/RatesPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { OnboardingPage } from '../pages/Onboarding/OnboardingPage';

function ProtectedLayout() {
  const onboarded = useDataStore((state) => state.settings.onboarded ?? false);
  if (!onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Layout />;
}

export function App() {
  const { ready, error } = useDBReady();
  const { ready: loaded, load } = useDataStore((state) => ({ ready: state.ready, load: state.load }));
  const { visible, message, variant, show } = useSnackbar();
  const isOffline = useOfflineStatus();
  const { t } = useTranslation();

  useEffect(() => {
    if (ready && !loaded) {
      void load();
    }
  }, [ready, loaded, load]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setupBackupScheduler();
    }
  }, []);

  useEffect(() => {
    if (isOffline) {
      show(t('common.offline'), 'warning');
    }
  }, [isOffline, show, t]);

  if (error) {
    return <div role="alert">Failed to open IndexedDB: {error.message}</div>;
  }

  if (!ready || !loaded) {
    return <div role="status">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/shifts" element={<ShiftsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/rates" element={<RatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
      <Snackbar message={message} visible={visible} variant={variant} />
    </BrowserRouter>
  );
}
