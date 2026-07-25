import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

const router = Router();

router.get('/', asyncHandler(CategoryController.getCategories));
router.get('/:id', asyncHandler(CategoryController.getCategoryById));

// Admin protected category routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createCategorySchema),
  asyncHandler(CategoryController.createCategory)
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(updateCategorySchema),
  asyncHandler(CategoryController.updateCategory)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(CategoryController.deleteCategory)
);

export default router;
