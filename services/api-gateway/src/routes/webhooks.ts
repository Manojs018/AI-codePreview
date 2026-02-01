import { Router } from 'express';

const router = Router();

// Placeholder - to be implemented
router.post('/github', (_req, res) => {
    res.json({ success: true, message: 'Webhook received' });
});

export default router;
