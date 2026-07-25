import { Language, Product, Category } from './index';

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  statusCounts: {
    placed: number;
    verified: number;
    packing: number;
    shipping: number;
    delivered: number;
  };
  recentOrders: Array<{
    id: string;
    fullName: string;
    email: string;
    total: number;
    status: string;
    itemCount: number;
    createdAt: string;
  }>;
  categoriesCount: number;
}

export interface AdminOrder {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: 'placed' | 'verified' | 'packing' | 'shipping' | 'delivered';
  createdAt: string;
  secureToken: string;
  items: Array<{
    id: string;
    productId: string;
    nameAr: string;
    nameEn: string;
    price: number;
    quantity: number;
  }>;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface ProductFormData {
  id?: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  sku?: string;
  barcode?: string;
  status?: string;
  isFeatured?: boolean;
  image: string;
  nameAr: string;
  descAr: string;
  nameEn: string;
  descEn: string;
  featuresAr?: string[];
  featuresEn?: string[];
  specsAr?: Record<string, string>;
  specsEn?: Record<string, string>;
}

export interface CategoryFormData {
  id?: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  parentId?: string | null;
}

export interface CouponFormData {
  id?: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minSubtotal?: number;
  isActive: boolean;
  expiryDate?: string;
}

export interface StoreSettingsFormData {
  storeNameAr: string;
  storeNameEn: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  defaultShippingCost: number;
  taxRate: number;
  isMaintenanceMode: boolean;
}
