# AUDIT-UI — Интерфейс и графика

## Факты
- 4 экрана-переростка: `profile.tsx` 39KB, `index.tsx` 39KB, `upload.tsx` 35KB, `community.tsx` 17KB.
- `lib/theme.ts` (дизайн-токены) существует, но экраны используют инлайн-стили и дублируют цвета/отступы.
- `constants/Colors.ts` — legacy синяя тема, конфликтует с `lib/theme.ts`.
- `components/ui/*` (Button, Card, Badge, Skeleton) есть, но используются точечно.
- Onboarding: `flatListRef = useRef<FlatList>(null)` без обновления scroll, импорт FlatList внизу файла.

## Недостатки (для agentic loops)
- UI-01 Перегруженная лента: PostDetailModal 1000+ строк логики внутри `index.tsx`.
- UI-02 Несовременная графика: дефолтные Ionicons, нет hero, нет брендинга, splash белый `#ffffff`.
- UI-03 Неинтуитивная навигация: кастомный TabBar + свайп-навигация конфликтуют, нет accessibility labels везде.
- UI-04 Дублирование тем: два источника цветов, тёмная тема не OLED.
- UI-05 Гигантские файлы: нет декомпозиции на `features/feed/*`, `features/upload/*`.

## Рекомендации
- Разбить экраны на компоненты <300 строк.
- Ввести единый Theme + Typography + Spacing как обязательные.
- Редизайн: минимализм, 1 CTA на экран, skeleton/empty уже частично есть — довести до 100%.
