/**
 * useCloudSync — хук для облачной синхронизации.
 * Изолирует логику работы с Supabase от компонентов.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Post } from '../context/PostsContext';
import {
    fetchPosts,
    fetchProfile,
    getSession,
    upsertPosts,
    upsertProfile,
} from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';

export type SyncStatus = 'loading' | 'ready' | 'syncing' | 'offline' | 'error';

export function useCloudSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshCloudData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const sessionResult = await getSession();
      if (sessionResult.error) throw new Error(sessionResult.error);

      const user = sessionResult.user;

      // Fetch profile
      if (user) {
        const profileResult = await fetchProfile(user.id);
        if (profileResult.error) throw new Error(profileResult.error);
        // Profile is handled by PostsContext
      }

      // Fetch posts
      const postsResult = await fetchPosts();
      if (postsResult.error) throw new Error(postsResult.error);

      if (mountedRef.current) {
        setLastSyncedAt(new Date().toISOString());
        setSyncStatus('ready');
      }

      return {
        user,
        posts: postsResult.data ?? [],
      };
    } catch (error) {
      if (mountedRef.current) {
        setSyncStatus('error');
        setSyncError(error instanceof Error ? error.message : 'Sync failed');
      }
      return { user: null, posts: [] };
    }
  }, []);

  const syncPosts = useCallback(
    async (posts: Post[]) => {
      if (!isSupabaseConfigured) return;

      try {
        const result = await upsertPosts(posts);
        if (result.error) {
          console.warn('[useCloudSync] upsertPosts error:', result.error);
        }
      } catch (e) {
        console.warn('[useCloudSync] syncPosts failed:', e);
      }
    },
    []
  );

  const syncProfile = useCallback(
    async (userId: string, profile: Record<string, unknown>) => {
      if (!isSupabaseConfigured) return;

      try {
        const result = await upsertProfile(userId, profile);
        if (result.error) {
          console.warn('[useCloudSync] upsertProfile error:', result.error);
        }
      } catch (e) {
        console.warn('[useCloudSync] syncProfile failed:', e);
      }
    },
    []
  );

  return {
    syncStatus,
    syncError,
    lastSyncedAt,
    refreshCloudData,
    syncPosts,
    syncProfile,
  };
}