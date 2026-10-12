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

  primary key (community_id, user_id)
);

create index if not exists communities_owner_idx on public.communities (owner_id);
create index if not exists community_members_user_idx on public.community_members (user_id);
create index if not exists community_requests_community_idx on public.community_requests (community_id, status);
