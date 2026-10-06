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
