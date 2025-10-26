import { injectManifest } from 'workbox-build';

export const buildServiceWorker = () =>
  injectManifest({
    swSrc: 'src/sw/service-worker.ts',
    swDest: 'dist/sw.js',
    globDirectory: 'dist',
    globPatterns: ['**/*.{js,css,html,png,svg,json,webmanifest}'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
  });

if (process.argv[1]?.includes('workbox-config')) {
  buildServiceWorker().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
