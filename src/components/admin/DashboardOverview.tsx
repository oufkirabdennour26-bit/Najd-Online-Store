import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  Building
} from 'lucide-react';
import { AdminStats, AdminOrder } from '../../types/admin';
import { Language } from '../../types';

interface DashboardOverviewProps {
  stats: AdminStats | undefined;
  isLoading: boolean;
  lang: Language;
  onSelectTab: (tab: 'products' | 'orders' | 'customers' | 'categories' | 'reports') => void;
  onViewOrder: (orderId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  isLoading,
  lang,
  onSelectTab,
  onViewOrder
}) => {
  const isAr = lang === 'ar';

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-2xl border border-slate-200"></div>
        ))}
      </div>
    );
  }

  const statusBadges: Record<string, { labelAr: string; labelEn: string; bg: string; text: string; icon: any }> = {
    placed: { labelAr: 'جديد', labelEn: 'Placed', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
    verified: { labelAr: 'مؤكد', labelEn: 'Verified', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: CheckCircle2 },
    packing: { labelAr: 'قيد التجهيز', labelEn: 'Packing', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', icon: PackageCheck },
    shipping: { labelAr: 'جاري الشحن', labelEn: 'Shipping', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: Truck },
    delivered: { labelAr: 'تم التسليم', labelEn: 'Delivered', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              {isAr ? 'إجمالي المبيعات' : 'Total Revenue'}
            </span>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {(stats.totalSales || 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">{isAr ? 'ر.س' : 'SAR'}</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +12.5%
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => onSelectTab('orders')}
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">
              {isAr ? 'إجمالي الطلبات' : 'Total Orders'}
            </span>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.totalOrders}</span>
            <span className="text-xs text-blue-600 group-hover:underline flex items-center gap-1">
              {isAr ? 'عرض' : 'View'} <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Customers */}
        <div
          onClick={() => onSelectTab('customers')}
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">
              {isAr ? 'العملاء المسجلين' : 'Customers'}
            </span>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.totalCustomers}</span>
            <span className="text-xs text-purple-600 group-hover:underline flex items-center gap-1">
              {isAr ? 'قائمة العملاء' : 'View List'} <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Active Products */}
        <div
          onClick={() => onSelectTab('products')}
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">
              {isAr ? 'المنتجات النشطة' : 'Active Products'}
            </span>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.totalProducts}</span>
            <span className="text-xs text-amber-600 group-hover:underline flex items-center gap-1">
              {isAr ? 'إدارة المنتجات' : 'Manage'} <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Low Stock Warning & Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert List */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">
                {isAr ? 'تنبيهات المخزون المنخفض' : 'Low Stock Alert'}
              </h3>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
              {stats.lowStockCount || (stats.lowStockProducts || []).length} {isAr ? 'منتجات' : 'items'}
            </span>
          </div>

          {(stats.lowStockProducts || []).length === 0 ? (
            <div className="my-auto py-8 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              {isAr ? 'جميع المنتجات متوفرة بكميات جيدة!' : 'All products have healthy stock levels!'}
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
              {(stats.lowStockProducts || []).map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={(isAr ? prod.ar?.name : prod.en?.name) || prod.ar?.name || prod.en?.name || 'Product'}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {(isAr ? prod.ar?.name : prod.en?.name) || prod.ar?.name || prod.en?.name || 'Product'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {prod.price} {isAr ? 'ر.س' : 'SAR'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 block">
                      {isAr ? `باقي ${prod.stock}` : `${prod.stock} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onSelectTab('products')}
            className="mt-4 w-full py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center"
          >
            {isAr ? 'تحديث كميات المخزون' : 'Update Stock Quantities'}
          </button>
        </div>

        {/* Order Status Breakdown & Quick Action */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {isAr ? 'حالات الطلبات الحالية' : 'Order Status Distribution'}
              </h3>
              <button
                onClick={() => onSelectTab('orders')}
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                {isAr ? 'إدارة كل الطلبات' : 'Manage All Orders'} <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(stats.statusCounts || {}).map(([key, count]) => {
                const badge = statusBadges[key] || statusBadges.placed;
                const Icon = badge.icon;
                return (
                  <div
                    key={key}
                    onClick={() => onSelectTab('orders')}
                    className={`p-3.5 rounded-xl border ${badge.bg} text-center cursor-pointer hover:opacity-90 transition-opacity`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${badge.text}`} />
                    <p className={`text-xl font-bold ${badge.text}`}>{count}</p>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      {isAr ? badge.labelAr : badge.labelEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              {isAr ? '💡 يتم تحديث بيانات اللوحة تلقائياً بالكامل' : '💡 Dashboard metrics auto-sync in real time'}
            </span>
            <button
              onClick={() => onSelectTab('reports')}
              className="text-emerald-700 font-semibold hover:underline"
            >
              {isAr ? 'عرض تقارير المبيعات التفصيلية 📊' : 'View Detailed Sales Reports 📊'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {isAr ? 'أحدث الطلبات المستلمة' : 'Recent Orders'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'آخر 5 طلبات تم تسجيلها في المتجر' : 'Latest 5 incoming orders in the store'}
            </p>
          </div>
          <button
            onClick={() => onSelectTab('orders')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            {isAr ? 'عرض كل الطلبات' : 'View All Orders'}
          </button>
        </div>

        {(stats.recentOrders || []).length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            {isAr ? 'لا توجد طلبات مسجلة بعد' : 'No orders recorded yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-3 px-4 text-start">{isAr ? 'رقم الطلب' : 'Order ID'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'المنتجات' : 'Items'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المبلغ' : 'Amount'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats.recentOrders || []).map((order) => {
                  const badge = statusBadges[order.status] || statusBadges.placed;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-900">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{order.fullName}</p>
                        <p className="text-xs text-slate-400">{order.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                        {order.itemCount}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {order.total} {isAr ? 'ر.س' : 'SAR'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text}`}
                        >
                          {isAr ? badge.labelAr : badge.labelEn}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : ''}
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <button
                          onClick={() => onViewOrder(order.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs rounded-lg transition-colors"
                        >
                          {isAr ? 'تفاصيل' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
