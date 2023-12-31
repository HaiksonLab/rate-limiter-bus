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
    protected readonly options?: IRateLimiterStoreOptions | undefined;
    protected limiters: never[];
    constructor(name: string, rate_limiter: typeof RateLimiterAbstract, options?: IRateLimiterStoreOptions | undefined);
    limit(per: string | number, points: number, options?: IRateLimiterStoreOptions): this;
    forceConsume(key: string | number, points?: number): Promise<{
        reached: boolean;
        reachedNow: boolean;
        beforeNext: number;
    }>;
    get(key: string | number): Promise<{
        reached: boolean;
        beforeNext: number;
    }>;
    consume(key: string | number): Promise<{
        reached: boolean;
        reachedNow: boolean;
        beforeNext: number;
    }>;
    check(key: string | number): Promise<{
        reached: boolean;
        beforeNext: number;
    }>;
    delete(key: string | number): Promise<boolean>;
}
declare function WithComplex<Limiters extends Record<string, any>, LimitersExtended extends Limiters & {
    consume(by: {
        [K in keyof Limiters]?: string | number;
    }): ReturnType<typeof RateLimiterBus["prototype"]["consume"]>;
}>(obj: Limiters): LimitersExtended;
export { RateLimiterBus, RateLimitError, RateLimitReached, RateLimiterRedis, WithComplex };
