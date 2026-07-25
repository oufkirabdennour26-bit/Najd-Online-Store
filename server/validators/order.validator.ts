import { z } from 'zod';

export const checkoutSchema = z.object({
  shipping: z.object({
    fullName: z.string().min(2, 'Full name required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(6, 'Phone required'),
    address: z.string().min(3, 'Address required'),
    city: z.string().min(2, 'City required'),
    zipCode: z.string().min(3, 'Zip code required')
  }),
  payment: z.object({
    method: z.enum(['card', 'cod']),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional()
  }),
  // NOTE: price/nameAr/nameEn are accepted for backward compatibility with the
  // client payload shape, but the server NEVER trusts them - it always looks up
  // the authoritative product data (price, name, stock) from the database itself.
  items: z.array(
    z.object({
      productId: z.string().min(1),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      price: z.number().optional(),
      quantity: z.number().int().positive()
    })
  ).min(1, 'Cart cannot be empty'),
  // subtotal/shippingCost/discount/total are likewise accepted but recomputed
  // server-side; they are never used to determine the actual order amount.
  subtotal: z.number().optional(),
  shippingCost: z.number().nonnegative().optional(),
  discount: z.number().optional(),
  total: z.number().optional(),
  promoCode: z.string().optional()
});
