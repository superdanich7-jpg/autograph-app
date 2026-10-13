# DESIGN RESEARCH 2026 — массовый рисерч для Autograph App

Дата: 2026-10-13. Цель: UI/UX высшего уровня, удобство с первого запуска.
Источники: Muzli Mobile Trends 2026, GenDesigns Social Design, ForaSoft UX Playbook 2026.

## 1. Структурные тренды (не визуальные)

1. **AI-native adaptive layout**: Spotify/iOS18/Google Maps — порядок секций под поведение.
   - Action: лента «Для вас / Подписки» + RecommendedRail уже есть → добавить «Вы недавно смотрели» и time-of-day сортировку.
2. **Gesture-based navigation + haptics**: свайпы, bottom-sheets вместо full-screen модалок.
   - Action: PostDetail/Comments/Profile → bottom-sheet архитектура, свайп-вниз закрыть, haptic на пороге.
3. **Bottom-sheet архитектура**: вторичный контент — шиты на 3 высоты (peek/half/full).
   - Action: единый Sheet компонент.
4. **Thumb-zone layout**: все CTA в нижней трети, min touch 48x48 (WCAG 2.2 AA).
   - Action: аудит всех кнопок <48 → поднять.
5. **Dark mode first-class**: не инверсия, а отдельная палитра (уже Ink&Gold — держать).
6. **Passkeys / бесшовный вход**: гость → ценность за 60 сек, вход только в момент действия.
   - Action: guest-first, RequireAuth шит.
7. **Glassmorphism только для оверлеев**: таббар/шиты/тосты на capable-устройствах, fallback — solid.
8. **Time-to-first-value <60s**: D7 retention x2.
   - Action: онбординг 3 слайда + «Добавить первый автограф» + демо-коллекция.

## 2. Соцсеть: feed / profile / create / engage

Core loop: Create → Distribute → React → Notify → Return. Скорость цикла = ретеншн.

Feed:
- Infinite scroll + «Вы всё посмотрели» брейк (этика + доверие).
- Pull-to-refresh с haptic + «+N новых».
- For You (алго) / Following (хроно) табы.
- Mixed content: фото-карточки, AI-вердикт, спор-баннер, рекомендации-карусель.
- Двойной тап = лайк + сердечко-спринг (уже есть — держать).
- Скелетоны вместо спиннеров (восприятие скорости).

Profile:
- Hero: аватар 72, имя 24/800, @handle, streak 🔥, trust-бейдж, стоимость ~$X.
- Табы: Посты / Оценённые / Сохранённые + сетка 3-колоночная.
- ShareStatsCard (Wrapped-паттерн) + Export/Import.

Create (upload):
- 3-шаговый визард: 1 Фото → 2 Детали → 3 Проверка → Готово.
- Inline AI-подсказка (opt-in, reversible), авто-категория.
- Прогресс-бар сверху, кнопка «Опубликовать» в thumb-зоне, черновик сохраняется.

Engage:
- VoteButton дуэль (уже есть) + trust-вес голосов.
- Спор-баннер → дискуссия (петля).
- Уведомления группировать, quiet hours.

Discovery:
- Поиск по знаменитости/категории + Recent + Trending теги.
- RecommendedRail горизонтальный.

## 3. Playbook 2026 — чеклист

- Cold start <2.5s p90, tap <100ms, crash-free >99.5%.
- 44x44pt / 48x48dp тапы, Dynamic Type, контраст 4.5:1, фокус-стили.
- Формы: autofill, inline-валидация, одна primary-кнопка.
- Motion: 150/250/350ms, press-scale 0.97, spring для лайков, без параллакс-мусора.
- Пустые состояния с CTA (уже LOOP-CEO-05 — расширить на поиск/уведомления).
- Скелетоны, кэш картинок, FlashList при >100 айтемов.

## 4. Что берут топы (паттерны для нас)

- Duolingo: стрики + напоминания (уже streak-reminder — показать в UI).
- Spotify Wrapped: годовая статистика → ShareStatsCard (уже есть — вывести в профиль hero).
- Reddit/StackOverflow: карма/trust → trust-бейджи (уже есть — показать у аватаров в ленте).
- Instagram/TikTok: двойной тап, haptics, edge-to-edge фото 4:3, stories-ring для live-споров.
- PSA/Collect: сертификаты → наш SVG+QR (уже есть — добавить «проверить» экран).
- eBay/PWCC: оценка ~$X → CollectionValueCard (уже есть — добавить дельту и график-спарклайн).

## 5. Вывод для прорыва

Прорыв = не «ещё фич», а 3 точных удара:
1. Единый визуальный язык (Ink&Gold уже, но добить: стекло-таббар, hero-карточки, шиты).
2. Скорость восприятия (скелетоны, caught-up, визард 3 шага).
3. Первый запуск за 60 сек (онбординг свайп + демо + CTA).
