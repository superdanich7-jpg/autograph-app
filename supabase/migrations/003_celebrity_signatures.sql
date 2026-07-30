-- Таблица эталонных подписей знаменитостей
-- Содержит верифицированные данные из Wikipedia/Wikimedia Commons
create table if not exists public.autograph_celebrity_signatures (
  id uuid primary key default gen_random_uuid(),
  celebrity_name text not null,
  category text not null check (category in ('sports', 'music', 'movies', 'politics', 'other')),
  description text not null default '',
  image_url text,                     -- URL изображения подписи (из Wikimedia Commons)
  photo_url text,                     -- URL фото знаменитости
  reference_url text,                 -- Ссылка на источник (Wikipedia)
  nationality text not null default '',
  birth_year int,
  tagline text not null default '',    -- Короткое описание (например: "Легендарный футболист")
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Уникальный индекс на имя знаменитости (чтобы не было дубликатов)
create unique index if not exists idx_celebrity_signatures_name
  on public.autograph_celebrity_signatures(lower(trim(celebrity_name)));

-- Индекс для поиска по категории
create index if not exists idx_celebrity_signatures_category
  on public.autograph_celebrity_signatures(category);

-- Разрешаем чтение всем (база знаменитостей публична)
alter table public.autograph_celebrity_signatures enable row level security;

drop policy if exists "Anyone can read celebrity signatures" on public.autograph_celebrity_signatures;
create policy "Anyone can read celebrity signatures"
  on public.autograph_celebrity_signatures for select
  using (true);

-- Только сервисная роль может добавлять/редактировать (через Edge Functions или seed)
drop policy if exists "Service role can insert celebrity signatures" on public.autograph_celebrity_signatures;
create policy "Service role can insert celebrity signatures"
  on public.autograph_celebrity_signatures for insert
  with check (auth.role() = 'service_role');

drop policy if exists "Service role can update celebrity signatures" on public.autograph_celebrity_signatures;
create policy "Service role can update celebrity signatures"
  on public.autograph_celebrity_signatures for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');