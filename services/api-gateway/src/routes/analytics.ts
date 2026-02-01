import { Router } from 'express';

const router = Router();

// Placeholder - to be implemented
router.get('/developer', (_req, res) => {
    res.json({ success: true, data: { metrics: {} } });
});

router.get('/manager', (_req, res) => {
    res.json({ success: true, data: { metrics: {} } });
});

export default router;
