# LOOP-CEO-01: Система бейджей/достижений

## Цель
Добавить систему достижений для повышения удержания (retention) и геймификации.

## Задачи

### 1. Расширение PostsContext
- [ ] Добавить поле `achievements` в состояние пользователя
- [ ] Функция `checkAndAwardAchievements(post, action)` — проверка и начисление
- [ ] Функция `getUserAchievements(userId)` — получение списка

### 2. Типы бейджей (MVP)
| ID | Название | Условие | Иконка |
|---|----------|---------|--------|
| first_post | «Первый автограф» | Создан первый пост | 📝 |
| voter_10 | «Голосующий» | 10 голосов (real/fake) | 🗳️ |
| voter_50 | «Активный голосующий» | 50 голосов | 🗳️⭐ |
| expert | «Эксперт» | 10 правильных определений (совпали с большинством) | 🎓 |
| collector_10 | «Коллекционер» | 10 постов в коллекции | 📦 |
| social_sharer | «Шаринг-мастер» | 5 шарингов через QR | 🔗 |
| dispute_solver | «Миротворец» | Участие в 5 спорных дискуссиях | ⚖️ |

### 3. UI компоненты
- [ ] `components/AchievementBadge.tsx` — один бейдж (иконка, название, описание, прогресс)
- [ ] `components/AchievementsSection.tsx` — сетка бейджей в профиле
- [ ] `components/AchievementUnlockToast.tsx` — анимация разблокировки

### 4. Интеграция
- [ ] Добавить `AchievementsSection` в `components/ProfileModal.tsx`
- [ ] Добавить `AchievementUnlockToast` в `components/Toast.tsx` или отдельный компонент

## Критерии готовности
- [ ] `npm run typecheck` — PASS
- [ ] `npm test` — PASS
- [ ] Ручное тестирование: создать пост → получить бейдж «Первый автограф»
- [ ] Прогресс-бары работают для неполных бейджей

## Зависимости
- Использует: `lib/theme.ts`, `components/Toast.tsx`, `context/PostsContext.tsx`
- Не требует: новых зависимостей, бэкенда