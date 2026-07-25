export type Language = 'ar' | 'en';

export type Category = 'electronics' | 'home' | 'fashion' | 'wellness';

export interface ProductTranslation {
  name: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
}

export interface Product {
  id: string;
  category: Category;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  stock: number;
  lowStockThreshold?: number;
  sku?: string;
  barcode?: string;
  status?: string;
  isFeatured?: boolean;
  isDeleted?: boolean;
  ar: ProductTranslation;
  en: ProductTranslation;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface PaymentDetails {
  method: 'card' | 'paypal' | 'cod';
  cardName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  fromStatus: string;
  toStatus: string;
  operatorName: string;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  shipping: ShippingDetails;
  paymentMethod: 'card' | 'paypal' | 'cod';
  items: {
    productId: string;
    nameAr: string;
    nameEn: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: 'placed' | 'verified' | 'packing' | 'shipping' | 'delivered';
  createdAt: string;
  secureToken: string;
  statusHistory?: OrderStatusHistoryItem[];
}

export interface PromoCode {
  code: string;
  discountPercent: number;
}
