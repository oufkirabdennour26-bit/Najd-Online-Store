import { prisma } from '../prisma/client';
import { ApiError } from '../utils/errors';

export class CouponService {
  static async getAllCoupons() {
    return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async createCoupon(data: {
    code: string;
    discountPercent: number;
    maxDiscount: number;
    minSubtotal?: number;
    isActive?: boolean;
    expiryDate?: string | null;
  }) {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new ApiError('A coupon with this code already exists', 400, true, 'يوجد كوبون بهذا الكود مسبقاً', 'A coupon with this code already exists');
    }

    return prisma.coupon.create({
      data: {
        code: data.code,
        discountPercent: data.discountPercent,
        maxDiscount: data.maxDiscount,
        minSubtotal: data.minSubtotal,
        isActive: data.isActive ?? true,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null
      }
    });
  }

  static async updateCoupon(
    id: string,
    data: Partial<{
      code: string;
      discountPercent: number;
      maxDiscount: number;
      minSubtotal?: number;
      isActive?: boolean;
      expiryDate?: string | null;
    }>
  ) {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('Coupon not found', 404);
    }

    if (data.code && data.code !== existing.code) {
      const codeTaken = await prisma.coupon.findUnique({ where: { code: data.code } });
      if (codeTaken) {
        throw new ApiError('A coupon with this code already exists', 400, true, 'يوجد كوبون بهذا الكود مسبقاً', 'A coupon with this code already exists');
      }
    }

    return prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        expiryDate: data.expiryDate !== undefined ? (data.expiryDate ? new Date(data.expiryDate) : null) : undefined
      }
    });
  }

  static async deleteCoupon(id: string) {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('Coupon not found', 404);
    }
    await prisma.coupon.delete({ where: { id } });
    return { success: true, message: 'Coupon deleted successfully' };
  }

  // Used at checkout - the single source of truth for promo validation
  static async validateCoupon(code: string, subtotal: number) {
    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });

    const invalidResponse = {
      valid: false as const,
      messageAr: 'كود الخصم غير صحيح أو منتهي الصلاحية',
      messageEn: 'Invalid or expired promo code',
      discount: 0
    };

    if (!coupon || !coupon.isActive) {
      return invalidResponse;
    }

    if (coupon.expiryDate && coupon.expiryDate.getTime() < Date.now()) {
      return invalidResponse;
    }

    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      return {
        valid: false as const,
        messageAr: `الحد الأدنى للطلب لاستخدام هذا الكود هو ${coupon.minSubtotal}`,
        messageEn: `Minimum order amount for this code is ${coupon.minSubtotal}`,
        discount: 0
      };
    }

    const calculatedDiscount = (subtotal * coupon.discountPercent) / 100;
    const finalDiscount = Math.min(calculatedDiscount, coupon.maxDiscount);

    return {
      valid: true as const,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discount: Math.round(finalDiscount * 100) / 100,
      messageAr: `تم تطبيق خصم ${coupon.discountPercent}% بنجاح!`,
      messageEn: `${coupon.discountPercent}% discount applied successfully!`
    };
  }
}
