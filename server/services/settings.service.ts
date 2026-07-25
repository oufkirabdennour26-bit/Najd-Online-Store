import { prisma } from '../prisma/client';

const SETTINGS_ID = 'singleton';

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  storeNameAr: 'متجر نجد الإلكتروني',
  storeNameEn: 'Najd Online Store',
  supportEmail: 'support@salla-store.sa',
  supportPhone: '+966 50 123 4567',
  currency: 'SAR',
  defaultShippingCost: 15,
  taxRate: 15,
  isMaintenanceMode: false
};

export class SettingsService {
  // Returns the single settings row, creating it with defaults on first use.
  static async getSettings() {
    const settings = await prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: DEFAULT_SETTINGS
    });
    return settings;
  }

  // Only the fields the public storefront actually needs (no internal/admin-only data).
  static async getPublicSettings() {
    const settings = await this.getSettings();
    return {
      storeNameAr: settings.storeNameAr,
      storeNameEn: settings.storeNameEn,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      currency: settings.currency,
      defaultShippingCost: settings.defaultShippingCost,
      taxRate: settings.taxRate,
      isMaintenanceMode: settings.isMaintenanceMode
    };
  }

  static async updateSettings(data: {
    storeNameAr: string;
    storeNameEn: string;
    supportEmail: string;
    supportPhone: string;
    currency: string;
    defaultShippingCost: number;
    taxRate: number;
    isMaintenanceMode: boolean;
  }) {
    const updated = await prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: data,
      create: { id: SETTINGS_ID, ...data }
    });
    return updated;
  }
}
