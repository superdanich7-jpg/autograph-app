# ПЛАН ПРОРЫВА ДИЗАЙНА — от 6.5 до 9/10

## Волна A — Дизайн-система (фундамент)
- A1 ✅ Единый источник темы (сделано ранее)
- ✅ A2 Тема: добавить overlay/scrim/skeleton/shimmer токены в light+dark
- ✅ A3 Примитивы: PressableScale+Chip (сделано) → добавить Sheet, Skeleton, EmptyState, SegmentedControl
- ✅ A4 Button min 48, Card hero-вариант, Badge gold-вариант для вердиктов
- A5 Типографика: запретить ручные fontSize вне typography.* (линт-гайд)

## Волна B — Лента (главный экран)
- ✅ B1 Табы «Для вас / Подписки» (SegmentedControl, sticky)
- ✅ B2 Hero-карточка: edge-to-edge фото 4:3, вердикт-оверлей на фото, trust-бейдж у аватара, compact actions 48
- ✅ B3 «Вы всё посмотрели» + pull-to-refresh с +N новых + haptic
- ✅ B4 FeedSkeleton (shimmer) + memo + getItemLayout
- ✅ B5 RecommendedRail уже есть — вставить между 3 и 4 постом

## Волна C — Шиты вместо модалок
- ✅ C1 Компонент Sheet: 3 высоты, свайп-вниз закрыть, scrim, haptic на пороге
-  C2 PostDetail → Sheet(full), Comments → Sheet(half), ProfilePost → Sheet(half) (PostDetail✅; Comments/ProfilePost ⏳)
- C3 RequireAuth → Sheet(peek) с CTA входа

## Волна D — Первый запуск за 60 сек
-  D1 Онбординг: FlatList paging свайп + прогресс + анимация иконки (прогресс+spring✅; FlatList-paging ⏳ — слайды через state)
- ✅ D2 Последний слайд CTA «Добавить первый автограф» → upload
-  D3 Демо-коллекция: 3 демо-поста если лента пустая + EmptyState с CTA

## Волна E — Upload-визард
- ✅ E1 3 шага: Фото → Детали → Проверка, прогресс-бар, Back/Next в thumb-зоне
- E2 Inline AI-подсказка + авто-категория
- E3 Черновик-индикатор «Сохранено • 12:40»

## Волна F — Профиль hero
- F1 Hero: аватар 72 + имя 24/800 + @handle + streak + trust + ~$X в одну строку-метрик
- F2 Табы Посты/Оценённые/Сохранённые + сетка 3 колонки
- F3 ShareStatsCard поднять в hero, Export/Import в меню •••

## Волна G — Доступность и скорость
- G1 Все тапы ≥48, hitSlop для иконок
- G2 Контраст, focus, Dynamic Type
- G3 Image placeholder + кэш, FlashList при >100

Порядок: A → B → D → C → E → F → G. Каждый шаг: typecheck + тесты + коммит.
