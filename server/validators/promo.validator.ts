import { z } from 'zod';

export const validatePromoSchema = z.object({
  body: z.object({
    code: z.string().min(1)
  })
});
