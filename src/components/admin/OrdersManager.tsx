import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table';
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  X,
  Filter,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Printer
} from 'lucide-react';
import { AdminOrder } from '../../types/admin';
import { Language } from '../../types';

interface OrdersManagerProps {
  orders: AdminOrder[];
  isLoading: boolean;
  lang: Language;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  selectedOrderId?: string | null;
  onClearSelectedOrderId?: () => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({
  orders,
  isLoading,
  lang,
  onUpdateStatus,
  selectedOrderId,
  onClearSelectedOrderId
}) => {
  const isAr = lang === 'ar';

  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Auto-open modal if selectedOrderId prop was provided
  React.useEffect(() => {
    const list = Array.isArray(orders) ? orders : [];
    if (selectedOrderId && list.length > 0) {
      const match = list.find((o) => o.id === selectedOrderId);
      if (match) {
        setViewingOrder(match);
      }
    }
  }, [selectedOrderId, orders]);

  const handleCloseModal = () => {
    setViewingOrder(null);
    if (onClearSelectedOrderId) {
      onClearSelectedOrderId();
    }
  };

  const statusBadges: Record<string, { labelAr: string; labelEn: string; bg: string; text: string; icon: any }> = {
    placed: { labelAr: 'طلب جديد', labelEn: 'Placed', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
    verified: { labelAr: 'مؤكد', labelEn: 'Verified', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: CheckCircle2 },
    packing: { labelAr: 'قيد التجهيز', labelEn: 'Packing', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', icon: PackageCheck },
    shipping: { labelAr: 'جاري الشحن', labelEn: 'Shipping', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: Truck },
    delivered: { labelAr: 'تم التسليم', labelEn: 'Delivered', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ ...viewingOrder, status: newStatus as any });
      }
    } catch (err: any) {
      alert(err?.message || (isAr ? 'فشل تحديث حالة الطلب' : 'Failed to update order status'));
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handlePrintInvoice = (order: AdminOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(isAr ? 'الرجاء السماح بالنوافذ المنبثقة لطباعة الفاتورة' : 'Please allow popups to print the invoice');
      return;
    }

    const direction = isAr ? 'rtl' : 'ltr';
    const storeName = isAr ? 'المتجر الفاخر المتكامل' : 'Luxury Premium Store';
    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 8px; text-align: start; font-size: 13px;">${isAr ? item.nameAr : item.nameEn}</td>
        <td style="padding: 10px 8px; text-align: center; font-size: 13px;">${item.price} ${isAr ? 'ر.س' : 'SAR'}</td>
        <td style="padding: 10px 8px; text-align: center; font-size: 13px;">${item.quantity}</td>
        <td style="padding: 10px 8px; text-align: end; font-size: 13px; font-weight: bold; color: #0f172a;">${(item.price * item.quantity).toFixed(2)} ${isAr ? 'ر.س' : 'SAR'}</td>
      </tr>
    `).join('');

    const invoiceContent = `
      <!DOCTYPE html>
      <html dir="${direction}" lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color: #1e293b; margin: 40px; line-height: 1.5; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
          .title { font-size: 20px; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .info-card h4 { margin-top: 0; margin-bottom: 10px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
          .info-card p { margin: 4px 0; font-size: 12px; color: #334155; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #0f172a; color: #ffffff; padding: 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; text-align: start; }
          .totals { width: 280px; margin-left: auto; margin-right: ${isAr ? 'unset' : '0'}; margin-left: ${isAr ? '0' : 'unset'}; margin-top: 20px; font-size: 13px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; color: #475569; }
          .grand-total { display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #0f172a; font-weight: 800; font-size: 15px; margin-top: 8px; color: #0f172a; }
          .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print {
            body { margin: 20px; background: #fff; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">${storeName}</div>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Riyadh, Saudi Arabia | support@luxury-store.com</p>
          </div>
          <div style="text-align: ${isAr ? 'left' : 'right'};">
            <div class="title">${isAr ? 'فاتورة مبيعات' : 'Sales Invoice'}</div>
            <p style="margin: 4px 0; font-size: 13px; font-weight: 700; font-family: monospace; color: #0f172a;">ID: #${order.id}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #64748b;">${isAr ? 'التاريخ' : 'Date'}: ${new Date(order.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h4>${isAr ? 'تفاصيل العميل' : 'Customer Details'}</h4>
            <p><strong>${isAr ? 'الاسم:' : 'Name:'}</strong> ${order.fullName}</p>
            <p><strong>${isAr ? 'الجوال:' : 'Phone:'}</strong> ${order.phone}</p>
            <p><strong>${isAr ? 'البريد الإلكتروني:' : 'Email:'}</strong> ${order.email}</p>
          </div>
          <div class="info-card">
            <h4>${isAr ? 'تفاصيل الشحن والتوصيل' : 'Shipping Details'}</h4>
            <p><strong>${isAr ? 'المدينة:' : 'City:'}</strong> ${order.city}</p>
            <p><strong>${isAr ? 'العنوان:' : 'Address:'}</strong> ${order.address}</p>
            <p><strong>${isAr ? 'الرمز البريدي:' : 'Zip:'}</strong> ${order.zipCode || 'N/A'}</p>
            <p><strong>${isAr ? 'طريقة الدفع:' : 'Payment:'}</strong> ${order.paymentMethod.toUpperCase()}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="padding: 10px; text-align: start;">${isAr ? 'المنتج' : 'Item'}</th>
              <th style="padding: 10px; text-align: center;">${isAr ? 'سعر الوحدة' : 'Price'}</th>
              <th style="padding: 10px; text-align: center;">${isAr ? 'الكمية' : 'Qty'}</th>
              <th style="padding: 10px; text-align: end;">${isAr ? 'المجموع' : 'Subtotal'}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>${isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
            <span>${order.subtotal.toFixed(2)} ${isAr ? 'ر.س' : 'SAR'}</span>
          </div>
          ${order.discount > 0 ? `
          <div class="total-row" style="color: #16a34a; font-weight: bold;">
            <span>${isAr ? 'الخصم المطبق:' : 'Discount:'}</span>
            <span>-${order.discount.toFixed(2)} ${isAr ? 'ر.س' : 'SAR'}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>${isAr ? 'رسوم الشحن:' : 'Shipping Cost:'}</span>
            <span>${order.shippingCost.toFixed(2)} ${isAr ? 'ر.س' : 'SAR'}</span>
          </div>
          <div class="grand-total">
            <span>${isAr ? 'المجموع الإجمالي:' : 'Total Amount:'}</span>
            <span>${order.total.toFixed(2)} ${isAr ? 'ر.س' : 'SAR'}</span>
          </div>
        </div>

        <div class="footer">
          <p>${isAr ? 'نشكركم على تسوقكم معنا!' : 'Thank you for your purchase!'}</p>
          <p>${isAr ? 'إذا كان لديك أي استفسار، يرجى مراسلتنا على support@luxury-store.com' : 'For inquiries, please reach out to support@luxury-store.com'}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  // Filtered Orders
  const filteredData = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [orders, statusFilter]);

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<AdminOrder>[]>(
    () => [
      {
        accessorKey: 'id',
        header: isAr ? 'رقم الطلب' : 'Order ID',
        cell: (info) => (
          <span className="font-mono text-xs font-bold text-slate-900">
            #{ (String(info.getValue() || '')).slice(0, 8) }
          </span>
        )
      },
      {
        accessorKey: 'fullName',
        header: isAr ? 'العميل' : 'Customer',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <p className="font-semibold text-slate-900">{row.fullName}</p>
              <p className="text-xs text-slate-400">{row.phone || row.email}</p>
            </div>
          );
        }
      },
      {
        accessorKey: 'city',
        header: isAr ? 'المدينة' : 'City',
        cell: (info) => (
          <span className="text-xs font-medium text-slate-700">{info.getValue() as string}</span>
        )
      },
      {
        accessorKey: 'total',
        header: isAr ? 'المبلغ الإجمالي' : 'Total Amount',
        cell: (info) => (
          <span className="font-bold text-slate-900">
            {info.getValue() as number} {isAr ? 'ر.س' : 'SAR'}
          </span>
        )
      },
      {
        accessorKey: 'status',
        header: isAr ? 'حالة الطلب' : 'Status',
        cell: (info) => {
          const order = info.row.original;
          const badge = statusBadges[order.status] || statusBadges.placed;
          const isUpdating = isUpdatingStatus === order.id;

          return (
            <div className="flex items-center gap-2">
              <select
                value={order.status}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className={`py-1 px-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer focus:outline-none ${badge.bg} ${badge.text}`}
              >
                <option value="placed">{isAr ? 'طلب جديد (Placed)' : 'Placed'}</option>
                <option value="verified">{isAr ? 'مؤكد (Verified)' : 'Verified'}</option>
                <option value="packing">{isAr ? 'تجهيز (Packing)' : 'Packing'}</option>
                <option value="shipping">{isAr ? 'شحن (Shipping)' : 'Shipping'}</option>
                <option value="delivered">{isAr ? 'تسليم (Delivered)' : 'Delivered'}</option>
              </select>

              {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />}
            </div>
          );
        }
      },
      {
        accessorKey: 'createdAt',
        header: isAr ? 'التاريخ' : 'Date',
        cell: (info) => (
          <span className="text-xs text-slate-500">
            {info.getValue() ? new Date(info.getValue() as string).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : ''}
          </span>
        )
      },
      {
        id: 'actions',
        header: isAr ? 'التفاصيل' : 'Details',
        cell: (info) => {
          const order = info.row.original;
          return (
            <button
              onClick={() => setViewingOrder(order)}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              {isAr ? 'عرض' : 'View'}
            </button>
          );
        }
      }
    ],
    [isAr, isUpdatingStatus]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة الطلبات والشحنات' : 'Orders & Shipping Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? `إجمالي ${orders.length} طلب مسجل في النظام`
              : `Total ${orders.length} orders recorded in system`}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 right-auto rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={isAr ? 'بحث برقم الطلب، اسم العميل، البريد الإلكتروني، الجوال...' : 'Search order ID, customer name, email, phone...'}
            className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{isAr ? 'جميع حالات الطلب' : 'All Order Statuses'}</option>
            <option value="placed">{isAr ? 'طلب جديد (Placed)' : 'Placed'}</option>
            <option value="verified">{isAr ? 'مؤكد (Verified)' : 'Verified'}</option>
            <option value="packing">{isAr ? 'قيد التجهيز (Packing)' : 'Packing'}</option>
            <option value="shipping">{isAr ? 'جاري الشحن (Shipping)' : 'Shipping'}</option>
            <option value="delivered">{isAr ? 'تم التسليم (Delivered)' : 'Delivered'}</option>
          </select>
        </div>
      </div>

      {/* TanStack Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">{isAr ? 'جاري تحميل الطلبات...' : 'Loading orders...'}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              {isAr ? 'لا توجد طلبات مطابقة' : 'No matching orders found'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="py-3 px-4 text-start">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3.5 px-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs text-slate-500">
              <div>
                {isAr
                  ? `عرض الصفحة ${table.getState().pagination.pageIndex + 1} من ${table.getPageCount()}`
                  : `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 font-mono">
                  #{viewingOrder.id.slice(0, 8)}
                </h3>
                <span className="text-xs text-slate-400 font-semibold">
                  {new Date(viewingOrder.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? 'تفاصيل الطلب ومعلومات العميل والشحن' : 'Detailed order summary and shipping info'}
              </p>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">
                {isAr ? 'تحديث حالة الشحن والطلب:' : 'Update Order Status:'}
              </span>
              <div className="flex items-center gap-2">
                {['placed', 'verified', 'packing', 'shipping', 'delivered'].map((st) => {
                  const badge = statusBadges[st];
                  const isActive = viewingOrder.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(viewingOrder.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                        isActive
                          ? `${badge.bg} ${badge.text} ring-2 ring-emerald-500`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isAr ? badge.labelAr : badge.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  {isAr ? 'معلومات العميل' : 'Customer Info'}
                </h4>
                <p className="text-sm font-semibold text-slate-900">{viewingOrder.fullName}</p>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {viewingOrder.email}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {viewingOrder.phone}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {isAr ? 'عنوان التوصيل والمنطقة' : 'Shipping Address'}
                </h4>
                <p className="text-sm font-semibold text-slate-900">{viewingOrder.city}</p>
                <p className="text-xs text-slate-600">{viewingOrder.address}</p>
                <p className="text-xs text-slate-400">Zip: {viewingOrder.zipCode || 'N/A'}</p>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800">
                {isAr ? 'المنتجات المطلوبة' : 'Order Items'}
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-start">{isAr ? 'المنتج' : 'Item'}</th>
                      <th className="py-2.5 px-3 text-center">{isAr ? 'السعر' : 'Unit Price'}</th>
                      <th className="py-2.5 px-3 text-center">{isAr ? 'الكمية' : 'Qty'}</th>
                      <th className="py-2.5 px-3 text-end">{isAr ? 'المجموع' : 'Subtotal'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingOrder.items.map((item) => (
                      <tr key={item.id || item.productId}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {isAr ? item.nameAr : item.nameEn}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">
                          {item.price} {isAr ? 'ر.س' : 'SAR'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          x{item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-end font-bold text-slate-900">
                          {item.price * item.quantity} {isAr ? 'ر.س' : 'SAR'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-semibold">{viewingOrder.subtotal} {isAr ? 'ر.س' : 'SAR'}</span>
              </div>
              {viewingOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{isAr ? 'الخصم المطبق:' : 'Discount:'}</span>
                  <span>-{viewingOrder.discount} {isAr ? 'ر.س' : 'SAR'}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>{isAr ? 'رسوم الشحن:' : 'Shipping Cost:'}</span>
                <span className="font-semibold">{viewingOrder.shippingCost} {isAr ? 'ر.س' : 'SAR'}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                <span>{isAr ? 'المبلغ الإجمالي المنسق:' : 'Total Amount:'}</span>
                <span className="text-emerald-700">{viewingOrder.total} {isAr ? 'ر.س' : 'SAR'}</span>
              </div>
            </div>

            {/* Status Timeline History Logs */}
            {viewingOrder.statusHistory && viewingOrder.statusHistory.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 text-start">
                  {isAr ? 'سجل تتبع الشحنة وتغير الحالة' : 'Status Timeline History Logs'}
                </h4>
                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                  {viewingOrder.statusHistory.map((h) => (
                    <div key={h.id} className="text-[11px] border-b border-slate-100 pb-2 last:border-0 last:pb-0 flex justify-between items-start gap-2 text-start">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800">
                            {isAr ? (statusBadges[h.toStatus]?.labelAr || h.toStatus) : (statusBadges[h.toStatus]?.labelEn || h.toStatus)}
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">{new Date(h.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">{h.notes}</p>
                      </div>
                      <span className="px-1.5 py-0.5 bg-slate-200/60 rounded text-slate-600 font-medium whitespace-nowrap">
                        {h.operatorName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => handlePrintInvoice(viewingOrder)}
                className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                {isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
              </button>
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
