import { Router, Request, Response } from 'express';
import axios from 'axios';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { generateToken, generateRefreshToken, authenticate } from '../middleware/auth';
import { query } from '../utils/database';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = Router();

/**
 * @route   GET /api/auth/github
 * @desc    Redirect to GitHub OAuth
 * @access  Public
 */
router.get('/github', (_req: Request, res: Response) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user:email&redirect_uri=${process.env.GITHUB_CALLBACK_URL}`;
    res.redirect(githubAuthUrl);
});

/**
 * @route   GET /api/auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback', asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code) {
        throw new AppError('Authorization code not provided', 400);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code as string
        },
        {
            headers: { Accept: 'application/json' }
        }
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
        throw new AppError('Failed to obtain access token', 400);
    }

    // Fetch user profile from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` }
    });

    const githubUser = userResponse.data;

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(access_token);

    // Create or update user in database
    const result = await query(
        `INSERT INTO users (github_id, username, email, avatar_url, access_token_encrypted, token_expires_at)
     VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '1 hour')
     ON CONFLICT (github_id) 
     DO UPDATE SET 
       username = $2,
       email = $3,
       avatar_url = $4,
       access_token_encrypted = $5,
       token_expires_at = NOW() + INTERVAL '1 hour',
       updated_at = NOW()
     RETURNING id, github_id, username, email, role, avatar_url`,
        [
            githubUser.id,
            githubUser.login,
            githubUser.email,
            githubUser.avatar_url,
            encryptedAccessToken
        ]
    );

    const user = result.rows[0];

    // Generate JWT tokens
    const jwtToken = generateToken({
        userId: user.id,
        githubId: user.github_id,
        username: user.username,
        role: user.role
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
        githubId: user.github_id,
        username: user.username,
        role: user.role
    });

    logger.info(`User authenticated: ${user.username} (${user.id})`);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}&refresh=${refreshToken}`);
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
        `SELECT id, github_id, username, email, role, avatar_url, created_at
     FROM users
     WHERE id = $1`,
        [req.user!.userId]
    );

    if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
    }

    res.json({
        success: true,
        data: result.rows[0]
    });
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError('Refresh token not provided', 400);
    }

    // Verify refresh token (implementation depends on your refresh token strategy)
    // For now, generate new tokens
    const newToken = generateToken({
        userId: req.user!.userId,
        githubId: req.user!.githubId,
        username: req.user!.username,
        role: req.user!.role
    });

    res.json({
        success: true,
        data: { token: newToken }
    });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(async (req: Request, res: Response) => {
    // Clear tokens from database
    await query(
        `UPDATE users 
     SET access_token_encrypted = NULL, refresh_token_encrypted = NULL
     WHERE id = $1`,
        [req.user!.userId]
    );

    logger.info(`User logged out: ${req.user!.username}`);

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
}));

/**
 * Helper: Encrypt token using AES-256-GCM
 */
function encryptToken(token: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(
        process.env.ENCRYPTION_KEY || 'default-encryption-key',
        'salt',
        32
    );
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Helper: Decrypt token
 */
export function decryptToken(encryptedToken: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(
        process.env.ENCRYPTION_KEY || 'default-encryption-key',
        'salt',
        32
    );

    const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

export default router;
