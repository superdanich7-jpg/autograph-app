create table if not exists public.autograph_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Autograph Collector',
  bio text not null default '',
  notifications_enabled boolean not null default true,
  following text[] not null default '{}',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.autograph_posts (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  celebrity_name text not null default '',
  category text not null default 'other',
  rarity text not null default 'common',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists autograph_posts_owner_updated_idx
  on public.autograph_posts(owner_id, updated_at desc);

alter table public.autograph_profiles enable row level security;
alter table public.autograph_posts enable row level security;

drop policy if exists "Users can read own autograph profile" on public.autograph_profiles;
create policy "Users can read own autograph profile"
  on public.autograph_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can upsert own autograph profile" on public.autograph_profiles;
create policy "Users can upsert own autograph profile"
  on public.autograph_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own autograph profile" on public.autograph_profiles;
create policy "Users can update own autograph profile"
  on public.autograph_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own autograph posts" on public.autograph_posts;
create policy "Users can read own autograph posts"
  on public.autograph_posts for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert own autograph posts" on public.autograph_posts;
create policy "Users can insert own autograph posts"
  on public.autograph_posts for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own autograph posts" on public.autograph_posts;
create policy "Users can update own autograph posts"
  on public.autograph_posts for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete own autograph posts" on public.autograph_posts;
create policy "Users can delete own autograph posts"
  on public.autograph_posts for delete
  using (auth.uid() = owner_id);
