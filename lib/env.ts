/**
 * Environment Configuration — валидация переменных окружения.
 * В продакшн-приложениях env переменные валидируются при запуске:
 * - Ловит ошибки конфигурации до выполнения кода
 * - Предоставляет типизированный доступ к переменным
 * - Убирает необходимость в non-null assertions (!)
 */

const ENV = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  EXPO_PUBLIC_APP_ENV: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
    | 'development'
    | 'staging'
    | 'production',
} as const;

// ─── Validators ────────────────────────────────

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidSupabaseUrl(url: string): boolean {
  return isValidUrl(url) && url.includes('.supabase.co');
}

// ─── Config Object ─────────────────────────────

export const config = {
  supabase: {
    url: ENV.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: ENV.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    isConfigured: Boolean(
      ENV.EXPO_PUBLIC_SUPABASE_URL &&
        ENV.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
        isValidSupabaseUrl(ENV.EXPO_PUBLIC_SUPABASE_URL)
    ),
  },
  app: {
    env: ENV.EXPO_PUBLIC_APP_ENV,
    isProduction: ENV.EXPO_PUBLIC_APP_ENV === 'production',
    isDevelopment: ENV.EXPO_PUBLIC_APP_ENV === 'development',
  },
} as const;

// ─── Validation on Startup ─────────────────────

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!ENV.EXPO_PUBLIC_SUPABASE_URL) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is not set');
  } else if (!isValidSupabaseUrl(ENV.EXPO_PUBLIC_SUPABASE_URL)) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is not a valid Supabase URL');
  }

  if (!ENV.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}