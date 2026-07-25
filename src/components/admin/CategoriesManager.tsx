import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FolderTree, Plus, Edit, Trash2, X, Folder, ChevronRight, CornerDownRight, Loader2 } from 'lucide-react';
import { Category, Language } from '../../types';
import { CategoryFormData } from '../../types/admin';

interface DetailedCategory {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  parentId?: string | null;
  parent?: DetailedCategory | null;
  children?: DetailedCategory[];
}

interface CategoriesManagerProps {
  categories: Category[];
  detailedCategories?: DetailedCategory[];
  isLoading: boolean;
  lang: Language;
  onCreateCategory: (data: CategoryFormData) => Promise<void>;
  onUpdateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  categories,
  detailedCategories = [],
  isLoading,
  lang,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const isAr = lang === 'ar';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<DetailedCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoryFormData>();

  const openAddModal = () => {
    setEditingCat(null);
    reset({
      slug: '',
      nameAr: '',
      nameEn: '',
      parentId: null
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: DetailedCategory) => {
    setEditingCat(cat);
    reset({
      id: cat.id,
      slug: cat.slug,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      parentId: cat.parentId || null
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCat) {
        await onUpdateCategory(editingCat.id, data);
      } else {
        await onCreateCategory(data);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err?.message || (isAr ? 'حدث خطأ أثناء حفظ القسم' : 'Failed to save category'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build display category list
  const catList: DetailedCategory[] = detailedCategories.length > 0
    ? detailedCategories
    : categories.map((slug) => ({
        id: slug,
        slug,
        nameAr: slug === 'electronics' ? 'إلكترونيات' : slug === 'fashion' ? 'أزياء' : slug,
        nameEn: slug
      }));

  const rootCategories = catList.filter((c) => !c.parentId);
  const childMap = new Map<string, DetailedCategory[]>();
  catList.forEach((c) => {
    if (c.parentId) {
      const list = childMap.get(c.parentId) || [];
      list.push(c);
      childMap.set(c.parentId, list);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة الأقسام والفئات (Categories)' : 'Category & Hierarchy Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'إنشاء أقسام رئيسية وفرعية لتنظيم منتجات متجرك'
              : 'Create parent and nested sub-categories to organize your store'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة قسم جديد' : 'Add New Category'}
        </button>
      </div>

      {/* Categories Tree / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">{isAr ? 'جاري تحميل الأقسام...' : 'Loading categories...'}</p>
          </div>
        ) : catList.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Folder className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              {isAr ? 'لا توجد أقسام معرفة بعد' : 'No categories defined yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rootCategories.map((cat) => {
              const children = childMap.get(cat.id) || [];
              return (
                <div key={cat.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {isAr ? cat.nameAr : cat.nameEn}
                          </h4>
                          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                            slug: {cat.slug}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isAr ? `اسم بالإنجليزية: ${cat.nameEn}` : `Arabic Name: ${cat.nameAr}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                        title={isAr ? 'تعديل' : 'Edit'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(isAr ? 'هل أنت أصلح لحذف هذا القسم؟' : 'Are you sure you want to delete this category?')) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {children.length > 0 && (
                    <div className="mr-6 rtl:mr-6 ltr:ml-6 pl-2 border-r-2 rtl:border-r-2 rtl:border-emerald-300 ltr:border-l-2 ltr:border-emerald-300 space-y-2 pt-2">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="w-4 h-4 text-emerald-600 rtl:rotate-180" />
                            <div>
                              <span className="font-semibold text-xs text-slate-800">
                                {isAr ? child.nameAr : child.nameEn}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400 ml-2">
                                ({child.slug})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(child)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(isAr ? 'حذف هذا القسم الفرعي؟' : 'Delete sub-category?')) {
                                  onDeleteCategory(child.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:text-rose-800 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
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
                {editingCat
                  ? isAr
                    ? 'تعديل القسم'
                    : 'Edit Category'
                  : isAr
                  ? 'إضافة قسم جديد'
                  : 'Add New Category'}
              </h3>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'الرمز التعريفي (Slug)' : 'Category Slug'}
                </label>
                <input
                  type="text"
                  {...register('slug', { required: isAr ? 'الرمز مطلوب' : 'Slug is required' })}
                  placeholder="e.g. electronics, perfumes, watches"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                {errors.slug && <p className="text-xs text-rose-600 mt-1">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'اسم القسم (بالعربية)' : 'Category Name (Arabic)'}
                </label>
                <input
                  type="text"
                  {...register('nameAr', { required: isAr ? 'الاسم بالعربية مطلوب' : 'Arabic name required' })}
                  placeholder="مثال: أجهزة إلكترونية"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                {errors.nameAr && <p className="text-xs text-rose-600 mt-1">{errors.nameAr.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'اسم القسم (بالإنجليزية)' : 'Category Name (English)'}
                </label>
                <input
                  type="text"
                  {...register('nameEn', { required: isAr ? 'الاسم بالإنجليزية مطلوب' : 'English name required' })}
                  placeholder="e.g. Consumer Electronics"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                {errors.nameEn && <p className="text-xs text-rose-600 mt-1">{errors.nameEn.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'القسم الرئيسي (اختياري للربط الهرمي)' : 'Parent Category (Optional Nesting)'}
                </label>
                <select
                  {...register('parentId')}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="">{isAr ? 'لا يوجد (قسم رئيسي)' : 'None (Top Level Category)'}</option>
                  {catList
                    .filter((c) => c.id !== editingCat?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.nameAr : c.nameEn} ({c.slug})
                      </option>
                    ))}
                </select>
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
                  {isAr ? 'حفظ القسم' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
