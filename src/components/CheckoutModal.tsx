import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, MapPin, CreditCard, Phone, User, Landmark, Clock, CheckCircle, Info, Download } from 'lucide-react';
import { Language, CartItem, PromoCode, ShippingDetails, PaymentDetails } from '../types';
import { orderService } from '../services/orderService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  cart: CartItem[];
  shippingCost: number;
  appliedPromo: PromoCode | null;
  onClearCart: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  lang,
  cart,
  shippingCost,
  appliedPromo,
  onClearCart,
}: CheckoutModalProps) {
  const isAr = lang === 'ar';
  
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const total = subtotal - discountAmount + shippingCost;

  const [step, setStep] = useState<'shipping' | 'payment' | 'verifying' | 'otp' | 'success'>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [generatedOrder, setGeneratedOrder] = useState<any>(null);

  const [shippingForm, setShippingForm] = useState<ShippingDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [paymentForm, setPaymentForm] = useState<PaymentDetails>({
    method: 'card',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  if (!isOpen) return null;

  const handleAutoFill = () => {
    setShippingForm({
      fullName: isAr ? 'أحمد محمد' : 'Ahmad Mohammad',
      email: 'test@example.com',
      phone: '+966 50 123 4567',
      address: isAr ? 'حي الياسمين، شارع العليا' : 'Al-Yasmin Dist, Olaya Road',
      city: isAr ? 'الرياض' : 'Riyadh',
      zipCode: '11564',
    });
    setPaymentForm({
      method: 'card',
      cardName: 'Ahmad Mohammad',
      cardNumber: '4111 1111 1111 1111',
      cardExpiry: '12/29',
      cardCvv: '987',
    });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPaymentForm({ ...paymentForm, cardNumber: formatted });
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setPaymentForm({ ...paymentForm, cardExpiry: formatted });
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingForm.email)) {
      setErrorMessage(isAr ? 'يرجى إدخال بريد إلكتروني صالح.' : 'Please enter a valid email address.');
      return;
    }
    setStep('payment');
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    setStep('verifying');

    const formattedItems = cart.map(item => ({
      productId: item.product.id,
      nameAr: item.product.ar?.name || item.product.nameAr,
      nameEn: item.product.en?.name || item.product.nameEn,
      price: item.product.price,
      quantity: item.quantity
    }));

    setTimeout(async () => {
      try {
        const data = await orderService.checkout({
          shipping: shippingForm,
          payment: paymentForm,
          items: formattedItems,
          subtotal,
          shippingCost,
          discount: discountAmount,
          total,
          promoCode: appliedPromo?.code,
        });

        if (data && (data.orderId || data.id || data.success)) {
          const orderObj = {
            id: data.orderId || data.id || data.order?.id,
            secureToken: data.secureToken || data.order?.secureToken,
            createdAt: data.createdAt || new Date().toISOString(),
            total: data.total ?? total,
            subtotal: data.subtotal ?? subtotal,
            shippingCost: data.shippingCost ?? shippingCost,
            discount: data.discount ?? discountAmount,
            paymentMethod: paymentForm.method,
            shipping: { ...shippingForm },
            items: formattedItems
          };

          setGeneratedOrder(orderObj);

          if (paymentForm.method === 'card') {
            setStep('otp');
            setOtpTimer(60);
          } else {
            setStep('success');
            onClearCart();
          }
        } else {
          setErrorMessage(isAr ? 'فشلت عملية إنشاء الطلب.' : 'Order creation failed.');
          setStep('payment');
        }
      } catch (err: any) {
        const backendError = err.data || {};
        setErrorMessage(
          isAr
            ? (backendError.messageAr || err.message || 'فشلت معالجة الطلب الآمن.')
            : (backendError.messageEn || err.message || 'Failed to process secure transaction.')
        );
        setStep('payment');
      } finally {
        setIsSubmitting(false);
      }
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage(isAr ? 'يرجى إدخال رمز التحقق كاملًا.' : 'Please enter the complete verification code.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setStep('success');
      setIsSubmitting(false);
      onClearCart();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => step !== 'verifying' && step !== 'otp' && onClose()} />
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-2xl transform bg-white border border-charcoal/10 text-left align-middle shadow-[8px_8px_0px_rgba(26,26,26,0.12)] transition-all overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-charcoal/10 flex items-center justify-between bg-charcoal text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-vermilion" />
              <h2 className="text-md font-serif font-black tracking-wide">
                {step === 'success' ? (isAr ? 'تم تأكيد الطلب بأمان' : 'Secure Order Confirmed') : (isAr ? 'بوابة الدفع الآمنة والذكية' : 'Secure Smart Checkout Gateway')}
              </h2>
            </div>
            {step !== 'verifying' && step !== 'otp' && (
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors" id="close-checkout-btn">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-vermilion/5 text-vermilion border border-vermilion/15 text-xs font-serif font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-none bg-vermilion shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {step === 'shipping' && (
              <form onSubmit={handleProceedToPayment} className="space-y-4 text-charcoal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-bold text-charcoal/70">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input type="text" required value={shippingForm.fullName} onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })} className="w-full py-2.5 px-3 border border-charcoal/10 bg-paper text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-bold text-charcoal/70">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input type="email" required value={shippingForm.email} onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })} className="w-full py-2.5 px-3 border border-charcoal/10 bg-paper text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-bold text-charcoal/70">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                    <input type="text" required value={shippingForm.phone} onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })} className="w-full py-2.5 px-3 border border-charcoal/10 bg-paper text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-bold text-charcoal/70">{isAr ? 'المدينة' : 'City'}</label>
                    <input type="text" required value={shippingForm.city} onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })} className="w-full py-2.5 px-3 border border-charcoal/10 bg-paper text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold text-charcoal/70">{isAr ? 'العنوان' : 'Address'}</label>
                  <input type="text" required value={shippingForm.address} onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })} className="w-full py-2.5 px-3 border border-charcoal/10 bg-paper text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold text-charcoal/70">{isAr ? 'الرمز البريدي' : 'Zip Code'}</label>
                  <input type="text" required value={shippingForm.zipCode} onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })} className="w-full py-2.5 px-3 border border-charcoal/10 bg-paper text-sm" />
                </div>
                <div className="pt-4 flex justify-between">
                  <button type="button" onClick={handleAutoFill} className="px-4 py-2 bg-paper text-xs font-bold border border-charcoal/10">{isAr ? 'تعبئة تجريبية' : 'Auto-fill'}</button>
                  <button type="submit" className="px-6 py-3 bg-vermilion text-white text-xs font-bold">{isAr ? 'تابع للدفع' : 'Proceed to Payment'}</button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <form onSubmit={handleProcessCheckout} className="space-y-6 text-charcoal">
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPaymentForm({ ...paymentForm, method: 'card' })} className={`p-3 border text-xs font-bold ${paymentForm.method === 'card' ? 'bg-charcoal text-white' : 'bg-white'}`}>Credit Card</button>
                  <button type="button" onClick={() => setPaymentForm({ ...paymentForm, method: 'paypal' })} className={`p-3 border text-xs font-bold ${paymentForm.method === 'paypal' ? 'bg-charcoal text-white' : 'bg-white'}`}>PayPal</button>
                  <button type="button" onClick={() => setPaymentForm({ ...paymentForm, method: 'cod' })} className={`p-3 border text-xs font-bold ${paymentForm.method === 'cod' ? 'bg-charcoal text-white' : 'bg-white'}`}>COD</button>
                </div>

                {paymentForm.method === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold">{isAr ? 'رقم البطاقة' : 'Card Number'}</label>
                      <input type="text" required placeholder="4111 1111 1111 1111" value={paymentForm.cardNumber} onChange={handleCardNumberChange} className="w-full py-2 px-3 border text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" required placeholder="MM/YY" value={paymentForm.cardExpiry} onChange={handleCardExpiryChange} className="py-2 px-3 border text-sm text-center" />
                      <input type="password" required maxLength={4} placeholder="CVV" value={paymentForm.cardCvv} onChange={(e) => setPaymentForm({ ...paymentForm, cardCvv: e.target.value.replace(/\D/g, '') })} className="py-2 px-3 border text-sm text-center" />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button type="button" onClick={() => setStep('shipping')} className="text-xs font-bold">{isAr ? 'السابق' : 'Back'}</button>
                  <button type="submit" className="px-6 py-3 bg-vermilion text-white text-xs font-bold">{isAr ? 'تأكيد ودفع' : 'Authorize & Pay'}</button>
                </div>
              </form>
            )}

            {step === 'verifying' && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-vermilion border-t-transparent animate-spin" />
                <p className="text-xs font-bold">{isAr ? 'جاري معالجة المعاملة بأمان...' : 'Processing secure transaction...'}</p>
              </div>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-sm mx-auto py-6">
                <p className="text-xs font-bold">{isAr ? 'أدخل رمز التحقق البنكي (أدخل أي 6 أرقام)' : 'Enter 3D Secure OTP Pin (Type any 6 digits)'}</p>
                <input type="text" required maxLength={6} placeholder="123456" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full py-3 text-center text-lg font-mono tracking-widest border-2 border-charcoal" />
                <button type="submit" className="w-full py-3 bg-vermilion text-white text-xs font-bold">{isAr ? 'تحقق وتأكيد' : 'Verify & Confirm'}</button>
              </form>
            )}

            {step === 'success' && generatedOrder && (
              <div className="space-y-6 text-center py-4">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold">{isAr ? 'تم تأكيد طلبك بنجاح!' : 'Order Placed Successfully!'}</h3>
                <div className="p-4 bg-paper border text-xs text-left space-y-2">
                  <p><strong>Order ID:</strong> {generatedOrder.id}</p>
                  <p><strong>Security Token:</strong> {generatedOrder.secureToken}</p>
                  <p><strong>Total Paid:</strong> ${generatedOrder.total?.toFixed(2)}</p>
                </div>
                <button onClick={onClose} className="px-6 py-2.5 bg-vermilion text-white text-xs font-bold">{isAr ? 'إغلاق العودة للمتجر' : 'Return to Store'}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}