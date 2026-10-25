/**
 * Тесты lib/cloud-health.ts (R-03, F-04).
 * Все сетевые зависимости инжектятся — реальной сети в тестах нет.
 */
import {
    CloudHealth,
    DEFAULT_HEALTH_TTL_MS,
    classifyHealthResponse,
    createCloudHealthChecker,
    isCacheFresh,
} from '../cloud-health';

const URL_OK = 'https://example.supabase.co';
const KEY = 'test-key';

function okResponse(status = 200): Response {
    return { ok: status >= 200 && status < 300, status } as unknown as Response;
}

describe('isCacheFresh', () => {
    it('свежий внутри TTL', () => {
        expect(isCacheFresh(1_000, 1_000 + DEFAULT_HEALTH_TTL_MS - 1, DEFAULT_HEALTH_TTL_MS)).toBe(true);
    });
    it('протухший после TTL', () => {
        expect(isCacheFresh(1_000, 1_000 + DEFAULT_HEALTH_TTL_MS, DEFAULT_HEALTH_TTL_MS)).toBe(false);
    });
});

describe('classifyHealthResponse', () => {
    it.each([
        [200, true],
        [204, true],
        [401, false],
        [502, false],
        [540, false],
    ])('статус %i -> healthy %s', (status, expected) => {
        expect(classifyHealthResponse(status)).toBe(expected);
    });
});

describe('createCloudHealthChecker', () => {
    it('не настроен (нет url/ключа) -> unhealthy fast, сеть не трогаем', async () => {
        let calls = 0;
        const check = createCloudHealthChecker('', '', {
            fetchImpl: async () => {
                calls += 1;
                return okResponse();
            },
            now: () => 0,
        });
        const result = await check();
        expect(result.healthy).toBe(false);
        expect(result.reason).toBe('not-configured');
        expect(calls).toBe(0);
    });

    it('живой ответ 200 -> healthy, причина ok', async () => {
        const check = createCloudHealthChecker(URL_OK, KEY, {
            fetchImpl: async () => okResponse(200),
            now: () => 0,
        });
        const result = await check();
        expect(result.healthy).toBe(true);
        expect(result.reason).toBe('ok');
    });

    it('5xx (пауза проекта) -> unhealthy c причиной http-<status>', async () => {
        const check = createCloudHealthChecker(URL_OK, KEY, {
            fetchImpl: async () => okResponse(540),
            now: () => 0,
        });
        const result = await check();
        expect(result.healthy).toBe(false);
        expect(result.reason).toBe('http-540');
    });

    it('сетевой сбой -> unhealthy, причина network', async () => {
        const check = createCloudHealthChecker(URL_OK, KEY, {
            fetchImpl: async () => {
                throw new TypeError('fetch failed');
            },
            now: () => 0,
        });
        const result = await check();
        expect(result.healthy).toBe(false);
        expect(result.reason).toBe('network');
    });

    it('таймаут (fetch висит) -> unhealthy, причина timeout', async () => {
        const check = createCloudHealthChecker(URL_OK, KEY, {
            fetchImpl: (_url, init) =>
                new Promise<Response>((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () => {
                        const err = new Error('aborted');
                        err.name = 'AbortError';
                        reject(err);
                    });
                }),
            now: () => 0,
            timeoutMs: 30,
        });
        const result = await check();
        expect(result.healthy).toBe(false);
        expect(result.reason).toBe('timeout');
    });

    it('кэш: повторный вызов в пределах TTL не ходит в сеть', async () => {
        let calls = 0;
        let clock = 0;
        const check = createCloudHealthChecker(URL_OK, KEY, {
            fetchImpl: async () => {
                calls += 1;
                return okResponse();
            },
            now: () => clock,
            ttlMs: 1000,
        });
        const first = await check();
        clock += 999;
        const second = await check();
        expect(calls).toBe(1);
        expect(first.healthy).toBe(true);
        expect(second.checkedAt).toBe(first.checkedAt);
    });

    it('кэш истёк -> новая проверка уходит в сеть', async () => {
        let calls = 0;
        let clock = 0;
        const check = createCloudHealthChecker(URL_OK, KEY, {
            fetchImpl: async () => {
                calls += 1;
                return okResponse();
            },
            now: () => clock,
            ttlMs: 1000,
        });
        await check();
        clock += 1000;
        await check();
        expect(calls).toBe(2);
    });

    it('негативный результат тоже кэшируется (нет спама запросами при лежащем облаке)', async () => {
        let calls = 0;
        let clock = 0;
        const check = createCloudHealthChecker(URL_OK, KEY, {
            fetchImpl: async () => {
                calls += 1;
                throw new TypeError('fetch failed');
            },
            now: () => clock,
            ttlMs: 1000,
        });
        await check();
        await check();
        expect(calls).toBe(1);
    });
});
