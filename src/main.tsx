import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './styles.css';
import './ui/i18n/config';
import { routes } from './ui/routes';
import { registerServiceWorker } from './sw/register';
import { seedDemoData } from './db/migrations';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

seedDemoData().catch((error) => {
  console.error('Failed to seed demo data', error);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routes} />
    </QueryClientProvider>
  </StrictMode>
);

registerServiceWorker();
