import { apiClient } from '../api/client';
import { StoreSettingsFormData } from '../types/admin';

export const settingsService = {
  // Public, read-only endpoint - no auth required
  async getPublicSettings(): Promise<StoreSettingsFormData> {
    return apiClient.get<StoreSettingsFormData>('/api/settings');
  },
};
