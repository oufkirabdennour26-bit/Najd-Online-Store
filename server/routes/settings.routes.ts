import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

// Public, read-only: storefront needs currency/shipping/tax/maintenance-mode info
router.get('/', asyncHandler(SettingsController.getPublicSettings));

export default router;
