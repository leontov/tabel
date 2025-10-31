# Demo readiness checklist / Чек-лист готовности к демо

| ✅ / 🔄 | Item / Пункт | How to verify / Как проверить |
| --- | --- | --- |
| 🔄 | Offline installable PWA verified on iOS Safari, Android Chrome, desktop Chromium / Проверено, что PWA устанавливается оффлайн на iOS Safari, Android Chrome и настольном Chromium | Run `npm run build && npm run preview` locally, open `http://localhost:4173`, add to home screen on each device, then toggle airplane mode and relaunch. |
| ✅ | Airplane-mode smoke test: onboarding → timer → shifts → reports (CSV & JSON exports) → settings backup / Смоук-тест в режиме "в самолёте": онбординг → таймер → смены → отчёты (CSV и JSON экспорт) → бэкап в настройках | Automated via `npm run e2e`, which drives the offline scenario defined in `tests/e2e/offline.mjs` and captures screenshots in `tests/e2e/artifacts`. |
| ✅ | IndexedDB state persists across reloads and restores correctly from backup file / Данные IndexedDB сохраняются между перезагрузками и корректно восстанавливаются из бэкапа | Covered by unit tests in `src/tests/backup.test.ts` and manual import/export on Settings page; run `npm run test -- backup`. |
| ✅ | i18n parity (ru/en) confirmed by automated audit and manual spot checks / Паритет i18n (ru/en) подтверждён автопроверкой и ручными выборочными проверками | Run `npm run i18n:audit` and check `src/tests/i18n.test.ts`. |
| 🔄 | Core flows covered by Playwright offline E2E suite with green run / Основные сценарии покрыты оффлайн-E2E Playwright с зелёным прогоном | Execute `npm run e2e` after `npm install`; review console for success and screenshots in `tests/e2e/artifacts`. |
| 🔄 | Screenshots captured for iPhone 13 mini, Pixel 7, iPad (landscape) and attached to release notes / Скриншоты для iPhone 13 mini, Pixel 7, iPad (альбом) и приложены к релизным заметкам | Use Playwright device emulations (`tests/e2e/offline.mjs`) to regenerate screenshots and include them in release docs. |
| 🔄 | Lighthouse CI report meets PWA installable, performance ≥90, accessibility ≥95 / Отчёт Lighthouse CI: PWA installable, производительность ≥90, доступность ≥95 | Run `npm run ci:lighthouse` after `npm run preview`; inspect `.lighthouse/lhr.json` and CI logs. |
| ✅ | QA sign-off recorded for calculator edge cases: night overlap, overtime, open shift, weekend & holiday multipliers / QA-апрув по расчётам: ночные пересечения, переработка, незакрытая смена, выходные и праздники | Unit tests in `src/tests/calc.test.ts` cover all edge cases; ensure `npm run test -- calc` passes and archive results in QA notes. |

_Status legend / Легенда статусов_: ✅ — автоматизировано и покрыто тестами, 🔄 — требуется ручная проверка перед релизом.

## Acceptance scenarios / Приёмочные сценарии

1. **Onboarding & locale setup / Онбординг и выбор языка** — Новый пользователь проходит мастер (локаль → ночное окно → ставка/сотрудник), завершает его без ошибок, видит тост об успехе и попадает на `/home` с выбранным языком.
2. **Shift lifecycle with auto-stop / Жизненный цикл смены с автозавершением** — На странице Home запускаем смену для сотрудника, снова жмём Start для того же сотрудника → предыдущая смена автоматически закрывается, новая стартует, snackbar подтверждает действие.
3. **Break adjustments sync / Синхронизация перерывов** — В Shifts меняем перерыв одной смены inline, затем запускаем массовую правку фильтрованного списка; оба изменения сохраняются и отображаются после перезагрузки страницы.
4. **Reports aggregation & exports / Агрегация отчётов и экспорт** — Фильтруем период, проверяем суммы по сотруднику и проекту, выполняем экспорт CSV и JSON; файлы содержат локализованные заголовки и корректные цифры.
5. **Holiday multiplier application / Применение праздничного коэффициента** — Добавляем праздник в Settings → Holidays, создаём смену на эту дату; в отчёте сумма учитывает коэффициент, что подтверждают расчётные поля.
6. **Offline resilience / Устойчивость оффлайн** — С `vite preview` включаем airplane mode: навигация по основным страницам остаётся рабочей, snackbar предупреждает об оффлайне, а действия (перерывы, заметки) кэшируются и синхронизируются после возврата сети.
7. **Daily backup prompt / Автоматический ежедневный бэкап** — После 24 часов бездействия фокусируем вкладку: триггерится `ensureDailyBackup`, скачивается файл `<YYYY-MM-DD>_backup.json`, а `lastBackupAt` обновляется в Settings.
8. **Fuse-powered search & quick ranges / Поиск и быстрые диапазоны** — На странице Shifts вводим запрос (ФИО, проект, заметка); результаты фильтруются благодаря Fuse.js, быстрые фильтры Today/Week/Month мгновенно перестраивают список и сохраняются в настройках.
