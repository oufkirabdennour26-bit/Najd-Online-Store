import { z } from 'zod';

export const createProductSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  originalPrice: z.number().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  status: z.enum(['Active', 'Hidden', 'OutOfStock']).optional(),
  isFeatured: z.boolean().optional(),
  image: z.string().optional(),
  nameAr: z.string().min(1, 'Arabic name is required'),
  descAr: z.string().optional(),
  featuresAr: z.any().optional(),
  specsAr: z.any().optional(),
  nameEn: z.string().min(1, 'English name is required'),
  descEn: z.string().optional(),
  featuresEn: z.any().optional(),
  specsEn: z.any().optional()
});

export const updateProductSchema = createProductSchema.partial();
