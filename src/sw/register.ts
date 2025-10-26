import { Workbox } from 'workbox-window';

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const base = import.meta.env.BASE_URL;
    const swUrl = `${base}sw.js`;
    const wb = new Workbox(swUrl, { scope: base });
    wb.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        console.info('Service worker activated');
      }
    });
    wb.register();
  }
};
