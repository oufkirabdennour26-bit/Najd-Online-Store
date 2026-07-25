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
import { Users, Search, Mail, Phone, MapPin, Eye, ShoppingBag, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AdminCustomer } from '../../types/admin';
import { Language } from '../../types';

interface CustomersManagerProps {
  customers: AdminCustomer[];
  isLoading: boolean;
  lang: Language;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({
  customers,
  isLoading,
  lang
}) => {
  const isAr = lang === 'ar';

  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);

  const safeCustomers = Array.isArray(customers) ? customers : [];

  const columns = useMemo<ColumnDef<AdminCustomer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: isAr ? 'اسم العميل' : 'Customer Name',
        cell: (info) => {
          const customer = info.row.original;
          const nameStr = customer.name || customer.email || 'Customer';
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {nameStr.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{customer.name || (isAr ? 'عميل' : 'Customer')}</p>
                <p className="text-xs text-slate-400">{customer.email}</p>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'phone',
        header: isAr ? 'رقم الهاتف' : 'Phone',
        cell: (info) => (
          <span className="text-xs text-slate-700 dir-ltr inline-block">
            {info.getValue() as string || 'N/A'}
          </span>
        )
      },
      {
        accessorKey: 'city',
        header: isAr ? 'المدينة / المنطقة' : 'City / Location',
        cell: (info) => (
          <span className="text-xs font-medium text-slate-700">{info.getValue() as string || 'N/A'}</span>
        )
      },
      {
        accessorKey: 'orderCount',
        header: isAr ? 'عدد الطلبات' : 'Total Orders',
        cell: (info) => (
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
            {info.getValue() as number} {isAr ? 'طلبات' : 'orders'}
          </span>
        )
      },
      {
        accessorKey: 'totalSpent',
        header: isAr ? 'إجمالي الإنفاق' : 'Total Spent',
        cell: (info) => (
          <span className="font-bold text-emerald-700 text-xs">
            {info.getValue() as number} {isAr ? 'ر.س' : 'SAR'}
          </span>
        )
      },
      {
        id: 'actions',
        header: isAr ? 'التفاصيل' : 'Details',
        cell: (info) => {
          const customer = info.row.original;
          return (
            <button
              onClick={() => setSelectedCustomer(customer)}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              {isAr ? 'الملف الشخصي' : 'Profile'}
            </button>
          );
        }
      }
    ],
    [isAr]
  );

  const table = useReactTable({
    data: safeCustomers,
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
            {isAr ? 'سجل العملاء والمشتريين' : 'Customer Directory'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? `إجمالي ${safeCustomers.length} عميل مسجل بالموقع`
              : `Total ${safeCustomers.length} registered customers in store`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 right-auto rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={isAr ? 'بحث باسم العميل، البريد الإلكتروني، رقم الهاتف، المدينة...' : 'Search customer name, email, phone, city...'}
            className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">{isAr ? 'جاري تحميل قائمة العملاء...' : 'Loading customer directory...'}</p>
          </div>
        ) : safeCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              {isAr ? 'لا يوجد عملاء مسجلين حالياً' : 'No customers registered yet'}
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

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base flex-shrink-0">
                {selectedCustomer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'عضو بالمتجر من تاريخ' : 'Customer since'} {new Date(selectedCustomer.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[11px] text-slate-400">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</p>
                  <p className="text-xs font-semibold text-slate-900">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[11px] text-slate-400">{isAr ? 'رقم الهاتف' : 'Phone Number'}</p>
                  <p className="text-xs font-semibold text-slate-900 dir-ltr text-right">{selectedCustomer.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[11px] text-slate-400">{isAr ? 'العنوان' : 'Address & City'}</p>
                  <p className="text-xs font-semibold text-slate-900">
                    {selectedCustomer.city} {selectedCustomer.address ? `- ${selectedCustomer.address}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-800 font-medium">{isAr ? 'إجمالي الطلبات' : 'Total Orders'}</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{selectedCustomer.orderCount}</p>
                </div>
                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <p className="text-xs text-blue-800 font-medium">{isAr ? 'إجمالي المشتريات' : 'Total Spent'}</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">{selectedCustomer.totalSpent} {isAr ? 'ر.س' : 'SAR'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl"
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
