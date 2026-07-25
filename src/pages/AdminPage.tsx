import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  X,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { Language, Product, Category } from '../types';
import {
  AdminStats,
  AdminOrder,
  AdminCustomer,
  ProductFormData,
  CategoryFormData,
  CouponFormData,
} from '../types/admin';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ProductsManager } from '../components/admin/ProductsManager';
import { CategoriesManager } from '../components/admin/CategoriesManager';
import { OrdersManager } from '../components/admin/OrdersManager';
import { CustomersManager } from '../components/admin/CustomersManager';
import { CouponsManager } from '../components/admin/CouponsManager';
import { ReportsManager } from '../components/admin/ReportsManager';
import { SettingsManager } from '../components/admin/SettingsManager';
import { InventoryLogsManager } from '../components/admin/InventoryLogsManager';

interface AdminPageProps {
  lang: Language;
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export function AdminPage({ lang, onClose, onProductsUpdated }: AdminPageProps) {
  const isAr = lang === 'ar';
  const queryClient = useQueryClient();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'coupons' | 'reports' | 'settings' | 'inventory'
  >('dashboard');

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Authentication State - the actual credential lives only in an httpOnly
  // cookie set by the server. This is just a UI flag, not a usable secret,
  // so it's safe to keep in memory/state instead of localStorage.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginEmail, setLoginEmail] = useState('admin@salla-store.sa');
  const [loginPassword, setLoginPassword] = useState('Admin@123456');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // On mount, check whether a valid session cookie already exists (e.g. the
  // admin refreshed the page) rather than reading a token out of storage.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminService.getMe();
        if (!cancelled && res?.success && res.data?.role === 'admin') {
          setIsAuthenticated(true);
        }
      } catch (e) {
        // No valid session - stay logged out
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const data = await adminService.login(loginEmail, loginPassword);
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        throw new Error(isAr ? 'فشل تسجيل الدخول' : 'Login failed');
      }
    } catch (err: any) {
      setLoginError(err.message || (isAr ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminService.logout();
    } catch (e) {
      // Even if the request fails, still log the UI out locally
    }
    setIsAuthenticated(false);
  };

  // --- REACT QUERY FETCHERS ---

  // 1. Stats Query
  const { data: stats, isLoading: isLoadingStats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => adminService.getStats(),
    enabled: isAuthenticated,
  });

  // 2. Products Query
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => productService.getProducts({ includeDeleted: true }),
    enabled: isAuthenticated,
  });

  // 3. Categories Query
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => productService.getCategories(),
    enabled: isAuthenticated,
  });

  // 4. Orders Query
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<AdminOrder[]>({
    queryKey: ['admin-orders'],
    queryFn: async () => adminService.getOrders(),
    enabled: isAuthenticated,
  });

  // 5. Customers Query
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery<AdminCustomer[]>({
    queryKey: ['admin-customers'],
    queryFn: async () => adminService.getCustomers(),
    enabled: isAuthenticated,
  });

  // 6. Coupons / Promos Query
  const { data: coupons = [], isLoading: isLoadingCoupons } = useQuery<CouponFormData[]>({
    queryKey: ['admin-coupons'],
    queryFn: async () => adminService.getCoupons(),
    enabled: isAuthenticated,
  });

  // Extract category slugs list
  const categorySlugs: Category[] = Array.isArray(categoriesData)
    ? categoriesData.map((c: any) => (typeof c === 'string' ? c : c.slug))
    : ['electronics', 'fashion', 'wellness', 'home'];

  // --- MUTATIONS ---

  // Product Mutations
  const saveProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => adminService.saveProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      if (onProductsUpdated) onProductsUpdated();
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (id: string) => adminService.softDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      if (onProductsUpdated) onProductsUpdated();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => adminService.restoreProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      if (onProductsUpdated) onProductsUpdated();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      if (onProductsUpdated) onProductsUpdated();
    },
  });

  // Image Upload Handler
  const uploadImageFile = async (file: File): Promise<string> => {
    return adminService.uploadProductImage(file);
  };

  // Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => adminService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      adminService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  // Order Status Mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) =>
      adminService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  // Coupon Mutations
  const createCouponMutation = useMutation({
    mutationFn: async (data: CouponFormData) => adminService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CouponFormData> }) =>
      adminService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const couponDeleteMutation = useMutation({
    mutationFn: async (id: string) => adminService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  // While verifying the existing session cookie, avoid flashing the login form
  if (isCheckingSession) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  // Render Login Modal if not logged in
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-8 space-y-6 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isAr ? 'بوابة التحكم والبرمجة' : 'Admin Portal Login'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'تسجيل الدخول الآمن لإدارة المتجر والمنتجات والطلبات'
                : 'Secure admin login to manage store products & orders'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'البريد الإلكتروني للإدارة' : 'Admin Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 right-auto rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 right-auto rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAr ? 'دخول لوحة التحكم' : 'Access Admin Dashboard'}
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 text-center">
            {isAr ? 'البيانات الافتراضية: admin@salla-store.sa | Admin@123456' : 'Default Credentials: admin@salla-store.sa | Admin@123456'}
          </div>
        </div>
      </div>
    );
  }

  // Navigation Items
  const navItems = [
    { id: 'dashboard', labelAr: 'اللوحة الرئيسية', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', labelAr: 'المنتجات والكتالوج', labelEn: 'Products', icon: Package },
    { id: 'categories', labelAr: 'الأقسام والهيكلة', labelEn: 'Categories', icon: FolderTree },
    { id: 'inventory', labelAr: 'إدارة المخزون', labelEn: 'Inventory', icon: Sliders },
    { id: 'orders', labelAr: 'الطلبات والشحنات', labelEn: 'Orders', icon: ShoppingBag },
    { id: 'customers', labelAr: 'قائمة العملاء', labelEn: 'Customers', icon: Users },
    { id: 'coupons', labelAr: 'قسائم الخصم', labelEn: 'Coupons', icon: Tag },
    { id: 'reports', labelAr: 'تقارير المبيعات', labelEn: 'Reports', icon: BarChart3 },
    { id: 'settings', labelAr: 'إعدادات المتجر', labelEn: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {isAr ? 'لوحة إشراف المتجر' : 'Store Admin Console'}
            </h1>
            <p className="text-xs text-slate-400">
              {isAr ? 'المتجر الإلكتروني متصل وجاهز' : 'Online Store REST API Connected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            title={isAr ? 'تسجيل الخروج' : 'Logout'}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{isAr ? 'خروج' : 'Logout'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
            title={isAr ? 'إغلاق والعودة للمتجر' : 'Back to Store View'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-slate-200 rtl:border-r-0 rtl:border-l p-4 flex flex-col justify-between overflow-y-auto flex-shrink-0 hidden md:flex">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{isAr ? item.labelAr : item.labelEn}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 rtl:rotate-180" />}
                </button>
              );
            })}
          </nav>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">{isAr ? 'حالة النظام' : 'System Status'}</p>
            <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API v1.0 Operational
            </p>
          </div>
        </aside>

        {/* Mobile Horizontal Navigation Header */}
        <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              isLoading={isLoadingStats}
              lang={lang}
              onSelectTab={(tab) => setActiveTab(tab as any)}
              onViewOrder={(orderId) => {
                setSelectedOrderId(orderId);
                setActiveTab('orders');
              }}
            />
          )}

          {activeTab === 'products' && (
            <ProductsManager
              products={products}
              categories={categorySlugs}
              isLoading={isLoadingProducts}
              lang={lang}
              onSaveProduct={async (data) => {
                await saveProductMutation.mutateAsync(data);
              }}
              onSoftDeleteProduct={async (id) => {
                await softDeleteMutation.mutateAsync(id);
              }}
              onRestoreProduct={async (id) => {
                await restoreMutation.mutateAsync(id);
              }}
              onDeleteProduct={async (id) => {
                await deleteMutation.mutateAsync(id);
              }}
              onUploadImage={uploadImageFile}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesManager
              categories={categorySlugs}
              detailedCategories={Array.isArray(categoriesData) ? categoriesData : []}
              isLoading={isLoadingCategories}
              lang={lang}
              onCreateCategory={async (data) => {
                await createCategoryMutation.mutateAsync(data);
              }}
              onUpdateCategory={async (id, data) => {
                await updateCategoryMutation.mutateAsync({ id, data });
              }}
              onDeleteCategory={async (id) => {
                await deleteCategoryMutation.mutateAsync(id);
              }}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersManager
              orders={orders}
              isLoading={isLoadingOrders}
              lang={lang}
              selectedOrderId={selectedOrderId}
              onClearSelectedOrderId={() => setSelectedOrderId(null)}
              onUpdateStatus={async (orderId, status) => {
                await updateOrderStatusMutation.mutateAsync({ orderId, status });
              }}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersManager
              customers={customers}
              isLoading={isLoadingCustomers}
              lang={lang}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsManager
              coupons={coupons}
              isLoading={isLoadingCoupons}
              lang={lang}
              onCreateCoupon={async (data) => {
                await createCouponMutation.mutateAsync(data);
              }}
              onUpdateCoupon={async (id, data) => {
                await updateCouponMutation.mutateAsync({ id, data });
              }}
              onDeleteCoupon={async (id) => {
                await couponDeleteMutation.mutateAsync(id);
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsManager
              stats={stats}
              products={products}
              isLoading={isLoadingStats}
              lang={lang}
            />
          )}

          {activeTab === 'settings' && <SettingsManager lang={lang} />}

          {activeTab === 'inventory' && (
            <InventoryLogsManager
              products={products}
              isLoadingProducts={isLoadingProducts}
              lang={lang}
            />
          )}
        </main>
      </div>
    </div>
  );
}
