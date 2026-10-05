# MVP PLAN — Релиз для инвесторов (agentic loops)

> Каждый пункт — отдельный loop: один файл `tasks/LOOP-*.md` = одна задача = один коммит.
> После каждого loop: typecheck + ручная проверка + отчёт + пуш в main.

## Фаза 0 — Гигиена (этот шаг уже идёт)
- [x] LOOP-00 Аудит (AUDIT-*.md, DEFECTS.md) → коммит + пуш
- [ ] LOOP-01 Git-гигиена: убрать gitlink `.claude`, README, develop-ветка, тег
- [ ] LOOP-02 DB-PROOF: доказать WRITE->READ скрином из Table Editor

## Фаза 1 — Доставка без QR (инвестор открывает ссылку)
- [ ] LOOP-10 Dev-client + Preview APK через EAS
- [ ] LOOP-11 Web-стенд (EAS Hosting/Vercel) для демо с ноутбука
- [ ] LOOP-12 OTA-каналы staging/production + иконка/сплэш под бренд

## Фаза 2 — UI редизайн (современно, минимализм)
- [ ] LOOP-20 Декомпозиция `index.tsx`/`profile.tsx`/`upload.tsx` (<300 строк/файл)
- [ ] LOOP-21 Единая тема: удалить `constants/Colors.ts`, только `lib/theme.ts`
- [ ] LOOP-22 Редизайн ленты: 1 CTA, hero, пустые состояния на 100%
- [ ] LOOP-23 Упростить навигацию: убрать конфликт свайпа, a11y labels

## Фаза 3 — БД и бэкенд (доказать надёжность)
- [ ] LOOP-30 RLS-фиксы 002/004/005 + миграция 006
- [ ] LOOP-31 Supabase Storage для фото (замена локальных URI)
- [ ] LOOP-32 Сид celebrity_signatures в облаке
- [ ] LOOP-33 CI: миграции dry-run + typecheck + jest (убрать passWithNoTests)

## Фаза 4 — MVP polish к питчу
- [ ] LOOP-40 Питч-сценарий: 3 клика (фото → AI → шаринг)
- [ ] LOOP-41 Лендинг/README с метриками и скриншотами
- [ ] LOOP-42 Тег `v0.1-mvp` + релизные заметки + APK-ссылка

## Правила loop
1. Прочитать свой LOOP-файл + связанные AUDIT/DEFECTS.
2. Сделать минимальное изменение, не ломать остальное.
3. `npm run typecheck`, ручной smoke.
4. Коммит + пуш + краткий отчёт.
