# IndexedDB migrations / Миграции IndexedDB

## Version 1 — Initial schema / Исходная схема
- persons: crew catalog with default rate binding and activity flag.
- rates: hourly tariffs with overtime/night/weekend multipliers.
- projects: work sites with activation flag.
- shifts: shift log with project link, notes, minutes, and payout fields.
- settings: global preferences (locale, night window, overtime threshold, onboarding flags).
- holidays: multiplier map for holiday dates used in payroll calculations.

## Version 2 — Night breaks default / Значение по умолчанию для ночных перерывов
- ensure `breaksMin` defaults to `0` for existing shifts so new calculators do not receive `undefined`.

## Migration workflow / Процесс миграций
1. Extend Dexie `db.version(N)` with the new store map.
2. Provide `upgrade` callback that mutates existing records in-place.
3. Update this document with a short summary and the reasoning in both languages.
4. Ship accompanying unit tests where feasible to prove backward compatibility.
