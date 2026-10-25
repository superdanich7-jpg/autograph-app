/**
 * Cloud Health — быстрый предфильтр доступности облака Supabase (R-03, F-04).
 *
 * Проблема: при мёртвой/спящей БД каждое сетевое обращение висит до таймаута,
 * статус уходит в 'error' и профиль вечно показывает «Нужно проверить подключение».
 * Решение: перед сетевыми операциями — дешёвый GET /auth/v1/health с жёстким
 * таймаутом (по умолчанию 5с) и кэшем результата (TTL по умолчанию 60с).
 * Недоступно → syncStatus='offline' (демо-режим) вместо бесконечных ошибок.
 *
 * Экспорты:
 *   - createCloudHealthChecker(url, anonKey, deps?) — фабрика (тестируемая: fetch/now/timeouts инжектятся)
 *   - checkCloudHealth — синглтон на process.env (использует PostsContext)
 *   - isCacheFresh, classifyHealthResponse — чистые функции для unit-тестов
 */

export type CloudHealth = {
    healthy: boolean;
    checkedAt: number;
    /** not-configured | timeout | network | http-<status> | ok */
    reason: string;
};

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export type HealthCheckerDeps = {
    fetchImpl: FetchLike;
    now: () => number;
    timeoutMs: number;
    ttlMs: number;
};

export const DEFAULT_HEALTH_TIMEOUT_MS = 5000;
export const DEFAULT_HEALTH_TTL_MS = 60_000;

/** Свеж ли кэш health-проверки (чистая функция для тестов). */
export function isCacheFresh(checkedAt: number, now: number, ttlMs: number): boolean {
    return now - checkedAt < ttlMs;
}

/** Классификация HTTP-ответа /auth/v1/health (чистая функция для тестов). */
export function classifyHealthResponse(status: number): boolean {
    // 200 — живой проект. Пауза/восстановление дают 5xx — считаем облако недоступным.
    return status >= 200 && status < 300;
}

export function createCloudHealthChecker(
    supabaseUrl: string | undefined,
    anonKey: string | undefined,
    deps?: Partial<HealthCheckerDeps>
): () => Promise<CloudHealth> {
    const resolved: HealthCheckerDeps = {
        fetchImpl: deps?.fetchImpl ?? ((url, init) => fetch(url, init)),
        now: deps?.now ?? (() => Date.now()),
        timeoutMs: deps?.timeoutMs ?? DEFAULT_HEALTH_TIMEOUT_MS,
        ttlMs: deps?.ttlMs ?? DEFAULT_HEALTH_TTL_MS,
    };

    let cache: CloudHealth | null = null;

    return async function checkCloudHealth(): Promise<CloudHealth> {
        const now = resolved.now();
        if (!supabaseUrl || !anonKey) {
            return { healthy: false, checkedAt: now, reason: 'not-configured' };
        }
        if (cache && isCacheFresh(cache.checkedAt, now, resolved.ttlMs)) {
            return cache;
        }

        const controller = new AbortController();
        const abortTimer = setTimeout(() => controller.abort(), resolved.timeoutMs);

        try {
            const response = await resolved.fetchImpl(`${supabaseUrl}/auth/v1/health`, {
                method: 'GET',
                headers: { apikey: anonKey },
                signal: controller.signal,
            });
            const healthy = classifyHealthResponse(response.status);
            cache = { healthy, checkedAt: resolved.now(), reason: healthy ? 'ok' : `http-${response.status}` };
            return cache;
        } catch (error) {
            const aborted = error instanceof Error && error.name === 'AbortError';
            cache = { healthy: false, checkedAt: resolved.now(), reason: aborted ? 'timeout' : 'network' };
            return cache;
        } finally {
            clearTimeout(abortTimer);
        }
    };
}

export const checkCloudHealth = createCloudHealthChecker(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);
