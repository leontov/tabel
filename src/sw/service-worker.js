import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

const handler = createHandlerBoundToURL('/index.html');

registerRoute(
  ({ request }) => request.mode === 'navigate',
  async (options) => {
    try {
      return await handler(options);
    } catch (error) {
      return caches.match('/offline.html');
    }
  }
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new NetworkFirst({ cacheName: 'assets-v1' })
);

setCatchHandler(async ({ event }) => {
  if (event.request.mode === 'navigate') {
    return caches.match('/offline.html');
  }
  return Response.error();
});
