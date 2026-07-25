import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';
import { ApiResponse } from '../utils/response';

export class CouponController {
  static async getCoupons(req: Request, res: Response) {
    const coupons = await CouponService.getAllCoupons();
    return res.json(coupons);
  }

  static async createCoupon(req: Request, res: Response) {
    const coupon = await CouponService.createCoupon(req.body);
    return res.status(201).json(coupon);
  }

  static async updateCoupon(req: Request, res: Response) {
    const coupon = await CouponService.updateCoupon(req.params.id, req.body);
    return res.json(coupon);
  }

  static async deleteCoupon(req: Request, res: Response) {
    const result = await CouponService.deleteCoupon(req.params.id);
    return ApiResponse.success(res, result, 'Coupon deleted successfully');
  }
}
