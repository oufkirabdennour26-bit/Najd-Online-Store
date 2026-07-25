import React, { useState } from 'react';
import { Search, Package, MapPin, CreditCard } from 'lucide-react';
import { Language, Order } from '../types';
import { orderService } from '../services/orderService';

interface OrderTrackerProps {
  lang: Language;
  onClose: () => void;
}

export default function OrderTracker({ lang, onClose }: OrderTrackerProps) {
  const isAr = lang === 'ar';
  const [orderId, setOrderId] = useState('');
  const [secureToken, setSecureToken] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !secureToken.trim()) return;

    setIsLoading(true);
    setError('');
    setHasSearched(true);
    setOrders([]);

    try {
      const order = await orderService.trackOrder(orderId, secureToken);
      setOrders([order]);
    } catch (err) {
      setError(isAr ? 'لم نتمكن من العثور على طلب مطابق.' : "We couldn't find a matching order.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center space-y-3 mb-10">
        <Package className="w-10 h-10 mx-auto text-charcoal" />
        <h1 className="text-2xl font-serif font-black text-charcoal">{isAr ? 'تتبع حالة الشحنات' : 'Order Tracker'}</h1>
      </div>

      <div className="bg-white p-6 border shadow-sm max-w-xl mx-auto mb-8">
        <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-2">
          <input type="text" required placeholder={isAr ? 'رقم الطلب (ORD-...)' : 'Order ID'} value={orderId} onChange={(e) => setOrderId(e.target.value)} className="flex-1 py-3 px-4 border text-sm" />
          <input type="text" required placeholder={isAr ? 'رمز الأمان (TXN-...)' : 'Security Token'} value={secureToken} onChange={(e) => setSecureToken(e.target.value)} className="flex-1 py-3 px-4 border text-sm" />
          <button type="submit" disabled={isLoading} className="px-6 py-3 bg-vermilion text-white text-xs font-bold">{isLoading ? '...' : isAr ? 'بحث' : 'Track'}</button>
        </form>
      </div>

      {error && <p className="text-center text-xs font-bold text-vermilion">{error}</p>}

      {hasSearched && !isLoading && !error && (
        <div className="space-y-6">
          {orders.map((order) => {
            const recipientName = order.fullName || order.shipping?.fullName || 'Customer';
            const recipientAddress = order.address || order.shipping?.address || '';
            const recipientCity = order.city || order.shipping?.city || '';

            return (
              <div key={order.id} className="bg-white border shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex justify-between border-b pb-3">
                  <span className="font-mono font-bold">#{order.id}</span>
                  <span className="font-serif font-black text-vermilion">${order.total?.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 text-xs">
                  <div>
                    <p className="font-bold">{isAr ? 'العميل:' : 'Customer:'} {recipientName}</p>
                    <p>{recipientAddress}, {recipientCity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{isAr ? 'حالة الطلب:' : 'Status:'} {order.status}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <button onClick={onClose} className="px-6 py-2 border text-xs font-bold">{isAr ? 'العودة' : 'Back'}</button>
      </div>
    </div>
  );
}