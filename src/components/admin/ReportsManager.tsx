import React from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Award, BarChart3, Calendar, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { AdminStats } from '../../types/admin';
import { Product, Language } from '../../types';

interface ReportsManagerProps {
  stats: AdminStats | undefined;
  products: Product[];
  isLoading: boolean;
  lang: Language;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  stats,
  products,
  isLoading,
  lang
}) => {
  const isAr = lang === 'ar';

  if (isLoading || !stats) {
    return <div className="p-12 text-center text-slate-400">{isAr ? 'جاري إعداد التقارير والإحصائيات...' : 'Generating sales reports...'}</div>;
  }

  const avgOrderValue = stats.totalOrders > 0 ? Math.round(stats.totalSales / stats.totalOrders) : 0;

  // Top products calculation based on price and rating
  const topProducts = [...products]
    .sort((a, b) => b.rating * b.price - a.rating * a.price)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'التقارير المالية وإحصائيات الأداء' : 'Sales Analytics & Reports'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'مؤشرات الأداء الرئيسية والمبيعات الشهرية وأعلى المنتجات طلباً'
              : 'Key performance metrics, monthly trends, and best selling catalog items'}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{isAr ? 'إجمالي المبيعات المحققة' : 'Total Revenue'}</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {stats.totalSales.toLocaleString()} <span className="text-sm font-normal text-slate-500">{isAr ? 'ر.س' : 'SAR'}</span>
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-2">
            {isAr ? 'معدل أداء ممتاز' : 'Top Tier Growth'}
          </span>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{isAr ? 'متوسط قيمة السلة / الطلب' : 'Average Order Value'}</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {avgOrderValue.toLocaleString()} <span className="text-sm font-normal text-slate-500">{isAr ? 'ر.س' : 'SAR'}</span>
          </p>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-2">
            {isAr ? 'سلة متوازنة' : 'Healthy AOV'}
          </span>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{isAr ? 'إجمالي عدد الطلبات' : 'Total Completed Orders'}</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{stats.totalOrders}</p>
          <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-2">
            {isAr ? 'طلب مؤكد وشاحن' : 'Verified Transactions'}
          </span>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">
              {isAr ? 'المنتجات الأعلى مبيعاً وتقييماً' : 'Top Performing Products'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topProducts.map((prod, idx) => (
            <div
              key={prod.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  #{idx + 1}
                </span>
                <img
                  src={prod.image}
                  alt={isAr ? prod.ar.name : prod.en.name}
                  className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{isAr ? prod.ar.name : prod.en.name}</p>
                  <p className="text-xs text-slate-500">{prod.price} {isAr ? 'ر.س' : 'SAR'}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 block">
                  ★ {prod.rating} / 5
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Statistics Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base">
            {isAr ? 'ملخص إحصائيات الشهر الحالي' : 'Monthly Performance Summary'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="text-xs text-slate-500 font-medium">{isAr ? 'الطلبات المكتملة' : 'Delivered Orders'}</p>
            <p className="text-lg font-bold text-emerald-700">{stats?.statusCounts?.delivered || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="text-xs text-slate-500 font-medium">{isAr ? 'الطلبات قيد الشحن' : 'In Transit'}</p>
            <p className="text-lg font-bold text-purple-700">{stats?.statusCounts?.shipping || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="text-xs text-slate-500 font-medium">{isAr ? 'الطلبات الجديدة' : 'New Orders'}</p>
            <p className="text-lg font-bold text-amber-700">{stats?.statusCounts?.placed || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="text-xs text-slate-500 font-medium">{isAr ? 'مجموع المنتجات' : 'Total SKU Count'}</p>
            <p className="text-lg font-bold text-slate-900">{stats.totalProducts}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
