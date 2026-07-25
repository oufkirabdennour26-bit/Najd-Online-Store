import { apiClient } from '../api/client';
import { Product, Category } from '../types';

export const productService = {
  async getProducts(params?: { includeDeleted?: boolean }): Promise<Product[]> {
    return apiClient.get<Product[]>('/api/products', params);
  },

  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/api/categories');
  },
};
