// Main entry point for API Gateway
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authenticate } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import repoRoutes from './routes/repositories';
import reviewRoutes from './routes/reviews';
import analyticsRoutes from './routes/analytics';
import webhookRoutes from './routes/webhooks';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: { write: (message: string) => logger.info(message.trim()) }
    }));
}

// Rate limiting
app.use('/api', rateLimiter);

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/repos', authenticate, repoRoutes);
app.use('/api/reviews', authenticate, reviewRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: _req.path
    });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = createServer(app);

server.listen(PORT, () => {
    logger.info(`🚀 API Gateway running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
});

export default app;
