import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { CartItem, Language, PromoCode } from '../types';
import { orderService } from '../services/orderService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  shippingCost: number;
  setShippingCost: (cost: number) => void;
  appliedPromo: PromoCode | null;
  setAppliedPromo: (promo: PromoCode | null) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  lang,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  shippingCost,
  setShippingCost,
  appliedPromo,
  setAppliedPromo,
  onCheckout,
}: CartDrawerProps) {
  const isAr = lang === 'ar';
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  if (!isOpen) return null;

  // Totals calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const total = subtotal - discountAmount + shippingCost;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsValidatingPromo(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const data = await orderService.validatePromo(promoInput, subtotal);

      if (data.valid) {
        setAppliedPromo({ code: promoInput.toUpperCase().trim(), discountPercent: data.discountPercent });
        setPromoSuccess(
          isAr
            ? `تم تطبيق الكود بنجاح! خصم بقيمة ${data.discountPercent}٪`
            : `Promo applied! Code matches ${data.discountPercent}% off`
        );
      } else {
        setPromoError(isAr ? 'الكود المدخل غير صالح أو انتهت صلاحيته' : 'Invalid or expired coupon code');
      }
    } catch (err) {
      setPromoError(isAr ? 'الكود المدخل غير صالح أو انتهت صلاحيته' : 'Invalid or expired coupon code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoSuccess('');
    setPromoError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />

      <div className={`absolute inset-y-0 max-w-md w-full bg-white border-charcoal/10 shadow-[4px_4px_12px_rgba(26,26,26,0.12)] flex flex-col transition-transform duration-300 ${
        isAr ? 'left-0 border-r' : 'right-0 border-l'
      }`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-charcoal/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif font-black text-charcoal">
              {isAr ? 'سلة التسوق' : 'Shopping Cart'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-none text-xs font-bold bg-charcoal text-white">
              {cart.length}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-charcoal/50 hover:bg-paper hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 rounded-none border border-charcoal/10 bg-paper flex items-center justify-center text-charcoal/40 mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <p className="text-sm font-serif font-bold text-charcoal">
                {isAr ? 'سلتك فارغة تماماً' : 'Your cart is completely empty'}
              </p>
              <p className="text-xs text-charcoal/60 mt-2 max-w-xs leading-relaxed">
                {isAr 
                  ? 'تصفح قائمة المنتجات الرائعة المتوفرة بالمتجر واملأ سلتك بأفضل الصفقات.' 
                  : 'Explore our amazing catalog of various items and fill your cart with handpicked deals.'}
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-5 py-2.5 bg-vermilion hover:bg-charcoal text-white text-xs font-serif font-bold tracking-wider transition-colors"
              >
                {isAr ? 'استمر بالتسوق' : 'Continue Shopping'}
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const trans = (isAr ? item.product.ar : item.product.en) || item.product.ar || item.product.en || { name: 'Item' };
              return (
                <div 
                  key={item.product.id} 
                  className={`flex gap-4 p-3.5 border border-charcoal/10 bg-white transition-all ${
                    isAr ? 'flex-row-reverse text-right' : 'flex-row text-left'
                  }`}
                >
                  <img
                    src={item.product.image}
                    alt={trans.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-none object-cover bg-paper shrink-0 border border-charcoal/5"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-serif font-bold text-charcoal truncate leading-none mb-1">
                        {trans.name}
                      </h4>
                      <p className="text-[10px] text-charcoal/45 font-medium font-sans">
                        {isAr ? 'الفئة: ' : 'Category: '}
                        {item.product.category}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Toggler */}
                      <div className="flex items-center border border-charcoal/10 rounded-none bg-paper overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-charcoal/60 hover:bg-charcoal/5 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-charcoal/60 hover:bg-charcoal/5 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price & Delete */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-serif font-black text-charcoal">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1 text-vermilion hover:bg-vermilion/10 transition-colors"
                          title={isAr ? 'إزالة' : 'Remove'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with totals */}
        {cart.length > 0 && (
          <div className="border-t border-charcoal/10 p-6 bg-paper space-y-4">
            
            {/* Promo code area */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <label className={`block text-[11px] font-sans font-bold text-charcoal/70 ${isAr ? 'text-right' : 'text-left'}`}>
                {isAr ? 'هل تملك كوبون خصم؟' : 'Have a Promo Code?'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="WELCOME10, EASYBUY20"
                  disabled={!!appliedPromo}
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className={`flex-1 py-2 px-3 text-xs bg-white rounded-none border border-charcoal/10 focus:outline-none focus:border-vermilion disabled:bg-charcoal/5 disabled:text-charcoal/40 ${
                    isAr ? 'text-right' : 'text-left'
                  }`}
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="px-3.5 py-2 rounded-none text-xs font-serif font-bold bg-vermilion/10 text-vermilion border border-vermilion/20 hover:bg-vermilion/20 transition-colors"
                  >
                    {isAr ? 'إزالة' : 'Remove'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isValidatingPromo}
                    className="px-4 py-2 rounded-none text-xs font-serif font-bold bg-charcoal text-white hover:bg-vermilion disabled:opacity-50 transition-colors"
                  >
                    {isValidatingPromo ? '...' : isAr ? 'تطبيق' : 'Apply'}
                  </button>
                )}
              </div>
              {promoError && (
                <p className={`text-[10px] font-semibold text-vermilion ${isAr ? 'text-right' : 'text-left'}`}>
                  {promoError}
                </p>
              )}
              {promoSuccess && (
                <p className={`text-[10px] font-semibold text-emerald-600 ${isAr ? 'text-right' : 'text-left'}`}>
                  {promoSuccess}
                </p>
              )}
            </form>

            {/* Shipping selection */}
            <div className="space-y-1.5">
              <label className={`block text-[11px] font-sans font-bold text-charcoal/70 ${isAr ? 'text-right' : 'text-left'}`}>
                {isAr ? 'طريقة الشحن' : 'Shipping Method'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShippingCost(0.0)}
                  className={`p-2.5 rounded-none border text-xs font-serif font-bold flex flex-col items-center justify-center transition-all ${
                    shippingCost === 0.0
                      ? 'bg-charcoal text-white border-charcoal shadow-sm'
                      : 'bg-white text-charcoal border-charcoal/10 hover:bg-charcoal/5'
                  }`}
                >
                  <span>{isAr ? 'شحن عادي' : 'Standard'}</span>
                  <span className="text-[10px] font-normal font-sans mt-0.5 opacity-80">{isAr ? 'مجانًا (٣-٥ أيام)' : 'Free (3-5 Days)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShippingCost(15.0)}
                  className={`p-2.5 rounded-none border text-xs font-serif font-bold flex flex-col items-center justify-center transition-all ${
                    shippingCost === 15.0
                      ? 'bg-charcoal text-white border-charcoal shadow-sm'
                      : 'bg-white text-charcoal border-charcoal/10 hover:bg-charcoal/5'
                  }`}
                >
                  <span>{isAr ? 'شحن سريع' : 'Express'}</span>
                  <span className="text-[10px] font-normal font-sans mt-0.5 opacity-80">{isAr ? '$15.00 (خلال يومين)' : '$15.00 (2 Days)'}</span>
                </button>
              </div>
            </div>

            {/* Summary details */}
            <div className="space-y-2 border-t border-charcoal/10 pt-3.5 text-xs text-charcoal/70">
              <div className="flex justify-between">
                <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-semibold text-charcoal">${subtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{isAr ? `خصم الكود (${appliedPromo.discountPercent}٪):` : `Promo Discount (${appliedPromo.discountPercent}%):`}</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{isAr ? 'تكلفة الشحن:' : 'Shipping Cost:'}</span>
                <span className="font-semibold text-charcoal">
                  {shippingCost === 0 ? (isAr ? 'مجاني' : 'Free') : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-charcoal/15 pt-2.5 text-sm font-serif font-black text-charcoal">
                <span>{isAr ? 'المجموع الإجمالي:' : 'Total amount:'}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Secure Check out Button */}
            <button
              onClick={onCheckout}
              className="w-full py-3.5 rounded-none bg-vermilion hover:bg-charcoal text-white font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isAr ? 'الانتقال للدفع الآمن' : 'Proceed to Secure Checkout'}</span>
              <ArrowRight className={`w-4 h-4 shrink-0 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
