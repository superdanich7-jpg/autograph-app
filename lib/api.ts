/**
 * API Service Layer — изоляция работы с Supabase от React компонентов.
 * Следует паттерну Service Layer: весь бизнес-логика здесь,
 * компоненты только вызывают методы и отображают результат.
 */

import { Post } from '../context/PostsContext';
import { isSupabaseConfigured, supabase } from './supabase';

// ─── Types ──────────────────────────────────────

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

export type PostRow = {
  id: string;
  owner_id: string;
  payload: Post;
  updated_at: string;
};

export type ProfileRow = {
  user_id: string;
  name: string;
  bio: string;
  notifications_enabled: boolean;
  following: string[];
  payload: Record<string, unknown>;
  updated_at: string;
};

// ─── Posts API ──────────────────────────────────

export async function fetchPosts(): Promise<ApiResult<Post[]>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('autograph_posts')
      .select('id, owner_id, payload, updated_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const posts = ((data ?? []) as PostRow[]).map((row) => ({
      ...row.payload,
      ownerId: row.owner_id,
    }));

    return { data: posts, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch posts' };
  }
}

export async function upsertPosts(posts: Post[]): Promise<ApiResult<void>> {
  if (!isSupabaseConfigured || posts.length === 0) {
    return { data: null, error: null };
  }

  try {
    const rows = posts.map((post) => ({
      id: post.id,
      owner_id: post.ownerId ?? 'unknown',
      celebrity_name: post.celebrityName,
      category: post.category,
      rarity: post.rarity,
      payload: post,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('autograph_posts').upsert(rows);
    if (error) throw error;

    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Failed to upsert posts' };
  }
}

// ─── Profile API ────────────────────────────────

export async function fetchProfile(userId: string): Promise<ApiResult<Record<string, unknown>>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('autograph_profiles')
      .select('payload')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    return { data: (data?.payload as Record<string, unknown>) ?? null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Failed to fetch profile' };
  }
}

export async function upsertProfile(
  userId: string,
  profile: Record<string, unknown>
): Promise<ApiResult<void>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { error } = await supabase.from('autograph_profiles').upsert({
      user_id: userId,
      name: (profile.name as string) ?? '',
      bio: (profile.bio as string) ?? '',
      notifications_enabled: (profile.notificationsEnabled as boolean) ?? true,
      following: (profile.following as string[]) ?? [],
      payload: profile,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Failed to upsert profile' };
  }
}

// ─── Auth API ───────────────────────────────────

export async function getSession() {
  if (!isSupabaseConfigured) {
    return { user: null, error: null };
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    return { user: data.session?.user ?? null, error: null };
  } catch (e) {
    return { user: null, error: e instanceof Error ? e.message : 'Failed to get session' };
  }
}

export async function signOutUser(): Promise<ApiResult<void>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Failed to sign out' };
  }
}