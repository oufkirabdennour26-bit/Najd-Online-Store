import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface AccessTokenPayload extends UserPayload {
  type: 'access';
}

export interface RefreshTokenPayload {
  id: string;
  type: 'refresh';
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface FormattedProduct {
  id: string;
  categoryId: string;
  category: string;
  categoryDetails?: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    parentId?: string | null;
  };
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  stock: number;
  lowStockThreshold: number;
  sku?: string;
  barcode?: string;
  status: string;
  isFeatured: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  ar: {
    name: string;
    description: string;
    features: string[];
    specs: Record<string, string>;
  };
  en: {
    name: string;
    description: string;
    features: string[];
    specs: Record<string, string>;
  };
  nameAr?: string;
  nameEn?: string;
  descAr?: string;
  descEn?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductQueryParams {
  category?: string;
  search?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  availability?: string;
  isFeatured?: boolean;
  includeDeleted?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'rating' | 'name';
  page?: number;
  limit?: number;
  paginate?: boolean;
}

export interface PaginatedProductsResult {
  items: FormattedProduct[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CheckoutShippingInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface CheckoutPaymentInput {
  method: 'card' | 'cod';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export interface CheckoutItemInput {
  productId: string;
  nameAr: string;
  nameEn: string;
  price: number;
  quantity: number;
}

export interface CheckoutInput {
  shipping: CheckoutShippingInput;
  payment: CheckoutPaymentInput;
  items: CheckoutItemInput[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  promoCode?: string;
}
