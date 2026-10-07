import { Router } from 'express';
import * as schemeController from '../controllers/scheme.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public — "Browse all government schemes, no login required"
router.get('/', schemeController.browseSchemes);

// Auth required — personalised matches must come before the ":id" route
router.get('/eligible', requireAuth, schemeController.getMyEligibleSchemes);

router.get('/:id', schemeController.getSchemeById);

export default router;
