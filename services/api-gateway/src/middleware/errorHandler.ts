import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom error class
 */
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Default to 500 server error
    let statusCode = 500;
    let message = 'Internal server error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Log error
    if (statusCode >= 500) {
        logger.error('Server error:', {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            ip: req.ip
        });
    } else {
        logger.warn('Client error:', {
            message: err.message,
            url: req.url,
            method: req.method,
            statusCode
        });
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path
    });
};
