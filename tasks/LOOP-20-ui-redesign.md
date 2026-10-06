# LOOP-20/21/22/23 — UI редизайн ✅ PART DONE

## Сделано в этом заходе
- B-01: `app/onboarding.tsx` — убран мёртвый `flatListRef`, убран импорт FlatList снизу, добавлены a11y-labels
- UI-03: `app/(tabs)/_layout.tsx` — убран конфликт свайп-навигации (GestureDetector + useSwipeNavigation)
- UI-02: бренд-фон splash `#0F172A`, TabBar уже floating pill с a11y
- `components/ui/*` (Button/Card/Badge/Skeleton) — единый DS на `lib/theme.ts`

## Остаток UI (следующие loops, файлы уже размечены)
- LOOP-20: разбить `index.tsx` (~1000 строк, PostDetailModal внутри) → `components/feed/PostCard.tsx` + `components/feed/PostDetailModal.tsx`
- LOOP-20: разбить `profile.tsx` → `components/profile/*`
- LOOP-21: `constants/Colors.ts` существует, но нигде не импортируется (проверено поиском) — удалить файл в отдельном коммите
- LOOP-22: hero в ленте + 1 CTA «Добавить автограф», пустые состояния уже частично есть
- LOOP-23: хук `useSwipeNavigation` существует в `hooks/`, но уже нигде не используется (`_layout.tsx` чистый Tabs + CustomTabBar) — удалить файл при декомпозиции; a11y labels в upload/profile — частично добавлены, добить при декомпозиции

## Почему не разбиваю монолиты прямо сейчас
Разбиение 1000-строчных экранов без запуска эмулятора = риск сломать питч-сценарий.
План: сначала зелёный коммит MVP, затем по одному экрану за loop с typecheck.
