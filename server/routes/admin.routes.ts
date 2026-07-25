import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { loginSchema } from '../validators/auth.validator';
import { SettingsController } from '../controllers/settings.controller';
import { updateSettingsSchema } from '../validators/settings.validator';
import { CouponController } from '../controllers/coupon.controller';
import { createCouponSchema, updateCouponSchema } from '../validators/coupon.validator';

const router = Router();

router.post('/login', authRateLimiter, validateRequest(loginSchema), asyncHandler(AdminController.login));

// جميع مسارات الإدارة التالية تتطلب مصادقة وصلاحيات أدمن
router.use(authenticate, authorize('admin'));

router.get('/stats', asyncHandler(AdminController.getStats));
router.get('/orders', asyncHandler(AdminController.getOrders));
router.patch('/orders/:id/status', asyncHandler(AdminController.updateOrderStatus));
router.get('/orders/:id/history', asyncHandler(AdminController.getOrderHistory));
router.get('/inventory/logs', asyncHandler(AdminController.getInventoryLogs));
router.post('/inventory/adjust', asyncHandler(AdminController.adjustStock));
router.get('/customers', asyncHandler(AdminController.getCustomers));

// مسار تغيير كلمة المرور الخاص بالأدمن
router.post('/change-password', asyncHandler(AdminController.changePassword));

router.get('/settings', asyncHandler(SettingsController.getSettings));
router.put('/settings', validateRequest(updateSettingsSchema), asyncHandler(SettingsController.updateSettings));

router.get('/coupons', asyncHandler(CouponController.getCoupons));
router.post('/coupons', validateRequest(createCouponSchema), asyncHandler(CouponController.createCoupon));
router.put('/coupons/:id', validateRequest(updateCouponSchema), asyncHandler(CouponController.updateCoupon));
router.delete('/coupons/:id', asyncHandler(CouponController.deleteCoupon));

export default router;