/**
 * withTimeout — обёртка над промисом с жёстким таймаутом.
 * Используется для вызовов к Supabase: из некоторых регионов (в т.ч. РФ)
 * облако может отвечать очень долго — вместо бесконечной загрузки
 * промист отклоняется с честной ошибкой.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(
            () => reject(new Error('Сервер не отвечает в течение ' + ms / 1000 + ' секунд')),
            ms,
        );
    });
    return Promise.race([promise, timeout]).finally(() => {
        if (timer) clearTimeout(timer);
    });
}
