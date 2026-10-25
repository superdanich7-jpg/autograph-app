/**
 * Analytics — обезличенная продуктовая аналитика (R-17, F-25).
 *
 * Без SDK и нативных зависимостей: события уходит батчем в PostHog /capture
 * (или совместимый endpoint) обычным fetch. Пока EXPO_PUBLIC_POSTHOG_KEY не
 * задан — полный no-op (MVP-демо трогать нельзя).
 *
 * Использование: import { track } from '../lib/analytics'; track('post_created', {...});
 */

const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || '';
const FLUSH_INTERVAL_MS = 10_000;
const MAX_QUEUE = 20;

type AnalyticsEvent = {
    event: string;
    properties?: Record<string, string | number | boolean | null | undefined>;
    timestamp: string;
};

let queue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

export function isAnalyticsConfigured(): boolean {
    return Boolean(POSTHOG_KEY);
}

export function track(event: string, properties?: AnalyticsEvent['properties']): void {
    if (!isAnalyticsConfigured()) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.debug(`[analytics] (no-op, ключ не задан) ${event}`, properties ?? {});
        }
        return;
    }
    queue.push({ event, properties: properties ?? {}, timestamp: new Date().toISOString() });
    if (queue.length >= MAX_QUEUE) {
        void flush();
    }
    ensureTimer();
}

function ensureTimer(): void {
    if (flushTimer || !isAnalyticsConfigured()) return;
    flushTimer = setInterval(() => void flush(), FLUSH_INTERVAL_MS);
}

/** Отправка батча. Ошибки сети тихо проглатываются — аналитика не должна ломать UX. */
export async function flush(): Promise<void> {
    if (queue.length === 0 || !isAnalyticsConfigured()) return;
    const batch = queue;
    queue = [];
    try {
        await fetch(`${POSTHOG_HOST}/batch/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: POSTHOG_KEY,
                batch: batch.map((e) => ({
                    event: e.event,
                    properties: { ...e.properties, $lib: 'autograph-app' },
                    timestamp: e.timestamp,
                })),
            }),
        });
    } catch {
        // Тихо: сеть/ключ — не повод показывать пользователю ошибку.
    }
}

/** Только для тестов: состояние очереди. */
export function _queueForTests(): AnalyticsEvent[] {
    return queue;
}

/** Только для тестов: сброс очереди и таймера. */
export function _resetForTests(): void {
    queue = [];
    if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
    }
}
