import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import schemeRoutes from './scheme.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.get('/health', (_req, res) => res.status(200).json({ success: true, status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/schemes', schemeRoutes);
router.use('/notifications', notificationRoutes);

export default router;
