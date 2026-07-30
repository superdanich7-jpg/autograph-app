drop policy if exists "Users can read own autograph posts" on public.autograph_posts;
create policy "Anyone can read autograph posts"
  on public.autograph_posts for select
  using (true);

drop policy if exists "Users can update own autograph posts" on public.autograph_posts;
create policy "Authenticated users can update autograph interactions"
  on public.autograph_posts for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
