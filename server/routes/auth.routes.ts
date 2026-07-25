import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema
} from '../validators/auth.validator';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), asyncHandler(AuthController.register));
router.post('/login', authRateLimiter, validateRequest(loginSchema), asyncHandler(AuthController.login));
router.post('/logout', authenticate, asyncHandler(AuthController.logout));
router.post('/refresh', validateRequest(refreshTokenSchema), asyncHandler(AuthController.refreshToken));
router.post('/forgot-password', authRateLimiter, validateRequest(forgotPasswordSchema), asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', authRateLimiter, validateRequest(resetPasswordSchema), asyncHandler(AuthController.resetPassword));
router.post('/verify-email', validateRequest(verifyEmailSchema), asyncHandler(AuthController.verifyEmail));
router.get('/me', authenticate, asyncHandler(AuthController.getProfile));

export default router;
