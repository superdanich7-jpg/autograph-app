## LOOP-CEO-12 — Оценка стоимости коллекции (2026-10)

CEO-идея #8 (Фаза 2). Рисерч: Relic Roster / PSA показывают оценку — мощный
социальный триггер для шейринга и возврата.

### Что сделано
- [x] `lib/valuation.ts` — эвристическая оценка (чистые функции):
  - База по редкости (common $25 / rare $120 / legendary $500)
  - Множитель категории (music 1.6 … other 1.0)
  - Множитель подтверждённости (0% → 0.7x … 100% → 1.5x)
  - `estimatePostValue`, `estimateCollectionValue`, `formatUsd`
- [x] `components/CollectionValueCard.tsx` — вирусная карточка «~$X» + % подтверждено + оговорка
- [x] Интеграция в профиль (`profile.tsx`) перед «Целью месяца»
- [x] 8 unit-тестов (`lib/__tests__/valuation.test.ts`)

### Честное ограничение
Это ориентировочная эвристика, НЕ рыночная цена (намеренно указано в UI).
Реальные API (PWCC/Beckett/eBay) — внешний платный доступ + бэкенд → Фаза 3.

### Валидация
- typecheck PASS, encoding ALL CLEAN, jest 139/139 PASS.
