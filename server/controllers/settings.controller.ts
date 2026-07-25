import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';

export class SettingsController {
  // Public: read-only, used by the storefront (shipping cost, tax rate, maintenance mode, etc.)
  static async getPublicSettings(req: Request, res: Response) {
    const settings = await SettingsService.getPublicSettings();
    return res.json(settings);
  }

  // Admin: full settings row
  static async getSettings(req: Request, res: Response) {
    const settings = await SettingsService.getSettings();
    return res.json(settings);
  }

  static async updateSettings(req: Request, res: Response) {
    const updated = await SettingsService.updateSettings(req.body);
    return res.json(updated);
  }
}
