import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CouponService } from '../../server/services/coupon.service';
import { prisma } from '../../server/prisma/client';

describe('CouponService Unit Tests', () => {
  beforeAll(async () => {
    // Ensure a clean, known coupon exists regardless of seed state
    await prisma.coupon.upsert({
      where: { code: 'SALLA10' },
      update: { discountPercent: 10, maxDiscount: 50, isActive: true },
      create: { code: 'SALLA10', discountPercent: 10, maxDiscount: 50, isActive: true }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should validate a correct promo code and apply discount', async () => {
    const result = await CouponService.validateCoupon('SALLA10', 200);

    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('Expected coupon to be valid');
    expect(result.code).toBe('SALLA10');
    expect(result.discountPercent).toBe(10);
    expect(result.discount).toBe(20); // 10% of 200 is 20
    expect(result.messageEn).toBe('10% discount applied successfully!');
  });

  it('should enforce max discount limit', async () => {
    // SALLA10 has max discount of 50. 10% of 1000 is 100, but should be capped at 50
    const result = await CouponService.validateCoupon('SALLA10', 1000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(50);
  });

  it('should return invalid for incorrect promo codes', async () => {
    const result = await CouponService.validateCoupon('INVALIDCODE', 200);

    expect(result.valid).toBe(false);
    expect(result.discount).toBe(0);
    expect(result.messageEn).toBe('Invalid or expired promo code');
  });

  it('should be case insensitive and handle whitespace', async () => {
    const result = await CouponService.validateCoupon('  salla10  ', 200);

    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('Expected coupon to be valid');
    expect(result.code).toBe('SALLA10');
    expect(result.discount).toBe(20);
  });
});
