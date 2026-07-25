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
import { useForm } from 'react-hook-form';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Upload,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product, Category, Language } from '../../types';
import { ProductFormData } from '../../types/admin';

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  lang: Language;
  onSaveProduct: (data: ProductFormData) => Promise<void>;
  onSoftDeleteProduct: (id: string) => Promise<void>;
  onRestoreProduct: (id: string) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  categories,
  isLoading,
  lang,
  onSaveProduct,
  onSoftDeleteProduct,
  onRestoreProduct,
  onDeleteProduct,
  onUploadImage
}) => {
  const isAr = lang === 'ar';

  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // React Hook Form for Product Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ProductFormData>({
    defaultValues: {
      category: categories[0] || 'electronics',
      price: 100,
      stock: 10,
      lowStockThreshold: 5,
      status: 'Active',
      isFeatured: false,
      image: '',
      nameAr: '',
      descAr: '',
      nameEn: '',
      descEn: '',
      featuresAr: [],
      featuresEn: [],
      specsAr: {},
      specsEn: {}
    }
  });

  const imageUrlValue = watch('image');

  const openAddModal = () => {
    setEditingProduct(null);
    reset({
      category: categories[0] || 'electronics',
      price: 100,
      originalPrice: undefined,
      stock: 10,
      lowStockThreshold: 5,
      sku: '',
      barcode: '',
      status: 'Active',
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      nameAr: '',
      descAr: '',
      nameEn: '',
      descEn: '',
      featuresAr: [],
      featuresEn: [],
      specsAr: {},
      specsEn: {}
    });
    setUploadError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    // التأكد من تمرير المميزات والمواصفات حتى لا يتم فقدانها عند التعديل
    reset({
      id: product.id,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 5,
      sku: product.sku || '',
      barcode: product.barcode || '',
      status: product.status || 'Active',
      isFeatured: Boolean(product.isFeatured),
      image: product.image,
      nameAr: product.ar?.name || '',
      descAr: product.ar?.description || '',
      nameEn: product.en?.name || '',
      descEn: product.en?.description || '',
      featuresAr: product.ar?.features || [],
      featuresEn: product.en?.features || [],
      specsAr: product.ar?.specs || {},
      specsEn: product.en?.specs || {}
    });
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await onSaveProduct(data);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err?.message || (isAr ? 'حدث خطأ أثناء حفظ المنتج' : 'Failed to save product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(isAr ? 'يرجى اختيار ملف صورة صالحة (PNG, JPG, WEBP)' : 'Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(isAr ? 'حجم الصورة يتجاوز الحد المسموح (5 ميجابايت)' : 'Image size exceeds 5MB limit');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    try {
      const url = await onUploadImage(file);
      setValue('image', url, { shouldValidate: true });
    } catch (err: any) {
      setUploadError(err?.message || (isAr ? 'فشل رفع الصورة' : 'Failed to upload image'));
    } finally {
      setIsUploading(false);
    }
  };

  // Filtered Products
  const filteredData = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter((p) => {
      if (showDeleted) {
        if (!p.isDeleted) return false;
      } else {
        if (p.isDeleted) return false;
      }

      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'in_stock' && p.stock <= 0) return false;
        if (statusFilter === 'out_of_stock' && p.stock > 0) return false;
        if (statusFilter === 'low_stock' && (p.stock > 5 || p.stock <= 0)) return false;
        if (statusFilter === 'featured' && !p.isFeatured) return false;
        if (statusFilter === 'Active' && p.status !== 'Active') return false;
        if (statusFilter === 'Hidden' && p.status !== 'Hidden') return false;
      }

      return true;
    });
  }, [products, showDeleted, selectedCategory, statusFilter]);

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'image',
        header: isAr ? 'الصورة' : 'Image',
        cell: (info) => (
          <img
            src={info.getValue() as string}
            alt="Product"
            className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm"
          />
        )
      },
      {
        accessorFn: (row) => (isAr ? row.ar?.name : row.en?.name) || row.ar?.name || row.en?.name || 'Product',
        id: 'name',
        header: isAr ? 'اسم المنتج' : 'Product Name',
        cell: (info) => {
          const row = info.row.original;
          const name = (isAr ? row.ar?.name : row.en?.name) || row.ar?.name || row.en?.name || 'Product';
          return (
            <div>
              <p className="font-semibold text-slate-900">{name}</p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                {row.sku && <span>SKU: {row.sku}</span>}
                {row.barcode && <span>• Barcode: {row.barcode}</span>}
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'category',
        header: isAr ? 'القسم' : 'Category',
        cell: (info) => (
          <span className="capitalize text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
            {info.getValue() as string}
          </span>
        )
      },
      {
        accessorKey: 'price',
        header: isAr ? 'السعر' : 'Price',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <span className="font-bold text-slate-900">{row.price} {isAr ? 'ر.س' : 'SAR'}</span>
              {row.originalPrice && (
                <span className="text-xs text-slate-400 line-through block">
                  {row.originalPrice} {isAr ? 'ر.س' : 'SAR'}
                </span>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'stock',
        header: isAr ? 'المخزون' : 'Stock',
        cell: (info) => {
          const row = info.row.original;
          const isLow = row.stock <= (row.lowStockThreshold || 5) && row.stock > 0;
          const isOut = row.stock <= 0;

          return (
            <div>
              {isOut ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  <AlertTriangle className="w-3 h-3" /> {isAr ? 'نفذت الكمية' : 'Out of Stock'}
                </span>
              ) : isLow ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertTriangle className="w-3 h-3" /> {row.stock} {isAr ? 'متبقي' : 'Left'}
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {row.stock} {isAr ? 'متوفر' : 'In Stock'}
                </span>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'status',
        header: isAr ? 'الحالة' : 'Status',
        cell: (info) => {
          const row = info.row.original;
          if (row.isDeleted) {
            return (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {isAr ? 'محذوف مؤقتاً' : 'Soft Deleted'}
              </span>
            );
          }
          return (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                row.status === 'Hidden'
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : row.status === 'OutOfStock'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {row.status || 'Active'}
            </span>
          );
        }
      },
      {
        id: 'actions',
        header: isAr ? 'الإجراءات' : 'Actions',
        cell: (info) => {
          const product = info.row.original;
          if (product.isDeleted) {
            return (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRestoreProduct(product.id)}
                  title={isAr ? 'استعادة المنتج' : 'Restore Product'}
                  className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    // تصحيح الخطأ الإملائي إلى "متأكد"
                    if (confirm(isAr ? 'هل أنت متأكد من الحذف النهائي؟' : 'Permanently delete this product?')) {
                      onDeleteProduct(product.id);
                    }
                  }}
                  title={isAr ? 'حذف نهائي' : 'Permanent Delete'}
                  className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(product)}
                title={isAr ? 'تعديل' : 'Edit'}
                className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSoftDeleteProduct(product.id)}
                title={isAr ? 'حذف مؤقت' : 'Soft Delete'}
                className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        }
      }
    ],
    [isAr, onRestoreProduct, onDeleteProduct, onSoftDeleteProduct]
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
        pageSize: 8
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة كتالوج المنتجات' : 'Product Catalog Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? `إجمالي ${products.length} منتج مسجل بالكتالوج`
              : `Total ${products.length} products listed in store`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2 ${
              showDeleted
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {isAr ? (showDeleted ? 'عرض المنتجات النشطة' : 'سلة المحذوفات') : (showDeleted ? 'Show Active' : 'Trash Bin')}
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إضافة منتج جديد' : 'Add New Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 right-auto rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، الكود SKU، الباركود...' : 'Search product name, SKU, barcode...'}
            className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{isAr ? 'جميع الأقسام' : 'All Categories'}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="in_stock">{isAr ? 'متوفر بالمخزون' : 'In Stock'}</option>
            <option value="low_stock">{isAr ? 'مخزون منخفض' : 'Low Stock'}</option>
            <option value="out_of_stock">{isAr ? 'منتهي المخزون' : 'Out of Stock'}</option>
            <option value="featured">{isAr ? 'منتجات مميزة' : 'Featured Only'}</option>
            <option value="Active">{isAr ? 'نشط' : 'Active'}</option>
            <option value="Hidden">{isAr ? 'مخفي' : 'Hidden'}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">{isAr ? 'جاري تحميل قائمة المنتجات...' : 'Loading product catalog...'}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              {isAr ? 'لا توجد منتجات تطابق شروط البحث' : 'No products found matching criteria'}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct
                  ? isAr
                    ? 'تعديل بيانات المنتج'
                    : 'Edit Product Details'
                  : isAr
                  ? 'إضافة منتج جديد'
                  : 'Add New Product'}
              </h3>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  {isAr ? 'صورة المنتج المرفوعة محلياً' : 'Local Product Image'}
                </label>
                <div className="flex items-center gap-4">
                  {imageUrlValue ? (
                    <img
                      src={imageUrlValue}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-xl border border-slate-300 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-colors">
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>{isAr ? 'رفع صورة من جهازك' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    {uploadError && <p className="text-xs text-rose-600 font-medium">{uploadError}</p>}
                  </div>
                </div>

                <input
                  type="text"
                  {...register('image', { required: isAr ? 'رابط الصورة مطلوب' : 'Image URL is required' })}
                  placeholder={isAr ? 'أو أدخل رابط الصورة المباشر' : 'Or enter direct image URL'}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                {errors.image && <p className="text-xs text-rose-600">{errors.image.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'اسم المنتج (بالعربية)' : 'Product Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    {...register('nameAr', { required: isAr ? 'الاسم بالعربية مطلوب' : 'Arabic name required' })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  {errors.nameAr && <p className="text-xs text-rose-600 mt-1">{errors.nameAr.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'اسم المنتج (بالإنجليزية)' : 'Product Name (English)'}
                  </label>
                  <input
                    type="text"
                    {...register('nameEn', { required: isAr ? 'الاسم بالإنجليزية مطلوب' : 'English name required' })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  {errors.nameEn && <p className="text-xs text-rose-600 mt-1">{errors.nameEn.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'القسم' : 'Category'}
                  </label>
                  <select
                    {...register('category')}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 capitalize"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'السعر الحالي (ر.س)' : 'Price (SAR)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true, required: true, min: 0.1 })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'السعر الأصلي (اختياري)' : 'Original Price (Optional)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('originalPrice', { valueAsNumber: true })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'الكمية بالمخزن' : 'Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    {...register('stock', { valueAsNumber: true, required: true, min: 0 })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'حد التنبيه للمخزون' : 'Low Stock Limit'}
                  </label>
                  <input
                    type="number"
                    {...register('lowStockThreshold', { valueAsNumber: true })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'حالة المنتج' : 'Status'}
                  </label>
                  <select
                    {...register('status')}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Active">{isAr ? 'نشط (Active)' : 'Active'}</option>
                    <option value="Hidden">{isAr ? 'مخفي (Hidden)' : 'Hidden'}</option>
                    <option value="OutOfStock">{isAr ? 'منتهي المخزون' : 'Out of Stock'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'رمز المنتج SKU' : 'SKU Code'}
                  </label>
                  <input
                    type="text"
                    {...register('sku')}
                    placeholder="e.g. PROD-1029"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'الباركود Barcode' : 'Barcode'}
                  </label>
                  <input
                    type="text"
                    {...register('barcode')}
                    placeholder="e.g. 6281000201"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'الوصف (بالعربية)' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    rows={3}
                    {...register('descAr')}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? 'الوصف (بالإنجليزية)' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={3}
                    {...register('descEn')}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...register('isFeatured')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-slate-800 cursor-pointer">
                  {isAr ? 'منتج مميز (يظهر في القسم الموصى به)' : 'Featured product (Display on highlights)'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAr ? 'حفظ البيانات' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};