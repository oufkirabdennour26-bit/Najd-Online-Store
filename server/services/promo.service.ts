export class PromoService {
  private static PROMO_CODES: Record<string, { discountPercent: number; maxDiscount: number }> = {
    'SALLA10': { discountPercent: 10, maxDiscount: 50 },
    'WELCOME20': { discountPercent: 20, maxDiscount: 100 },
    'RAMADAN15': { discountPercent: 15, maxDiscount: 75 }
  };

  static validatePromoCode(code: string, subtotal: number) {
    const cleanCode = code.trim().toUpperCase();
    const promo = this.PROMO_CODES[cleanCode];

    if (!promo) {
      return {
        valid: false,
        messageAr: 'كود الخصم غير صحيح أو منتهي الصلاحية',
        messageEn: 'Invalid or expired promo code',
        discount: 0
      };
    }

    const calculatedDiscount = (subtotal * promo.discountPercent) / 100;
    const finalDiscount = Math.min(calculatedDiscount, promo.maxDiscount);

    return {
      valid: true,
      code: cleanCode,
      discountPercent: promo.discountPercent,
      discount: Math.round(finalDiscount * 100) / 100,
      messageAr: `تم تطبيق خصم ${promo.discountPercent}% بنجاح!`,
      messageEn: `${promo.discountPercent}% discount applied successfully!`
    };
  }
}
