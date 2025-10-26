import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy, type LazyExoticComponent } from 'react';

import { AppLayout } from './screens/AppLayout';
import { LoadingScreen } from './screens/LoadingScreen';

const TodayScreen = lazy(() => import('./screens/Today'));
const EmployeesScreen = lazy(() => import('./screens/Employees'));
const SitesScreen = lazy(() => import('./screens/Sites'));
const CalendarScreen = lazy(() => import('./screens/Calendar'));
const ReportsScreen = lazy(() => import('./screens/Reports'));
const SettingsScreen = lazy(() => import('./screens/Settings'));
const QueueScreen = lazy(() => import('./screens/Queue'));

const withSuspense = (Component: LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(TodayScreen) },
      { path: 'employees', element: withSuspense(EmployeesScreen) },
      { path: 'sites', element: withSuspense(SitesScreen) },
      { path: 'calendar', element: withSuspense(CalendarScreen) },
      { path: 'reports', element: withSuspense(ReportsScreen) },
      { path: 'settings', element: withSuspense(SettingsScreen) },
      { path: 'queue', element: withSuspense(QueueScreen) }
    ]
  }
]);
