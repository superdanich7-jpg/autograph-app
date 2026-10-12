# LOOP-CEO-03 — Спорные дискуссии (engagement loop)

> CEO-идея #2. Дата: 2026-10. Рисерч: спорный контент = главный драйвер вовлечённости
> в соцсетях (Reddit/дискуссии, TikTok «дебаты»). Превращаем пассивный скролл в петлю
> «увидел спор → зашёл в дискуссию → оставил голос/комментарий».

## Зачем (CEO-аргумент инвестору)
- Спорный автограф — точка максимального внимания. Если юзер видит «сообщество
  разделилось», у него есть причина вернуться и участвовать → retention.
- Дешёвая фича: весь движок спорности (`isDisputed`) уже написан и покрыт тестами.

## Что сделано
- `components/FeedPostCard.tsx`:
  - `disputed` (был мёртвой переменной) теперь задействован:
    - баннер `debateBanner` под бейджами при `isDisputed(post) === true`.
    - CTA «Спорный автограф / Сообщество разделилось — присоединиться к дискуссии».
    - Тап → если гость (`!canInteract`) → `onRequireAuth()`; иначе `onOpenComments(id)`.
    - Иконка `help-buoy`, warning-цвета, chevron справа — современный вид.
  - Стили: `debateBanner`, `debateBannerBody`, `debateBannerTitle`, `debateBannerHint`.

## Что уже было (не дублируем)
- `badge "Спорный"` в `badgesRow` (LOOP-02).
- Сортировка «Самые спорные» (`sortMode === 'debated'`) в `index.tsx`.
- Секция «Спорные» в `community.tsx`.
- Вердикт `disputed` (help-buoy) в `AuthenticityVerdictCard`/`FeedPostCard.verdictPill`.

## Валидация
- `npm run typecheck` — PASS
- `npm test --ci` — 81/81 PASS
- `node scripts/check-encoding.js` — ALL CLEAN

## Осталось (Фаза 2, см. CEO-IMPROVEMENTS)
- Кнопка «Перейти к обсуждению» быстрее открывает ленту на спорном посте.
- Счётчик активных дискуссий в шапке «Клуба».
- Haptic-отклик на голос (CEO-идея #13).
