import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Helper to format Prisma Product to Frontend Product type
export function formatProduct(prod: any) {
  let featuresAr: string[] = [];
  let featuresEn: string[] = [];
  let specsAr: Record<string, string> = {};
  let specsEn: Record<string, string> = {};

  try {
    featuresAr = typeof prod.featuresAr === 'string' ? JSON.parse(prod.featuresAr) : prod.featuresAr || [];
  } catch (e) {
    featuresAr = [];
  }

  try {
    featuresEn = typeof prod.featuresEn === 'string' ? JSON.parse(prod.featuresEn) : prod.featuresEn || [];
  } catch (e) {
    featuresEn = [];
  }

  try {
    specsAr = typeof prod.specsAr === 'string' ? JSON.parse(prod.specsAr) : prod.specsAr || {};
  } catch (e) {
    specsAr = {};
  }

  try {
    specsEn = typeof prod.specsEn === 'string' ? JSON.parse(prod.specsEn) : prod.specsEn || {};
  } catch (e) {
    specsEn = {};
  }

  return {
    id: prod.id,
    categoryId: prod.categoryId,
    category: prod.category ? prod.category.slug : prod.categoryId,
    categoryDetails: prod.category ? {
      id: prod.category.id,
      slug: prod.category.slug,
      nameAr: prod.category.nameAr,
      nameEn: prod.category.nameEn,
      parentId: prod.category.parentId
    } : undefined,
    price: prod.price,
    originalPrice: prod.originalPrice ?? undefined,
    rating: prod.rating,
    reviewsCount: prod.reviewsCount,
    image: prod.image,
    stock: prod.stock,
    lowStockThreshold: prod.lowStockThreshold ?? 5,
    sku: prod.sku ?? undefined,
    barcode: prod.barcode ?? undefined,
    status: prod.status ?? 'Active',
    isFeatured: prod.isFeatured ?? false,
    isDeleted: prod.isDeleted ?? false,
    deletedAt: prod.deletedAt ?? undefined,
    ar: {
      name: prod.nameAr,
      description: prod.descAr,
      features: featuresAr,
      specs: specsAr
    },
    en: {
      name: prod.nameEn,
      description: prod.descEn,
      features: featuresEn,
      specs: specsEn
    },
    nameAr: prod.nameAr,
    nameEn: prod.nameEn,
    descAr: prod.descAr,
    descEn: prod.descEn,
    createdAt: prod.createdAt,
    updatedAt: prod.updatedAt
  };
}
