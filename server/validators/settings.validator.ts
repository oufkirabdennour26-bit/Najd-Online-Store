import { z } from 'zod';

export const updateSettingsSchema = z.object({
  storeNameAr: z.string().min(2, 'Store name (Arabic) is required'),
  storeNameEn: z.string().min(2, 'Store name (English) is required'),
  supportEmail: z.string().email('Invalid support email'),
  supportPhone: z.string().min(6, 'Support phone is required'),
  currency: z.string().min(1, 'Currency is required').max(10),
  defaultShippingCost: z.number().nonnegative('Shipping cost cannot be negative'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
  isMaintenanceMode: z.boolean()
});
