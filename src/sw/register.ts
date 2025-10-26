import { Workbox } from 'workbox-window';

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');
    wb.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        console.info('Service worker activated');
      }
    });
    wb.register();
  }
};
