import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface JWTPayload {
    userId: string;
    githubId: number;
    username: string;
    role: 'developer' | 'manager' | 'admin';
    iat: number;
    exp: number;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'No token provided'
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        ) as JWTPayload;

        // Attach user to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        } else {
            logger.error('Authentication error:', error);
            res.status(500).json({
                success: false,
                error: 'Authentication failed'
            });
        }
    }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
            return;
        }

        next();
    };
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key',
        {
            expiresIn: '1h'
        }
    );
};

/**
 * Generate refresh token (longer expiry)
 */
export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        {
            expiresIn: '7d'
        }
    );
};
