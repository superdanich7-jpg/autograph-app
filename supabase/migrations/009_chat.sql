-- 009_chat.sql — Личные сообщения (DM) между коллекционерами (CEO-запрос, Фаза 3).
--
-- Локальная (offline-first) модель живёт в lib/chat.ts и PostsContext.
-- Эта миграция готовит облачный слой для синхронизации переписки:
--   chat_messages — все сообщения (from_id, to_id, text, read)
--
-- Рисерч соцсетей 2026: DM = ядро «core loop». Realtime-подписка через
-- supabase.channel('chat_messages') на стороне клиента.
-- RLS: пользователь видит и пишет только сообщения, где он участник.
--
-- Применять после 001..008. Идемпотентно (IF NOT EXISTS / DROP POLICY).

-- ─── Сообщения ─────────────────────────────────
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references auth.users (id) on delete cascade,
  to_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  read boolean not null default false,
  created_at timestamptz not null default now(),
  check (from_id <> to_id)
);

-- ─── Row Level Security ────────────────────────
alter table public.chat_messages enable row level security;

-- Читать может только участник диалога (отправитель или получатель).
drop policy if exists "chat read own threads" on public.chat_messages;
create policy "chat read own threads"
  on public.chat_messages for select
  using (from_id = auth.uid() or to_id = auth.uid());

-- Писать может только от своего имени.
drop policy if exists "chat insert own" on public.chat_messages;
create policy "chat insert own"
  on public.chat_messages for insert
  with check (from_id = auth.uid());

-- Получатель может пометить своё входящее как прочитанное.
drop policy if exists "chat update read by recipient" on public.chat_messages;
create policy "chat update read by recipient"
  on public.chat_messages for update
  using (to_id = auth.uid())
  with check (to_id = auth.uid());

-- ─── Realtime ──────────────────────────────────
-- Публикуем изменения для realtime-подписок (новые сообщения, прочтение).
alter publication supabase_realtime add table public.chat_messages;

-- ─── Индексы ───────────────────────────────────
create index if not exists chat_messages_thread_idx
  on public.chat_messages (
    least(from_id, to_id),
    greatest(from_id, to_id),
    created_at
  );
create index if not exists chat_messages_to_unread_idx
  on public.chat_messages (to_id, read) where read = false;
