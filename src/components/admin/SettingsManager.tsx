import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Store, Save, CheckCircle2, Mail, Phone, Truck, AlertTriangle, Loader2, Lock } from 'lucide-react';
import { StoreSettingsFormData } from '../../types/admin';
import { Language } from '../../types';
import { adminService } from '../../services/adminService';

interface SettingsManagerProps {
  lang: Language;
}

const FALLBACK_SETTINGS: StoreSettingsFormData = {
  storeNameAr: 'متجر نجد الإلكتروني',
  storeNameEn: 'Najd Online Store',
  supportEmail: 'support@salla-store.sa',
  supportPhone: '+966 50 123 4567',
  currency: 'SAR',
  defaultShippingCost: 15,
  taxRate: 15,
  isMaintenanceMode: false
};

export const SettingsManager: React.FC<SettingsManagerProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // حالات نموذج تغيير كلمة المرور
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<StoreSettingsFormData>({
    defaultValues: FALLBACK_SETTINGS
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminService.getSettings();
        if (!cancelled) reset(data);
      } catch (e) {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const handleFormSubmit = async (data: StoreSettingsFormData) => {
    setIsSubmitting(true);
    try {
      const saved = await adminService.updateSettings(data);
      reset(saved);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      alert(isAr ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError(isAr ? 'كلمة المرور الجديدة وتأكيدها غير متطابقتين' : 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(isAr ? 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف' : 'New password must be at least 6 characters');
      return;
    }

    setIsChangingPass(true);
    try {
      await adminService.changePassword(oldPassword, newPassword);
      setPasswordMessage(isAr ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.message || (isAr ? 'فشل تغيير كلمة المرور، تأكد من صحة كلمة المرور الحالية' : 'Failed to change password'));
    } finally {
      setIsChangingPass(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-xs font-semibold">{isAr ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'إعدادات المتجر العامة' : 'Store Settings & Configuration'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'تعديل اسم المتجر، وسائل التواصل، الضريبة، ورسوم الشحن الافتراضية'
              : 'Configure store title, support contacts, tax rate, and shipping defaults'}
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            {isAr ? 'تم حفظ التعديلات بنجاح!' : 'Settings saved successfully!'}
          </div>
        )}

        {loadError && (
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
            <AlertTriangle className="w-4 h-4" />
            {isAr
              ? 'تعذر تحميل الإعدادات من الخادم، يتم عرض القيم الافتراضية.'
              : 'Could not load settings from the server, showing defaults.'}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            {isAr ? 'هوية ومسمى المتجر' : 'Store Identity'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'اسم المتجر (بالعربية)' : 'Store Name (Arabic)'}
              </label>
              <input
                type="text"
                {...register('storeNameAr', { required: true })}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'اسم المتجر (بالإنجليزية)' : 'Store Name (English)'}
              </label>
              <input
                type="text"
                {...register('storeNameEn', { required: true })}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            {isAr ? 'معلومات التواصل والدعم الفني' : 'Support & Contact Info'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'بريد الدعم الفني' : 'Support Email'}
              </label>
              <input
                type="email"
                {...register('supportEmail', { required: true })}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'رقم هاتف / واتساب الدعم' : 'Support Phone Number'}
              </label>
              <input
                type="text"
                {...register('supportPhone')}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 dir-ltr text-right"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            {isAr ? 'الشحن والضرائب والعملة' : 'Shipping, Taxes & Currency'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'رمز العملة' : 'Currency Symbol'}
              </label>
              <input
                type="text"
                {...register('currency')}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'رسوم الشحن الافتراضية (ر.س)' : 'Default Shipping Rate'}
              </label>
              <input
                type="number"
                {...register('defaultShippingCost', { valueAsNumber: true })}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'نسبة القيمة المضافة VAT (%)' : 'VAT Rate (%)'}
              </label>
              <input
                type="number"
                {...register('taxRate', { valueAsNumber: true })}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">
                {isAr ? 'وضع الصيانة التجريبية' : 'Store Maintenance Mode'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isAr
                  ? 'إغلاق واجهة المتجر مؤقتاً لأعمال التطوير'
                  : 'Temporarily pause store ordering for site updates'}
              </p>
            </div>
            <input
              type="checkbox"
              {...register('isMaintenanceMode')}
              className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isAr ? 'حفظ إعدادات المتجر' : 'Save Store Settings'}
          </button>
        </div>
      </form>

      {/* قسم تغيير كلمة المرور للأدمن */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 mt-8">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          {isAr ? 'تغيير كلمة مرور لوحة التحكم' : 'Change Admin Dashboard Password'}
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'كلمة المرور الحالية' : 'Current Password'}
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {passwordError && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">{passwordError}</p>
          )}
          {passwordMessage && (
            <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">{passwordMessage}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              {isChangingPass && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAr ? 'تحديث كلمة المرور' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};