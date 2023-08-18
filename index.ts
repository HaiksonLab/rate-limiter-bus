import {IRateLimiterStoreOptions, RateLimiterAbstract, RateLimiterRedis} from 'rate-limiter-flexible';
import * as timestring from "timestring";

class RateLimitError   extends Error {}
class RateLimitReached extends RateLimitError {
	constructor(
		public message: string,
		public data: any,
	) {
		super();
	}
}

class RateLimiterBus {
	protected limiters = [];

	constructor(
		protected readonly name: string,
		protected readonly rate_limiter: typeof RateLimiterAbstract,
		protected readonly options?: IRateLimiterStoreOptions
	) {
	}

	limit(per: string | number, points: number, options?: IRateLimiterStoreOptions) {
		const duration = (typeof per === 'string')? (timestring as any).default(per) : per;

		this.limiters.push(
			//@ts-ignore
			new this.rate_limiter({keyPrefix: `${this.name}_${duration}`, points, duration, ...options, ...this.options})
		);
		return this;
	}

	async forceConsume(key: string, points: number = 1) {
		//@ts-ignore
		const settled = await Promise.allSettled( this.limiters.map(a=>a.consume(key, points)) );

		const ress = settled
			//@ts-ignore
			.map(a=>a.value && {reached: false, ...a.value} || a.reason && {reached: true, ...a.reason})
			.sort((a,b) => a.msBeforeNext - b.msBeforeNext)

		const reached 	   = ress.some(a=>a.reached);
		const reachedNow   = reached || ress.some(a=>!a.reached && !a._remainingPoints);
		const msBeforeNext = Math.max(...ress.map(a=>a.reached || !a.reached && !a._remainingPoints? a._msBeforeNext : 0));


		return {
			reached,
			reachedNow,
			beforeNext: reachedNow? Math.round(msBeforeNext/1000) || 1 : 0,
			// ress
		};
	}

	async get(key: string) {
		//@ts-ignore
		const settled = await Promise.allSettled( this.limiters.map(a=>a.get(key)) );

		//@ts-ignore
		const ress = settled.map((a, i) => a.value
			//@ts-ignore
			? {reached: a.value.remainingPoints === 0, ...a.value, /*max_points: this.limiters[i]._points*/}
			//@ts-ignore
			: {reached: false, _msBeforeNext: 0, /*max_points: this.limiters[i]._points*/}
		)

		const reached 	   = ress.some(a=>a.reached);
		const msBeforeNext = Math.max(...ress.map(a=>a.reached? a._msBeforeNext : 0));


		return {
			reached,
			beforeNext: reached? Math.round(msBeforeNext/1000) || 1 : 0,
			// ress,
		};
	}

	async consume(key: string) {
		await this.check(key);
		const res = await this.forceConsume(key);
		if (res.reached) throw new RateLimitReached('Rate limit reached', {name: this.name, key, ...res});
		return res;
	}

	async check(key: string) {
		const res = await this.get(key);
		if (res.reached) throw new RateLimitReached('Rate limit reached', {name: this.name, key, ...res});
		return res;
	}

	async delete(key: string) {
		//@ts-ignore
		await Promise.allSettled( this.limiters.map(a=>a.delete(key)) );
		return true;
	}

}

function WithComplex<
	Limiters extends Record<string, any>,
	LimitersExtended extends Limiters & { consume(by: Record<keyof Limiters, string>): ReturnType<typeof RateLimiterBus["prototype"]["consume"]> }
	>(obj: Limiters): LimitersExtended {
	//@ts-ignore
	obj.consume = async function consume(by) {
		for (const [key, value] of Object.entries(by)) {
			await obj[key].consume(value)
		}
	}
	//@ts-ignore
	return obj;
}

export {
	RateLimiterBus,
	RateLimitError,
	RateLimitReached,
	RateLimiterRedis,
	WithComplex
}