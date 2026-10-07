import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { startLoginSchema, completeLoginSchema, refreshSchema } from '../controllers/auth.validation';

const router = Router();

router.post('/otp/request', validate(startLoginSchema), authController.requestOtp);
router.post('/otp/verify', validate(completeLoginSchema), authController.verifyOtp);
router.post('/refresh', validate(refreshSchema), authController.refresh);

export default router;
