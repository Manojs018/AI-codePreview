import { Pool, PoolClient } from 'pg';
import { logger } from './logger';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
    logger.info('✅ Database connected');
});

pool.on('error', (err: Error) => {
    logger.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

/**
 * Execute a query
 */
export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Executed query', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        logger.error('Database query error:', { text, error });
        throw error;
    }
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = async (): Promise<PoolClient> => {
    const client = await pool.connect();
    return client;
};

/**
 * Execute a transaction
 */
export const transaction = async <T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Close all connections (for graceful shutdown)
 */
export const closePool = async () => {
    await pool.end();
    logger.info('Database pool closed');
};

export default {
    query,
    getClient,
    transaction,
    closePool
};
