import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../controllers/profile.validation';

const router = Router();

router.use(requireAuth); // every route below requires a logged-in user

router.get('/', profileController.getMyProfile);
router.patch('/', validate(updateProfileSchema), profileController.updateMyProfile);

export default router;
