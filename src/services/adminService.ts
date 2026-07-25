import { apiClient } from '../api/client';
import { Product, Category } from '../types';
import {
  AdminStats,
  AdminOrder,
  AdminCustomer,
  ProductFormData,
  CategoryFormData,
  CouponFormData,
  StoreSettingsFormData,
} from '../types/admin';

export const adminService = {
  async login(email: string, password: string): Promise<{ success: boolean; admin: any }> {
    return apiClient.post<{ success: boolean; admin: any }>('/api/admin/login', { email, password });
  },

  async logout(): Promise<any> {
    return apiClient.post<any>('/api/auth/logout');
  },

  async getMe(): Promise<{ success: boolean; data: any }> {
    return apiClient.get<{ success: boolean; data: any }>('/api/auth/me');
  },

  // دالة تغيير كلمة المرور للأدمن
  async changePassword(oldPassword: string, newPassword: string): Promise<any> {
    return apiClient.post<any>('/api/admin/change-password', { oldPassword, newPassword });
  },

  async getStats(): Promise<AdminStats> {
    return apiClient.get<AdminStats>('/api/admin/stats');
  },

  async getOrders(): Promise<AdminOrder[]> {
    return apiClient.get<AdminOrder[]>('/api/admin/orders');
  },

  async getCustomers(): Promise<AdminCustomer[]> {
    return apiClient.get<AdminCustomer[]>('/api/admin/customers');
  },

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    return apiClient.request(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async saveProduct(data: ProductFormData): Promise<Product> {
    const payload = {
      category: data.category,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      stock: Number(data.stock),
      lowStockThreshold: data.lowStockThreshold ? Number(data.lowStockThreshold) : 5,
      sku: data.sku || undefined,
      barcode: data.barcode || undefined,
      status: data.status || 'Active',
      isFeatured: Boolean(data.isFeatured),
      image: data.image,
      nameAr: data.nameAr,
      descAr: data.descAr || undefined,
      nameEn: data.nameEn,
      descEn: data.descEn || undefined,
      featuresAr: data.featuresAr,
      featuresEn: data.featuresEn,
      specsAr: data.specsAr,
      specsEn: data.specsEn,
    };

    const isEdit = Boolean(data.id);
    const path = isEdit ? `/api/products/${data.id}` : '/api/products';
    
    if (isEdit) {
      return apiClient.put<Product>(path, payload);
    } else {
      return apiClient.post<Product>(path, payload);
    }
  },

  async softDeleteProduct(id: string): Promise<any> {
    return apiClient.post<any>(`/api/products/${id}/soft-delete`);
  },

  async restoreProduct(id: string): Promise<any> {
    return apiClient.post<any>(`/api/products/${id}/restore`);
  },

  async deleteProduct(id: string): Promise<any> {
    return apiClient.delete<any>(`/api/products/${id}`);
  },

  async uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/products/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || data.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.data?.imageUrl || data.imageUrl;
  },

  async createCategory(data: CategoryFormData): Promise<Category> {
    return apiClient.post<Category>('/api/categories', data);
  },

  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    return apiClient.put<Category>(`/api/categories/${id}`, data);
  },

  async deleteCategory(id: string): Promise<any> {
    return apiClient.delete<any>(`/api/categories/${id}`);
  },

  async getInventoryLogs(): Promise<any[]> {
    return apiClient.get<any[]>('/api/admin/inventory/logs');
  },

  async adjustStock(productId: string, quantity: number, type: 'set' | 'increase' | 'decrease', reason: string): Promise<any> {
    return apiClient.post<any>('/api/admin/inventory/adjust', { productId, quantity, type, reason });
  },

  async getSettings(): Promise<StoreSettingsFormData> {
    return apiClient.get<StoreSettingsFormData>('/api/admin/settings');
  },

  async updateSettings(data: StoreSettingsFormData): Promise<StoreSettingsFormData> {
    return apiClient.put<StoreSettingsFormData>('/api/admin/settings', data);
  },

  async getCoupons(): Promise<CouponFormData[]> {
    return apiClient.get<CouponFormData[]>('/api/admin/coupons');
  },

  async createCoupon(data: CouponFormData): Promise<CouponFormData> {
    return apiClient.post<CouponFormData>('/api/admin/coupons', data);
  },

  async updateCoupon(id: string, data: Partial<CouponFormData>): Promise<CouponFormData> {
    return apiClient.put<CouponFormData>(`/api/admin/coupons/${id}`, data);
  },

  async deleteCoupon(id: string): Promise<any> {
    return apiClient.delete<any>(`/api/admin/coupons/${id}`);
  },
};