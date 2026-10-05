# LOOP-01 — Git-гигиена (NEXT)

> Статус: TODO. Цель: чистый `git status`, актуальный `main`.

## Шаги
1. `git rm --cached .claude/worktrees/quizzical-kare-9a31cf` (это gitlink, не сабмодуль).
2. Добавить `.claude/` в `.gitignore`.
3. Проверить diff 6M+3?? файлов, разбить на 2 коммита:
   - A: фича celebrity-database + upload autocomplete + тесты
   - B: правки profile/Collections/PostsContext/signature-analyzer
4. Создать `README.md` (запуск, env, EAS, Supabase).
5. Создать ветку `develop`, пуш `main` + `develop`.
6. Отчёт + пуш.

## Критерии готовности
- `git status --short` пуст (кроме ожидаемого).
- `git ls-files --stage` без 160000.
- README открывается и понятен новичку.
