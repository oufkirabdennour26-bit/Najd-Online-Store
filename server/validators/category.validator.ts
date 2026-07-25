import { z } from 'zod';

export const createCategorySchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  parentId: z.string().nullable().optional()
});

export const updateCategorySchema = createCategorySchema.partial();
