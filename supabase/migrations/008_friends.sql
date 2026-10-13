-- 008_friends.sql — Система друзей и присутствия (CEO-запрос, Фаза 3).
--
-- Локальная (offline-first) модель живёт в lib/friends.ts и PostsContext.
-- Эта миграция готовит облачный слой для синхронизации соцграфа:
--   friend_requests — заявки в друзья (двунаправленные → друзья)
--   friendships      — материализованные подтверждённые дружества
--
-- Рисерч соцсетей 2026: follow/friend + presence = драйвер удержания.
-- RLS: пользователь видит и управляет только своими связями.
--
-- Применять после 001..007. Идемпотентно (IF NOT EXISTS / DROP POLICY).

-- ─── Заявки в друзья ───────────────────────────
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references auth.users (id) on delete cascade,
  to_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  -- Один запрос на направление (защита от дублей)
  unique (from_id, to_id),
  check (from_id <> to_id)
);

-- ─── Подтверждённые дружества ──────────────────
create table if not exists public.friendships (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

-- ─── Row Level Security ────────────────────────
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;

-- Политики friend_requests: вижу только свои (входящие+исходящие)
drop policy if exists "friend_requests read own" on public.friend_requests;
create policy "friend_requests read own"
  on public.friend_requests for select
  using (from_id = auth.uid() or to_id = auth.uid());

drop policy if exists "friend_requests insert own" on public.friend_requests;
create policy "friend_requests insert own"
  on public.friend_requests for insert
  with check (from_id = auth.uid());

-- Обновлять/удалять может отправитель (отмена) или получатель (принять/отклонить)
drop policy if exists "friend_requests update involved" on public.friend_requests;
create policy "friend_requests update involved"
  on public.friend_requests for update
  using (from_id = auth.uid() or to_id = auth.uid())
  with check (from_id = auth.uid() or to_id = auth.uid());

drop policy if exists "friend_requests delete involved" on public.friend_requests;
create policy "friend_requests delete involved"
  on public.friend_requests for delete
  using (from_id = auth.uid() or to_id = auth.uid());

-- Политики friendships: вижу только свои связи
drop policy if exists "friendships read own" on public.friendships;
create policy "friendships read own"
  on public.friendships for select
  using (user_id = auth.uid() or friend_id = auth.uid());

drop policy if exists "friendships insert own" on public.friendships;
create policy "friendships insert own"
  on public.friendships for insert
  with check (user_id = auth.uid());

drop policy if exists "friendships delete own" on public.friendships;
create policy "friendships delete own"
  on public.friendships for delete
  using (user_id = auth.uid());

-- ─── Триггер: взаимная дружба → материализация ─
-- Когда обе стороны имеют accepted-заявки друг на друга, создаём симметричные
-- записи в friendships. Идемпотентно (on conflict do nothing).
create or replace function public.sync_friendship()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mutual boolean;
begin
  if (tg_op <> 'INSERT' and tg_op <> 'UPDATE') then
    return null;
  end if;

  if new.status <> 'accepted' then
    return null;
  end if;

  -- Встречная заявка тоже accepted?
  select exists (
    select 1 from public.friend_requests r
    where r.from_id = new.to_id
      and r.to_id = new.from_id
      and r.status = 'accepted'
  ) into mutual;

  if mutual then
    insert into public.friendships (user_id, friend_id)
    values (new.from_id, new.to_id), (new.to_id, new.from_id)
    on conflict do nothing;
  end if;

  return null;
end;
$$;

drop trigger if exists friend_requests_friendship_sync on public.friend_requests;
create trigger friend_requests_friendship_sync
  after insert or update of status on public.friend_requests
  for each row execute function public.sync_friendship();

-- ─── Индексы ───────────────────────────────────
create index if not exists friend_requests_to_idx on public.friend_requests (to_id, status);
create index if not exists friend_requests_from_idx on public.friend_requests (from_id, status);
create index if not exists friendships_friend_idx on public.friendships (friend_id);
