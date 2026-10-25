-- ============================================================
-- apply-pending-2026-10-25.sql — применить за один прогон в Dashboard → SQL Editor
-- Содержит НЕДОСТАЮЩИЕ миграции: 002, 006, 007, 008, 009 + storage-бакет.
-- Идемпотентно: можно запускать повторно (if exists / on conflict do nothing).
-- После применения: npm run db:health && npm run db:proof — оба должны позеленеть.
-- 007 исправлен 2026-10-25: незакрытый create table community_requests (F-29).
-- ============================================================

drop policy if exists "Users can read own autograph posts" on public.autograph_posts;
create policy "Anyone can read autograph posts"
  on public.autograph_posts for select
  using (true);

drop policy if exists "Users can update own autograph posts" on public.autograph_posts;
create policy "Authenticated users can update autograph interactions"
  on public.autograph_posts for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ============================================================
-- Миграция 006: RLS hardening (исправление дыр 002/004/005)
-- B-02, B-03 из tasks/DEFECTS.md
-- ============================================================

-- ─── 002: autograph_posts — update только владелец ───
drop policy if exists "Authenticated users can update autograph interactions"
  on public.autograph_posts;

create policy "Owners can update own autograph posts"
  on public.autograph_posts for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ─── 004: user_achievements — insert только за себя ───
drop policy if exists "user_achievements_insert" on public.user_achievements;
create policy "user_achievements_insert_own" on public.user_achievements
  for insert with check (auth.uid()::text = user_id);

-- ─── 004: user_stats — insert/update только свои ───
drop policy if exists "user_stats_upsert" on public.user_stats;
drop policy if exists "user_stats_update" on public.user_stats;
create policy "user_stats_insert_own" on public.user_stats
  for insert with check (auth.uid()::text = user_id);
create policy "user_stats_update_own" on public.user_stats
  for update
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

-- ─── 005: notifications — только свои строки ───
drop policy if exists "notifications_select" on public.notifications;
drop policy if exists "notifications_insert" on public.notifications;
drop policy if exists "notifications_update" on public.notifications;

create policy "notifications_select_own" on public.notifications
  for select using (auth.uid()::text = user_id);
create policy "notifications_insert_own" on public.notifications
  for insert with check (auth.uid()::text = user_id);
create policy "notifications_update_own" on public.notifications
  for update
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);


-- 007_communities.sql — Приватные сообщества коллекционеров (CEO-идея #5).
--
-- Локальная (offline-first) модель живёт в lib/communities.ts и PostsContext.
-- Эта миграция готовит облачный слой для синхронизации сообществ:
--   communities          — метаданные сообщества
--   community_members    — членство (many-to-many)
--   community_requests   — заявки на вступление в приватные сообщества
--
-- RLS (безопасность по умолчанию):
--   - публичные сообщества видны всем
--   - приватные — только участникам (+ владельцу)
--   - создатель управляет своим сообществом
--
-- Применять после 001..006. Идемпотентно (IF NOT EXISTS / DROP POLICY).

-- ─── Таблица сообществ ─────────────────────────
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 40),
  description text not null default '',
  category text not null default 'other'
    check (category in ('sports', 'music', 'movies', 'politics', 'other')),
  is_private boolean not null default false,
  emoji text not null default '🏆',
  owner_id uuid not null references auth.users (id) on delete cascade,
  member_count integer not null default 1,
  created_at timestamptz not null default now()
);

-- ─── Членство ──────────────────────────────────
create table if not exists public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'moderator', 'member')),
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

-- ─── Заявки на вступление (приватные) ──────────
create table if not exists public.community_requests (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

-- ─── Row Level Security ────────────────────────
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_requests enable row level security;

-- Политики communities
drop policy if exists "communities readable public or member" on public.communities;
create policy "communities readable public or member"
  on public.communities for select
  using (
    is_private = false
    or owner_id = auth.uid()
    or exists (
      select 1 from public.community_members m
      where m.community_id = communities.id and m.user_id = auth.uid()
    )
  );

drop policy if exists "communities insert own" on public.communities;
create policy "communities insert own"
  on public.communities for insert
  with check (owner_id = auth.uid());

drop policy if exists "communities update own" on public.communities;
create policy "communities update own"
  on public.communities for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "communities delete own" on public.communities;
create policy "communities delete own"
  on public.communities for delete
  using (owner_id = auth.uid());

-- Политики membership
drop policy if exists "members readable members" on public.community_members;
create policy "members readable members"
  on public.community_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.community_members me
      where me.community_id = community_members.community_id and me.user_id = auth.uid()
    )
    or exists (
      select 1 from public.communities c
      where c.id = community_members.community_id and c.is_private = false
    )
  );

drop policy if exists "members insert self or owner" on public.community_members;
create policy "members insert self or owner"
  on public.community_members for insert
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.communities c
      where c.id = community_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "members delete self or owner" on public.community_members;
create policy "members delete self or owner"
  on public.community_members for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.communities c
      where c.id = community_members.community_id and c.owner_id = auth.uid()
    )
  );

-- Политики заявок
drop policy if exists "requests read owner or self" on public.community_requests;
create policy "requests read owner or self"
  on public.community_requests for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.communities c
      where c.id = community_requests.community_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "requests insert self" on public.community_requests;
create policy "requests insert self"
  on public.community_requests for insert
  with check (user_id = auth.uid());

drop policy if exists "requests update owner" on public.community_requests;
create policy "requests update owner"
  on public.community_requests for update
  using (
    exists (
      select 1 from public.communities c
      where c.id = community_requests.community_id and c.owner_id = auth.uid()
    )
  );

-- ─── Триггер: поддержка member_count ───────────
create or replace function public.sync_community_member_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.communities
      set member_count = (select count(*) from public.community_members where community_id = new.community_id)
      where id = new.community_id;
  elsif (tg_op = 'DELETE') then
    update public.communities
      set member_count = (select count(*) from public.community_members where community_id = old.community_id)
      where id = old.community_id;
  end if;
  return null;
end;
$$;

drop trigger if exists community_members_count_sync on public.community_members;
create trigger community_members_count_sync
  after insert or delete on public.community_members
  for each row execute function public.sync_community_member_count();

create index if not exists communities_owner_idx on public.communities (owner_id);
create index if not exists community_members_user_idx on public.community_members (user_id);
create index if not exists community_requests_community_idx on public.community_requests (community_id, status);


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


-- ============================================================
-- Storage-бакет autographs (из lib/storage.ts)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('autographs', 'autographs', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can read autograph photos" on storage.objects;
create policy "Anyone can read autograph photos"
  on storage.objects for select
  using (bucket_id = 'autographs');

drop policy if exists "Users can upload own autograph photos" on storage.objects;
create policy "Users can upload own autograph photos"
  on storage.objects for insert
  with check (bucket_id = 'autographs' and auth.role() = 'authenticated');
