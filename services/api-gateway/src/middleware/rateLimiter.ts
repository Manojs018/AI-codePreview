import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import redisClient from '../utils/redis';
import { logger } from '../utils/logger';

/**
 * Sliding window rate limiter using Redis
 */
class SlidingWindowRateLimiter {
    private windowMs: number;
    private maxRequests: number;

    constructor(windowMs: number, maxRequests: number) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    async isAllowed(key: string): Promise<{ allowed: boolean; remaining: number }> {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        const redisKey = `ratelimit:${key}`;

        try {
            // Get all timestamps in current window
            const timestamps = await redisClient.keys(`${redisKey}:*`);

            // Filter timestamps within window
            const validTimestamps = timestamps.filter(ts => {
                const timestamp = parseInt(ts.split(':')[2]);
                return timestamp > windowStart;
            });

            const requestCount = validTimestamps.length;

            if (requestCount >= this.maxRequests) {
                return { allowed: false, remaining: 0 };
            }

            // Add current request timestamp
            await redisClient.set(`${redisKey}:${now}`, '1', Math.ceil(this.windowMs / 1000));

            return { allowed: true, remaining: this.maxRequests - requestCount - 1 };
        } catch (error) {
            logger.error('Rate limiter error:', error);
            // Fail open - allow request if Redis is down
            return { allowed: true, remaining: this.maxRequests };
        }
    }
}

/**
 * Global rate limiter (100 requests per hour per IP)
 */
export const rateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * User-specific rate limiter
 */
export const userRateLimiter = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.user) {
        next();
        return;
    }

    const limiter = new SlidingWindowRateLimiter(60 * 60 * 1000, 100); // 100 req/hour
    const key = `user:${req.user.userId}`;

    const { allowed, remaining } = await limiter.isAllowed(key);

    res.setHeader('X-RateLimit-Remaining', remaining.toString());

    if (!allowed) {
        res.status(429).json({
            success: false,
            error: 'Rate limit exceeded'
        });
        return;
    }

    next();
};

/**
 * Webhook rate limiter (100 webhooks per minute)
 */
export const webhookRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
        success: false,
        error: 'Webhook rate limit exceeded'
    }
});

/**
 * Repository-specific rate limiter (50 analyses per day)
 */
export const repoRateLimiter = async (
    repoId: string
): Promise<{ allowed: boolean; remaining: number }> => {
    const limiter = new SlidingWindowRateLimiter(24 * 60 * 60 * 1000, 50); // 50 per day
    const key = `repo:${repoId}`;
    return await limiter.isAllowed(key);
};
