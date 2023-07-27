import { IRateLimiterStoreOptions, RateLimiterAbstract, RateLimiterRedis } from 'rate-limiter-flexible';
declare class RateLimitError extends Error {
}
declare class RateLimitReached extends RateLimitError {
    message: string;
    data: any;
    constructor(message: string, data: any);
}
declare class RateLimiterBus {
    protected readonly name: string;
    protected readonly rate_limiter: typeof RateLimiterAbstract;
    protected readonly options?: IRateLimiterStoreOptions;
    protected limiters: any[];
    constructor(name: string, rate_limiter: typeof RateLimiterAbstract, options?: IRateLimiterStoreOptions);
    limit(per: string | number, points: number, options?: IRateLimiterStoreOptions): this;
    forceConsume(key: string, points?: number): Promise<{
        reached: any;
        reachedNow: any;
        beforeNext: number;
    }>;
    get(key: string): Promise<{
        reached: any;
        beforeNext: number;
    }>;
    consume(key: string): Promise<{
        reached: any;
        reachedNow: any;
        beforeNext: number;
    }>;
    check(key: string): Promise<{
        reached: any;
        beforeNext: number;
    }>;
    delete(key: string): Promise<boolean>;
}
export { RateLimiterBus, RateLimitError, RateLimitReached, RateLimiterRedis, };
