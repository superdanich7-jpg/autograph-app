import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const memoryStorage = new Map<string, string>();

const webStorage = {
  getItem: (key: string) => {
    if (typeof localStorage === 'undefined') {
      return memoryStorage.get(key) ?? null;
    }
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof localStorage === 'undefined') {
      memoryStorage.set(key, value);
      return;
    }
    localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof localStorage === 'undefined') {
      memoryStorage.delete(key);
      return;
    }
    localStorage.removeItem(key);
  },
};

const secureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') return webStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      webStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      webStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Supabase клиент.
 * Внимание: если .env не настроен, клиент все равно создается,
 * но все запросы будут проверять isSupabaseConfigured перед выполнением.
 * Это безопасно, так как в коде везде есть guard-проверки.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: secureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : ({} as ReturnType<typeof createClient>);

