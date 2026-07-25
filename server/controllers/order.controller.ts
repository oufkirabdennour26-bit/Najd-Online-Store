import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/errors';

export class OrderController {
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    const result = await OrderService.createOrder(req.body, userId);
    return res.status(201).json(result);
  }

  // Requires a real logged-in session - previously this accepted a bare
  // ?email= or ?phone= query param with no proof of ownership, letting anyone
  // list another customer's full order history just by guessing their contact info.
  static async getOrders(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) {
      throw new ApiError('Authentication required to view order history', 401, true, 'يتطلب تسجيل الدخول لعرض سجل الطلبات', 'Authentication required to view order history');
    }
    const orders = await OrderService.getOrdersByUserId(req.user.id);
    return res.json(orders);
  }

  // Guest-safe order tracking: requires BOTH the order ID and the secure token
  // the customer received on their confirmation screen - this is the correct
  // way to let a guest look up a single order without an account.
  static async getOrderDetails(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const token = req.query.token as string;

    const order = await OrderService.getOrderByIdAndToken(id, token);
    return res.json(order);
  }
}
