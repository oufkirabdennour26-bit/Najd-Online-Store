import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(30)
    .transform((val) => val.trim().toUpperCase()),
  discountPercent: z.number().positive('Discount percent must be positive').max(100),
  maxDiscount: z.number().positive('Max discount must be positive'),
  minSubtotal: z.number().nonnegative().optional(),
  isActive: z.boolean().optional().default(true),
  expiryDate: z.string().optional().nullable()
});

export const updateCouponSchema = createCouponSchema.partial();
