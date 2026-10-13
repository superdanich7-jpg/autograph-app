# DESIGN BREAKTHROUGH — план (Фаза UI 2.0 «Ink & Gold»)

Цель: за один заход поднять GUI до «запустил — удобно» без новых native-зависимостей и без бэка.

## Пакет A — Design System 2.0 (сам)
- [ ] A1. Единый источник темы: `ThemeContext` реэкспортит `lib/theme.ts` (убить дубль палитры).
- [ ] A2. Бренд-токены: `accent` (золото #C9A227), `accentLight`, paper-фон `#FAF8F4` в light, motion-токены (`durations`, `pressScale`), `minTouch=48`.
- [ ] A3. Примитивы: `PressableScale`, `Chip` (высота 44-48, пилюля), `SectionHeader`, апгрейд `Button` (minHeight 48 + press-scale), `Card` (radius 20, premium-тень).

## Пакет B — Навигация и лента (сам)
- [ ] B1. TabBar: центральный FAB «Добавить» 60pt, приподнят, главный loop Create.
- [ ] B2. FeedPostCard hero: фото 16:10 с radius, glass-пилюля вердикта поверх фото, аватар с золотым кольцом для verified, press-scale.
- [ ] B3. Шапка ленты adaptive: приветствие по времени суток, одна stats-полоса вместо 3 карточек, фильтры — сегмент + чипы, футер «Вы всё посмотрели».
- [ ] B4. Pull-to-refresh + haptic уже есть — добавить индикатор «+N новых».

## Пакет C — Онбординг и пустые состояния (сам)
- [ ] C1. Онбординг: свайп-карусель (FlatList paging), анимированные точки, прогресс, value за 60 сек.
- [ ] C2. Empty-state CTA в thumb-зоне (sticky bottom).

## Пакет D — Доступность и моушн (сам)
- [ ] D1. Все тапы ≥44pt, hitSlop на иконках, accessibilityLabel (добить).
- [ ] D2. Skeleton shimmer вместо мигания (Animated highlight).
- [ ] D3. `verify` зелёный: typecheck + 166+ тестов + encoding.

## Что НЕ трогаю (минимум бэка — см. BACKEND-NEEDED.md)
- Supabase-миграции/бакеты, EAS-сборка, push-сервер, платные API цен.
