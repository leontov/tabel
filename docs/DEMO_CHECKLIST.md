# Demo readiness checklist / Чек-лист готовности к демо

- [ ] Offline installable PWA verified on iOS Safari, Android Chrome, desktop Chromium.
- [ ] Airplane-mode smoke test: onboarding → timer → shifts → reports (CSV & JSON exports) → settings backup.
- [ ] IndexedDB state persists across reloads and restores correctly from backup file.
- [ ] i18n parity (ru/en) confirmed by automated audit and manual spot checks.
- [ ] Core flows covered by Playwright offline E2E suite with green run.
- [ ] Screenshots captured for iPhone 13 mini, Pixel 7, iPad (landscape) and attached to release notes.
- [ ] Lighthouse CI report meets PWA installable, performance ≥90, accessibility ≥95.
- [ ] QA sign-off recorded for calculator edge cases: night overlap, overtime, open shift, weekend & holiday multipliers.
