# AUDIT-GIT — Состояние гита

## Факты (2026-10-05)
- Ветка: `main`, remote `origin/main`, HEAD `a5e8410`.
- `git status --short`: 6M + 3?? + 1 gitlink-modified.
  - M: `app/(tabs)/profile.tsx`, `upload.tsx`, `components/CollectionsList.tsx`, `context/PostsContext.tsx`, `lib/signature-analyzer.ts`, `tasks/progress.md`
  - ??: `lib/__tests__/celebrity-database.test.ts`, `lib/celebrity-database.ts`, `supabase/seed`
  - m: `.claude/worktrees/quizzical-kare-9a31cf` (gitlink 160000 без .gitmodules)
- `.env`, `dist/`, `.expo/` — корректно игнорируются.
- README.md отсутствует. Тегов релиза нет. `seeds_output.json` закоммичен (мусор?).

## Недостатки
- GIT-01 Грязная рабочая копия — нельзя релизить.
- GIT-02 Битый gitlink `.claude/*` — нужен `git rm --cached` + ignore.
- GIT-03 Нет README (инвестор/разработчик не поймёт запуск).
- GIT-04 Нет `develop`/`release` веток, нет тегов `v0.1-mvp`.
- GIT-05 Коммиты на русском/английском вперемешку, нет конвенции.

## План актуализации
1. `git rm --cached .claude/worktrees/quizzical-kare-9a31cf` + ignore `.claude/`.
2. Коммит аудита (этот шаг), пуш в `main`.
3. Коммит незавершённой фичи (celebrity-db + upload) отдельно после ревью diff.
4. README + теги + ветка `develop`.
