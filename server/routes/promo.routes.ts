import { Router } from 'express';
import { PromoController } from '../controllers/promo.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.post('/validate', asyncHandler(PromoController.validate));

export default router;
