# Supabase setup for Autograph

This app now has two data layers:

1. Local cache in `AsyncStorage`, so the collection survives app restarts.
2. Optional cloud sync from Profile -> Settings -> Cloud Sync.

## 1. Create a Supabase project

1. Open Supabase and create a new project.
2. In Project Settings -> API, copy:
   - Project URL
   - anon public key
3. Copy `.env.example` to `.env`.
4. Fill:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Restart Expo after changing `.env`.

## 2. Create database tables

In Supabase Dashboard -> SQL Editor, run:

```sql
-- paste supabase/migrations/001_initial_autograph_schema.sql here
-- then paste supabase/migrations/002_public_feed_and_interactions.sql here
```

The migration creates:

- `autograph_profiles` for profile/settings/following state.
- `autograph_posts` for autograph cards.
- RLS policies so each signed-in user can only read and write their own data.
- Public feed read access for autograph cards.
- Authenticated interaction updates so users can confirm other collectors' posts.

## 3. Enable Auth

In Supabase Dashboard -> Authentication -> Providers:

1. Keep Email enabled.
2. For local testing, disable email confirmations or use a real inbox.
3. Create a user from the app's `/auth` screen or from Dashboard -> Authentication -> Users.

Cloud sync requires a signed-in Supabase user. Without sign-in, the app still works locally.

## 4. Test sync

1. Run the app.
2. Open `/auth`, register or sign in.
3. Add an autograph from the Add tab.
4. Open Profile -> Settings.
5. Tap "Синхронизировать коллекцию".
6. Check Supabase Table Editor -> `autograph_posts`.

## 5. Next backend steps

Recommended next additions:

- Move image files from local URI to Supabase Storage.
- Store comments and votes as separate tables for community features.
- Add Edge Function for real signature analysis instead of the current local mock.
- Add public collector profiles once moderation and privacy rules are defined.
