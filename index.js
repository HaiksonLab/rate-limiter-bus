"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithComplex = exports.RateLimiterRedis = exports.RateLimitReached = exports.RateLimitError = exports.RateLimiterBus = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
Object.defineProperty(exports, "RateLimiterRedis", { enumerable: true, get: function () { return rate_limiter_flexible_1.RateLimiterRedis; } });
const timestring = __importStar(require("timestring"));
class RateLimitError extends Error {
}
exports.RateLimitError = RateLimitError;
class RateLimitReached extends RateLimitError {
    message;
    data;
    constructor(message, data) {
        super();
        this.message = message;
        this.data = data;
    }
}
exports.RateLimitReached = RateLimitReached;
class RateLimiterBus {
    name;
    rate_limiter;
    options;
    limiters = [];
    constructor(name, rate_limiter, options) {
        this.name = name;
        this.rate_limiter = rate_limiter;
        this.options = options;
    }
    limit(per, points, options) {
        const duration = (typeof per === 'string') ? timestring.default(per) : per;
        this.limiters.push(
        //@ts-ignore
        new this.rate_limiter({ keyPrefix: `${this.name}_${duration}`, points, duration, ...options, ...this.options }));
        return this;
    }
    async forceConsume(key, points = 1) {
        //@ts-ignore
        const settled = await Promise.allSettled(this.limiters.map(a => a.consume(key, points)));
        const ress = settled
            //@ts-ignore
            .map(a => a.value && { reached: false, ...a.value } || a.reason && { reached: true, ...a.reason })
            .sort((a, b) => a.msBeforeNext - b.msBeforeNext);
        const reached = ress.some(a => a.reached);
        const reachedNow = reached || ress.some(a => !a.reached && !a._remainingPoints);
        const msBeforeNext = Math.max(...ress.map(a => a.reached || !a.reached && !a._remainingPoints ? a._msBeforeNext : 0));
        return {
            reached,
            reachedNow,
            beforeNext: reachedNow ? Math.round(msBeforeNext / 1000) || 1 : 0,
            // ress
        };
    }
    async get(key) {
        //@ts-ignore
        const settled = await Promise.allSettled(this.limiters.map(a => a.get(key)));
        //@ts-ignore
        const ress = settled.map((a, i) => a.value
            //@ts-ignore
            ? { reached: a.value.remainingPoints === 0, ...a.value, /*max_points: this.limiters[i]._points*/ }
            //@ts-ignore
            : { reached: false, _msBeforeNext: 0, /*max_points: this.limiters[i]._points*/ });
        const reached = ress.some(a => a.reached);
        const msBeforeNext = Math.max(...ress.map(a => a.reached ? a._msBeforeNext : 0));
        return {
            reached,
            beforeNext: reached ? Math.round(msBeforeNext / 1000) || 1 : 0,
            // ress,
        };
    }
    async consume(key) {
        await this.check(key);
        const res = await this.forceConsume(key);
        if (res.reached)
            throw new RateLimitReached('Rate limit reached', { name: this.name, key, ...res });
        return res;
    }
    async check(key) {
        const res = await this.get(key);
        if (res.reached)
            throw new RateLimitReached('Rate limit reached', { name: this.name, key, ...res });
        return res;
    }
    async delete(key) {
        //@ts-ignore
        await Promise.allSettled(this.limiters.map(a => a.delete(key)));
        return true;
    }
}
exports.RateLimiterBus = RateLimiterBus;
function WithComplex(obj) {
    //@ts-ignore
    obj.consume = async function consume(by) {
        for (const [key, value] of Object.entries(by)) {
            await obj[key].consume(value);
        }
    };
    //@ts-ignore
    return obj;
}
exports.WithComplex = WithComplex;
