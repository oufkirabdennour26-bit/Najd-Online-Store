import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';
import { optionalAuth, authenticate } from '../middlewares/authMiddleware';
import { checkoutSchema } from '../validators/order.validator';

const router = Router();

router.post('/', optionalAuth, validateRequest(checkoutSchema), asyncHandler(OrderController.createOrder));
router.get('/', authenticate, asyncHandler(OrderController.getOrders));
router.get('/:id', optionalAuth, asyncHandler(OrderController.getOrderDetails));

export default router;
