import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';

export class PromoController {
  static async validate(req: Request, res: Response) {
    const { code, subtotal } = req.body;
    const result = await CouponService.validateCoupon(code || '', Number(subtotal) || 0);

    if (!result.valid) {
      return res.status(400).json(result);
    }
    return res.json(result);
  }
}
