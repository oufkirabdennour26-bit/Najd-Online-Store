import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';
import { uploadProductImage } from '../middlewares/uploadMiddleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

// Public Product Discovery Routes
router.get('/', asyncHandler(ProductController.getProducts));
router.get('/newest', asyncHandler(ProductController.getNewestProducts));
router.get('/featured', asyncHandler(ProductController.getFeaturedProducts));
router.get('/:id', asyncHandler(ProductController.getProductById));

// Admin Protected Image Upload
router.post(
  '/upload',
  authenticate,
  authorize('admin'),
  uploadProductImage.single('image'),
  asyncHandler(ProductController.uploadImage)
);

// Admin Protected Product Lifecycle & Management Routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createProductSchema),
  asyncHandler(ProductController.createProduct)
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(updateProductSchema),
  asyncHandler(ProductController.updateProduct)
);

router.post(
  '/:id/soft-delete',
  authenticate,
  authorize('admin'),
  asyncHandler(ProductController.softDeleteProduct)
);

router.patch(
  '/:id/soft-delete',
  authenticate,
  authorize('admin'),
  asyncHandler(ProductController.softDeleteProduct)
);

router.post(
  '/:id/restore',
  authenticate,
  authorize('admin'),
  asyncHandler(ProductController.restoreProduct)
);

router.patch(
  '/:id/restore',
  authenticate,
  authorize('admin'),
  asyncHandler(ProductController.restoreProduct)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(ProductController.deleteProduct)
);

export default router;
