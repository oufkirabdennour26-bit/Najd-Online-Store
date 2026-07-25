import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  AlertTriangle,
  History,
  Search,
  PlusCircle,
  MinusCircle,
  Sliders,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { Product, Language } from '../../types';
import { adminService } from '../../services/adminService';

interface InventoryLogsManagerProps {
  products: Product[];
  isLoadingProducts: boolean;
  lang: Language;
}

export const InventoryLogsManager: React.FC<InventoryLogsManagerProps> = ({
  products,
  isLoadingProducts,
  lang
}) => {
  const isAr = lang === 'ar';
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  
  // Form State for Stock Adjustment
  const [adjType, setAdjType] = useState<'increase' | 'decrease' | 'set'>('increase');
  const [adjQuantity, setAdjQuantity] = useState(1);
  const [adjReason, setAdjReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Inventory Logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['inventory-logs'],
    queryFn: () => adminService.getInventoryLogs()
  });

  // Stock Mutation
  const adjustStockMutation = useMutation({
    mutationFn: async (payload: { productId: string; quantity: number; type: 'increase' | 'decrease' | 'set'; reason: string }) => {
      return adminService.adjustStock(payload.productId, payload.quantity, payload.type, payload.reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setAdjustingProduct(null);
      setAdjReason('');
      setAdjQuantity(1);
    }
  });

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    if (adjQuantity <= 0 && adjType !== 'set') return;

    setIsSubmitting(true);
    try {
      await adjustStockMutation.mutateAsync({
        productId: adjustingProduct.id,
        quantity: adjQuantity,
        type: adjType,
        reason: adjReason || (isAr ? 'تعديل يدوي للمخزون' : 'Manual stock adjustment')
      });
    } catch (err: any) {
      alert(err.message || (isAr ? 'فشل تعديل المخزون' : 'Failed to adjust stock'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter low stock products
  const lowStockProducts = products.filter(
    (p) => !p.isDeleted && p.stock <= (p.lowStockThreshold ?? 5)
  );

  // Filter product list for adjustment search
  const filteredProducts = products.filter((p) => {
    if (p.isDeleted) return false;
    const trans = isAr ? p.ar : p.en;
    const name = trans?.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'sale':
        return {
          bg: 'bg-indigo-50 border-indigo-200',
          text: 'text-indigo-700',
          label: isAr ? 'مبيعات' : 'Sale'
        };
      case 'increase':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-700',
          label: isAr ? 'زيادة' : 'Addition'
        };
      case 'decrease':
        return {
          bg: 'bg-rose-50 border-rose-200',
          text: 'text-rose-700',
          label: isAr ? 'نقصان' : 'Reduction'
        };
      case 'set':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-700',
          label: isAr ? 'تحديث مباشر' : 'Manual Override'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          text: 'text-slate-700',
          label: type
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة المخزون والتتبع الذكي' : 'Inventory & Intelligent Tracking'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'مراقبة مستويات مخزون المنتجات وتعديل كمياتها، مع سجل حركات المخزون الكامل'
              : 'Monitor live product stock levels, apply adjustments, and track system inventory logs.'}
          </p>
        </div>
      </div>

      {/* Grid of Alert + Adjust Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Low Stock Alert Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">
              {isAr ? 'تنبيهات المخزون المنخفض' : 'Low Stock Alerts'}
            </h3>
            <span className="mr-auto rtl:mr-0 rtl:ml-auto px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
              {lowStockProducts.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {isLoadingProducts ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                {isAr ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="font-semibold text-slate-600">{isAr ? 'جميع مستويات المخزون ممتازة' : 'All stock levels healthy'}</p>
                <p className="text-[10px]">{isAr ? 'لا توجد منتجات تحت الحد المسموح' : 'No items are below thresholds'}</p>
              </div>
            ) : (
              lowStockProducts.map((p) => {
                const trans = isAr ? p.ar : p.en;
                return (
                  <div
                    key={p.id}
                    className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="text-start min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{trans?.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {p.sku || 'N/A'}</p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-xs font-black text-rose-600">
                        {p.stock} / <span className="text-slate-400 text-[10px]">{p.lowStockThreshold ?? 5}</span>
                      </p>
                      <button
                        onClick={() => {
                          setAdjustingProduct(p);
                          setAdjType('increase');
                        }}
                        className="text-[10px] font-bold text-emerald-600 hover:underline mt-1 block"
                      >
                        {isAr ? 'تحديث سريع' : 'Quick Adjust'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 columns: Quick Adjustment Panel & Search Product */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">
                {isAr ? 'أداة التعديل الفوري للمخزون' : 'Manual Stock Override'}
              </h3>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 right-auto rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isAr ? 'ابحث باسم المنتج، SKU، أو الباركود لإجراء تعديل...' : 'Search product name, SKU, or Barcode to override stock...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
              {isLoadingProducts ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {isAr ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {isAr ? 'لا توجد منتجات مطابقة للبحث' : 'No matching products found'}
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const trans = isAr ? p.ar : p.en;
                  return (
                    <div
                      key={p.id}
                      className="p-2.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-lg flex justify-between items-center gap-3 transition-all"
                    >
                      <div className="text-start min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{trans?.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'} | Barcode: {p.barcode || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock === 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                          {isAr ? 'المخزون الحالي:' : 'Stock:'} {p.stock}
                        </span>
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjType('increase');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] rounded-md transition-colors"
                        >
                          {isAr ? 'تعديل' : 'Adjust'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Stock Logs Table Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-start">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">
            {isAr ? 'سجل حركات وتتبع المخزون الكامل (Audit Trail)' : 'Inventory Audit Trail Logs'}
          </h3>
        </div>

        {isLoadingLogs ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-xs">{isAr ? 'جاري تحميل السجلات والعمليات...' : 'Loading audit logs...'}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Activity className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">
              {isAr ? 'لا توجد حركات مخزون مسجلة بعد' : 'No inventory movements recorded yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">{isAr ? 'المنتج' : 'Product'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'نوع العملية' : 'Movement Type'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'قبل' : 'Before'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'التغيير' : 'Delta'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'بعد' : 'After'}</th>
                  <th className="py-2.5 px-3 text-start">{isAr ? 'السبب والبيان' : 'Reason / Reference'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'البيانات والمستخدم' : 'Operator'}</th>
                  <th className="py-2.5 px-3 text-end">{isAr ? 'التاريخ' : 'Timestamp'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: any) => {
                  const badge = getTypeBadge(log.type);
                  const prodName = isAr ? log.product?.nameAr : log.product?.nameEn;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 text-start font-semibold text-slate-900">
                        {prodName || (isAr ? 'منتج غير معروف' : 'Unknown Product')}
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">SKU: {log.product?.sku || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">{log.quantityBefore}</td>
                      <td className={`py-3 px-3 text-center font-mono font-bold ${log.delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {log.delta > 0 ? `+${log.delta}` : log.delta}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{log.quantityAfter}</td>
                      <td className="py-3 px-3 text-start text-slate-500 leading-normal max-w-xs truncate" title={log.reason}>
                        {log.reason}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium text-[10px]">
                          {log.operatorName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-end font-mono text-slate-400">
                        {new Date(log.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Dialog Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setAdjustingProduct(null)}
              className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-start">
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'تعديل مخزون المنتج يدوياً' : 'Adjust Product Stock Level'}
              </h3>
              <p className="text-xs font-semibold text-emerald-600 mt-1">
                {isAr ? adjustingProduct.ar?.name : adjustingProduct.en?.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">SKU: {adjustingProduct.sku || 'N/A'}</p>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-start">
              {/* Type selection button group */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isAr ? 'طبيعة ونوع الحركة والتعديل' : 'Adjustment Operation'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType('increase')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      adjType === 'increase'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isAr ? 'زيادة (+)' : 'Add (+)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('decrease')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      adjType === 'decrease'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>{isAr ? 'نقصان (-)' : 'Deduct (-)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('set')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      adjType === 'set'
                        ? 'bg-amber-50 border-amber-300 text-amber-700 ring-1 ring-amber-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>{isAr ? 'تعيين مخزون' : 'Set Fixed'}</span>
                  </button>
                </div>
              </div>

              {/* Input quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {adjType === 'set' ? (isAr ? 'المقدار الإجمالي الجديد للمخزون' : 'New Stock Level Value') : (isAr ? 'الكمية المطلوب تطبيقها' : 'Amount of units to change')}
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={adjQuantity}
                  onChange={(e) => setAdjQuantity(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAr ? `المخزون الحالي: ${adjustingProduct.stock} وحدة.` : `Current stock level: ${adjustingProduct.stock} units.`}
                </p>
              </div>

              {/* Reason input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'السبب والبيان (مطلوب لأغراض تدقيق النظام)' : 'Reason / Statement (Required for Audit Trail)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: جرد سنوي، توريد شحنة جديدة...' : 'e.g., Seasonal inventory audit, incoming supplier shipment...'}
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors text-center"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow transition-all flex items-center justify-center gap-1"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isAr ? 'تحديث وحفظ' : 'Apply Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
