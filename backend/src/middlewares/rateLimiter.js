const tokenBuckets = new Map();

class TockenBucket {
    constructor(bucketCapacity, refillRate) {
        this.bucketCapacity = bucketCapacity;
        this.refillRate = refillRate;
        this.tokens = bucketCapacity;
        this.lastRefillTimestamp = Date.now();
    }

    refill() {
        const now = Date.now();
        const timeElapsed = (now - this.lastRefillTimestamp) / 1000;
        const tokensToAdd = timeElapsed * this.refillRate;

        this.tokens = Math.min(this.bucketCapacity, this.tokens + tokensToAdd);
        this.lastRefillTimestamp = now;
    }

    tryConsume(tokensToConsume) {
        this.refill();

        if (this.tokens >= tokensToConsume) {
            this.tokens -= tokensToConsume;
            return true;
        } else {
            return false;
        }
    }
}

const rateLimiter = (bucketCapacity, refillRate, tokensPerRequest = 1) => {
    return (req, res, next) => {
        const clientIp = req.ip || req.connection.remoteAddress;
        if (!tokenBuckets.has(clientIp)) {
            tokenBuckets.set(clientIp, new TockenBucket(bucketCapacity, refillRate));
        }

        const bucket = tokenBuckets.get(clientIp);

        if (bucket.tryConsume(tokensPerRequest)) {
            next();
        } else {
            const retryAfter = Math.ceil(300 - (Date.now() - bucket.lastRefillTimestamp) / 1000);
            res.setHeader("X-Ratelimit-Limit", bucketCapacity);
            res.setHeader("X-Ratelimit-Remaining", 0);
            res.setHeader("X-Ratelimit-Retry-After", retryAfter);
            res.status(429).send(`Too many requests. Try again in ${retryAfter} seconds.`);
        }
    }
}

export default rateLimiter;