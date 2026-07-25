import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await AdminService.login(email, password);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const
    };

    res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('accessToken', result.token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

    return res.json({ success: result.success, admin: result.admin });
  }

  // إضافة متحكم تغيير كلمة المرور للأدمن
  static async changePassword(req: Request, res: Response) {
    const { oldPassword, newPassword } = req.body;
    const adminId = (req as any).user?.id;
    
    if (!adminId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await AdminService.changeAdminPassword(adminId, oldPassword, newPassword);
    return res.json(result);
  }

  static async getStats(req: Request, res: Response) {
    const stats = await AdminService.getStats();
    return res.json(stats);
  }

  static async getOrders(req: Request, res: Response) {
    const orders = await AdminService.getAdminOrders();
    return res.json(orders);
  }

  static async updateOrderStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const operatorName = (req as any).user?.name || (req as any).user?.email || 'Admin';
    const updated = await AdminService.updateOrderStatus(id, status, operatorName);
    return res.json(updated);
  }

  static async getInventoryLogs(req: Request, res: Response) {
    const logs = await AdminService.getInventoryLogs();
    return res.json(logs);
  }

  static async adjustStock(req: Request, res: Response) {
    const { productId, quantity, type, reason } = req.body;
    const operatorName = (req as any).user?.name || (req as any).user?.email || 'Admin';
    const result = await AdminService.adjustStock(productId, Number(quantity), type, reason, operatorName);
    return res.json(result);
  }

  static async getOrderHistory(req: Request, res: Response) {
    const { id } = req.params;
    const history = await AdminService.getOrderHistory(id);
    return res.json(history);
  }

  static async getCustomers(req: Request, res: Response) {
    const customers = await AdminService.getAdminCustomers();
    return res.json(customers);
  }
}