import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

class RedisClient {
    private client: RedisClientType;
    private isConnected: boolean = false;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        this.client.on('error', (err) => {
            logger.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
            logger.info('✅ Redis connected');
            this.isConnected = true;
        });

        this.client.on('disconnect', () => {
            logger.warn('⚠️  Redis disconnected');
            this.isConnected = false;
        });
    }

    async connect(): Promise<void> {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.client.disconnect();
        }
    }

    /**
     * Get a value from Redis
     */
    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            logger.error(`Redis GET error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set a value in Redis
     */
    async set(key: string, value: string, expirySeconds?: number): Promise<void> {
        try {
            if (expirySeconds) {
                await this.client.setEx(key, expirySeconds, value);
            } else {
                await this.client.set(key, value);
            }
        } catch (error) {
            logger.error(`Redis SET error for key ${key}:`, error);
        }
    }

    /**
     * Delete a key from Redis
     */
    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            logger.error(`Redis DEL error for key ${key}:`, error);
        }
    }

    /**
     * Check if a key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Redis EXISTS error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Increment a counter
     */
    async incr(key: string): Promise<number> {
        try {
            return await this.client.incr(key);
        } catch (error) {
            logger.error(`Redis INCR error for key ${key}:`, error);
            return 0;
        }
    }

    /**
     * Set expiry on a key
     */
    async expire(key: string, seconds: number): Promise<void> {
        try {
            await this.client.expire(key, seconds);
        } catch (error) {
            logger.error(`Redis EXPIRE error for key ${key}:`, error);
        }
    }

    /**
     * Get multiple keys matching a pattern
     */
    async keys(pattern: string): Promise<string[]> {
        try {
            return await this.client.keys(pattern);
        } catch (error) {
            logger.error(`Redis KEYS error for pattern ${pattern}:`, error);
            return [];
        }
    }

    /**
     * Cache helper: get or set
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        expirySeconds: number = 3600
    ): Promise<T> {
        const cached = await this.get(key);

        if (cached) {
            try {
                return JSON.parse(cached) as T;
            } catch (error) {
                logger.error(`Error parsing cached value for key ${key}:`, error);
            }
        }

        const value = await fetchFn();
        await this.set(key, JSON.stringify(value), expirySeconds);
        return value;
    }
}

// Export singleton instance
const redisClient = new RedisClient();

// Connect on module load
redisClient.connect().catch((err) => {
    logger.error('Failed to connect to Redis:', err);
});

export default redisClient;
