# Tabel — Offline-first crew time tracker

## Overview
Tabel is a bilingual (ru/en) progressive web app for crews who need reliable, fully offline time tracking with overtime, night, weekend, and holiday multipliers. The app stores all data in IndexedDB, supports daily backups, and provides CSV/JSON exports for payroll reporting.

## Getting started
```bash
npm install
npm run dev
```
Visit `http://localhost:5173` to access the development build.

### Quality gates
Run locally before pushing:

```bash
npm run typecheck
npm run lint
npm run test
npm run i18n:audit
npm run build
npm run preview
npm run ci:lighthouse
npm run e2e
```

- `npm run test` executes Vitest suites (calc, backups, i18n parity, CSV snapshot).
- `npm run i18n:audit` scans the source for missing translation keys.
- `npm run ci:lighthouse` expects a preview server on port `4173` and runs Lighthouse CI (mobile PWA profile).
- `npm run e2e` launches Playwright, reusing `vite preview` at `http://localhost:4173` for the offline scenario.

## Project structure
```
src/
  app/        # router, layout, providers
  entities/   # domain types, zod schemas, Dexie client
  features/   # exports, backups, data store
  pages/      # Home, Shifts, Reports, Staff, Rates, Settings, Onboarding
  shared/     # UI kit, hooks, lib utilities, constants, i18n
  sw/         # service worker registration and template
  tests/      # unit snapshot parity suites
public/       # manifest, offline fallback, icons
scripts/      # Workbox build, i18n audit
```

## Offline & PWA
- `npm run build && npm run preview` to serve the production bundle.
- Service worker precaches the build, provides SPA navigation caching, and falls back to `/offline.html` when network navigation fails.
- The web app manifest enables installation on Android and iOS (via Safari add to home screen). Ensure you accept the install prompt during preview.

### Manual offline test
1. Load the preview build on a device.
2. Start a shift on the Home screen and stop it to persist data.
3. Toggle airplane mode, reopen the app, navigate through Home → Shifts → Reports → Settings.
4. Confirm the offline snackbar appears and the newly created shift remains visible in the Shifts table.
5. Trigger CSV export on Reports — the file should still download while offline.

## Backups
- Settings page provides manual JSON export/import buttons.
- A background scheduler (`ensureDailyBackup`) creates a dated JSON file and SHA-256 hash once per 24 hours (initial load + when the tab regains focus).
- Unit tests verify hash generation and timestamp updates.

## i18n
- Strings live in `src/shared/i18n/{en,ru}.json`.
- Use `useTranslation()` or `t('key')` for UI copy.
- `npm run i18n:audit` ensures every key used in `src` exists in both locales.

## Reports & exports
- Reports aggregate totals per person and per project for a selectable period.
- CSV exports use semicolon delimiters with localized headers.
- JSON export produces the raw aggregated dataset.

## Testing checklist
- Vitest covers time calculations, payroll logic, backups, i18n parity, and CSV serialization.
- Playwright offline scenario captures screenshots in `tests/e2e/artifacts` and validates navigation, start/stop, and CSV downloads under simulated offline mode.
- Lighthouse CI checks PWA installability and performance in mobile emulation.

## Demo readiness checklist
See [`docs/DEMO_CHECKLIST.md`](docs/DEMO_CHECKLIST.md) for the acceptance workflow covering offline validation, backups, i18n, responsiveness, and exports.
