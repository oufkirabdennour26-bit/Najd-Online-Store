import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Tag, Plus, Edit, Trash2, X, Check, AlertCircle, Percent, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { CouponFormData } from '../../types/admin';
import { Language } from '../../types';

interface CouponsManagerProps {
  coupons: CouponFormData[];
  isLoading: boolean;
  lang: Language;
  onCreateCoupon: (data: CouponFormData) => Promise<void>;
  onUpdateCoupon: (id: string, data: Partial<CouponFormData>) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
}

export const CouponsManager: React.FC<CouponsManagerProps> = ({
  coupons,
  isLoading,
  lang,
  onCreateCoupon,
  onUpdateCoupon,
  onDeleteCoupon
}) => {
  const isAr = lang === 'ar';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CouponFormData>({
    defaultValues: {
      code: '',
      discountPercent: 10,
      maxDiscount: 50,
      minSubtotal: 0,
      isActive: true
    }
  });

  const openAddModal = () => {
    setEditingCoupon(null);
    reset({
      code: '',
      discountPercent: 10,
      maxDiscount: 50,
      minSubtotal: 0,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: CouponFormData) => {
    setEditingCoupon(coupon);
    reset(coupon);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: CouponFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCoupon && editingCoupon.id) {
        await onUpdateCoupon(editingCoupon.id, data);
      } else {
        await onCreateCoupon(data);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err?.message || (isAr ? 'فشل حفظ الكوبون' : 'Failed to save coupon'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة قسائم وكوبونات الخصم' : 'Coupons & Promo Codes Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'إنشاء أكواد التخفيض، حد الخصم الأقصى، وتفعيلها'
              : 'Create promotional discount codes, max limits, and toggle active status'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إنشاء كود خصم جديد' : 'Create New Promo Code'}
        </button>
      </div>

      {/* Coupons List Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">{isAr ? 'جاري تحميل أكواد الخصم...' : 'Loading coupons...'}</p>
          </div>
        ) : (coupons || []).length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Tag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              {isAr ? 'لا توجد أكواد خصم مسجلة' : 'No promo codes created yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(coupons || []).map((coupon) => (
              <div
                key={coupon.id || coupon.code}
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 relative group hover:border-emerald-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-base text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                    {coupon.code}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      coupon.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    {coupon.isActive ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'معطل' : 'Disabled')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{isAr ? 'نسبة الخصم:' : 'Discount Rate:'}</span>
                    <span className="font-bold text-emerald-700">{coupon.discountPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? 'الحد الأقصى للخصم:' : 'Max Discount:'}</span>
                    <span className="font-bold text-slate-900">{coupon.maxDiscount} {isAr ? 'ر.س' : 'SAR'}</span>
                  </div>
                  {coupon.minSubtotal ? (
                    <div className="flex justify-between">
                      <span>{isAr ? 'الحد الأدنى للطلب:' : 'Min Subtotal:'}</span>
                      <span className="font-semibold text-slate-700">{coupon.minSubtotal} {isAr ? 'ر.س' : 'SAR'}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => openEditModal(coupon)}
                    className="p-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {isAr ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isAr ? 'حذف هذا الكوبون؟' : 'Delete this coupon?')) {
                        if (coupon.id) onDeleteCoupon(coupon.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isAr ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingCoupon ? (isAr ? 'تعديل كود الخصم' : 'Edit Promo Code') : (isAr ? 'إنشاء كود خصم جديد' : 'New Promo Code')}
              </h3>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'كود الخصم (رمز الكوبون)' : 'Promo Code (Uppercase)'}
                </label>
                <input
                  type="text"
                  {...register('code', { required: isAr ? 'الكود مطلوب' : 'Code required' })}
                  placeholder="e.g. SUMMER25, SALLA10"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono uppercase"
                />
                {errors.code && <p className="text-xs text-rose-600 mt-1">{errors.code.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'نسبة الخصم (%)' : 'Discount Rate (%)'}
                  </label>
                  <input
                    type="number"
                    {...register('discountPercent', { valueAsNumber: true, required: true, min: 1, max: 100 })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'الحد الأقصى (ر.س)' : 'Max Discount (SAR)'}
                  </label>
                  <input
                    type="number"
                    {...register('maxDiscount', { valueAsNumber: true, required: true, min: 1 })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'الحد الأدنى لقيمة الطلب' : 'Min Order Subtotal'}
                </label>
                <input
                  type="number"
                  {...register('minSubtotal', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-800 cursor-pointer">
                  {isAr ? 'الكوبون نشط ومتاح للاستخدام فوراً' : 'Coupon is active and ready for immediate use'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAr ? 'حفظ الكوبون' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
