import { apiClient } from '../api/client';
import { Order } from '../types';

export const orderService = {
  async validatePromo(code: string, subtotal: number): Promise<{ valid: boolean; discountPercent: number }> {
    return apiClient.post<{ valid: boolean; discountPercent: number }>('/api/promo/validate', { code, subtotal });
  },

  // تصحيح المسار من /api/checkout إلى /api/orders المطابق للسيرفر
  async checkout(payload: any): Promise<any> {
    return apiClient.post<any>('/api/orders', payload);
  },

  async trackOrder(orderId: string, secureToken: string): Promise<Order> {
    return apiClient.get<Order>(`/api/orders/${encodeURIComponent(orderId.trim())}`, {
      token: secureToken.trim(),
    });
  },
};