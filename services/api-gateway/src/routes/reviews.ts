import { Router } from 'express';

const router = Router();

// Placeholder - to be implemented
router.get('/', (_req, res) => {
    res.json({ success: true, data: { reviews: [] } });
});

router.get('/:id', (_req, res) => {
    res.json({ success: true, data: { review: null } });
});

router.get('/:id/issues', (_req, res) => {
    res.json({ success: true, data: { issues: [] } });
});

export default router;
