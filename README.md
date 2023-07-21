# RateLimiterBus for Node.js

```typescript
import {RateLimiterBus} from "rate-limiter-bus";
import {RateLimiterRedis} from "rate-limiter-flexible";
import redis from 'redis';

const storeClient = redis.createClient({url: process.env.REDIS_URL, disableOfflineQueue: true, legacyMode: true});
      storeClient.connect();

const Limiter = new RateLimiterBus('WrongPassword.byUserId', RateLimiterRedis, {storeClient})
    .limit('5m', 10)
    .limit('30m', 15)
    .limit('3h', 20)

try {
    await Limiter.consume(user_id);
} catch (error) {
    if (error.constructor.name === 'RateLimitReached') {
        throw "Too many attempts";
    } else {
        throw "Other error";
    }
}

login();
```