import { injectManifest } from 'workbox-build';

await injectManifest({
  swSrc: 'src/sw/service-worker.js',
  swDest: 'dist/sw.js',
  globDirectory: 'dist',
  globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
  additionalManifestEntries: [
    { url: '/offline.html', revision: '1' }
  ],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
});
