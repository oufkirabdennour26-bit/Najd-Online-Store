import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';
import { updateUserProfileSchema } from '../validators/user.validator';

const router = Router();

router.get('/me', authenticate, asyncHandler(UserController.getProfile));
router.put('/me', authenticate, validateRequest(updateUserProfileSchema), asyncHandler(UserController.updateProfile));

// Admin only user management
router.get('/all', authenticate, authorize('admin'), asyncHandler(UserController.getAllUsers));

export default router;
