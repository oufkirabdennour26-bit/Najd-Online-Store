import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { ApiError } from '../utils/errors';
import { ProductQueryParams } from '../types';
import { prisma } from '../prisma/client';
import { deleteLocalImage } from '../utils/imageCleanup';

export class ProductService {
  static async getProducts(params: ProductQueryParams) {
    return ProductRepository.findWithQuery(params);
  }

  static async getNewestProducts(limit = 6) {
    return ProductRepository.findWithQuery({
      sortBy: 'newest',
      limit,
      page: 1
    });
  }

  static async getFeaturedProducts(limit = 6) {
    return ProductRepository.findWithQuery({
      isFeatured: true,
      limit,
      page: 1
    });
  }

  static async getProductById(id: string, includeDeleted = false) {
    const product = await ProductRepository.findById(id, includeDeleted);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    return product;
  }

  static async createProduct(data: {
    category: string;
    price: number;
    originalPrice?: number | null;
    stock?: number;
    lowStockThreshold?: number;
    sku?: string;
    barcode?: string;
    status?: string;
    isFeatured?: boolean;
    image?: string;
    nameAr: string;
    descAr?: string;
    featuresAr?: any;
    specsAr?: any;
    nameEn: string;
    descEn?: string;
    featuresEn?: any;
    specsEn?: any;
  }) {
    let categoryObj = await CategoryRepository.findBySlug(data.category);
    if (!categoryObj) {
      categoryObj = await CategoryRepository.findById(data.category);
    }

    if (!categoryObj) {
      const categories = await CategoryRepository.findAll();
      if (categories.length > 0) {
        categoryObj = categories[0];
      } else {
        categoryObj = await CategoryRepository.create({
          slug: data.category.toLowerCase().trim() || 'general',
          nameAr: data.category || 'عام',
          nameEn: data.category || 'General'
        });
      }
    }

    const stock = Number(data.stock ?? 10);
    let status = data.status || 'Active';
    if (stock === 0 && !data.status) {
      status = 'OutOfStock';
    }

    const newProduct = await ProductRepository.create({
      categoryId: categoryObj.id,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      stock,
      lowStockThreshold: Number(data.lowStockThreshold ?? 5),
      sku: data.sku ? data.sku.trim() : null,
      barcode: data.barcode ? data.barcode.trim() : null,
      status,
      isFeatured: Boolean(data.isFeatured),
      image: data.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      nameAr: data.nameAr,
      descAr: data.descAr || '',
      featuresAr: typeof data.featuresAr === 'string' ? data.featuresAr : JSON.stringify(data.featuresAr || []),
      specsAr: typeof data.specsAr === 'string' ? data.specsAr : JSON.stringify(data.specsAr || {}),
      nameEn: data.nameEn,
      descEn: data.descEn || '',
      featuresEn: typeof data.featuresEn === 'string' ? data.featuresEn : JSON.stringify(data.featuresEn || []),
      specsEn: typeof data.specsEn === 'string' ? data.specsEn : JSON.stringify(data.specsEn || {})
    });

    // Log initial stock movement
    await prisma.stockLog.create({
      data: {
        productId: newProduct.id,
        quantityBefore: 0,
        quantityAfter: stock,
        delta: stock,
        type: 'set',
        reason: 'Initial stock setup',
        operatorName: (data as any).operatorName || 'Admin'
      }
    });

    return newProduct;
  }

  static async updateProduct(id: string, data: any) {
    const existing = await ProductRepository.findById(id, true);
    if (!existing) {
      throw new ApiError('Product not found', 404);
    }

    let categoryId: string | undefined = undefined;
    if (data.category) {
      let catObj = await CategoryRepository.findBySlug(data.category);
      if (!catObj) catObj = await CategoryRepository.findById(data.category);
      if (catObj) categoryId = catObj.id;
    }

    let stock: number | undefined = undefined;
    if (data.stock !== undefined) {
      stock = Number(data.stock);
    }

    let status = data.status;
    if (stock !== undefined && !status) {
      if (stock === 0) {
        status = 'OutOfStock';
      } else if (existing.status === 'OutOfStock') {
        status = 'Active';
      }
    }

    // Clean up old image if updated to a new one
    if (data.image && existing.image && data.image !== existing.image) {
      deleteLocalImage(existing.image);
    }

    const updated = await ProductRepository.update(id, {
      ...(categoryId && { categoryId }),
      ...(data.price !== undefined && { price: Number(data.price) }),
      ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice ? Number(data.originalPrice) : null }),
      ...(stock !== undefined && { stock }),
      ...(data.lowStockThreshold !== undefined && { lowStockThreshold: Number(data.lowStockThreshold) }),
      ...(data.sku !== undefined && { sku: data.sku ? String(data.sku).trim() : null }),
      ...(data.barcode !== undefined && { barcode: data.barcode ? String(data.barcode).trim() : null }),
      ...(status !== undefined && { status }),
      ...(data.isFeatured !== undefined && { isFeatured: Boolean(data.isFeatured) }),
      ...(data.image && { image: data.image }),
      ...(data.nameAr && { nameAr: data.nameAr }),
      ...(data.descAr !== undefined && { descAr: data.descAr }),
      ...(data.featuresAr !== undefined && { featuresAr: typeof data.featuresAr === 'string' ? data.featuresAr : JSON.stringify(data.featuresAr) }),
      ...(data.specsAr !== undefined && { specsAr: typeof data.specsAr === 'string' ? data.specsAr : JSON.stringify(data.specsAr) }),
      ...(data.nameEn && { nameEn: data.nameEn }),
      ...(data.descEn !== undefined && { descEn: data.descEn }),
      ...(data.featuresEn !== undefined && { featuresEn: typeof data.featuresEn === 'string' ? data.featuresEn : JSON.stringify(data.featuresEn) }),
      ...(data.specsEn !== undefined && { specsEn: typeof data.specsEn === 'string' ? data.specsEn : JSON.stringify(data.specsEn) })
    });

    // Log stock adjustment if changed
    if (stock !== undefined && stock !== existing.stock) {
      await prisma.stockLog.create({
        data: {
          productId: id,
          quantityBefore: existing.stock,
          quantityAfter: stock,
          delta: stock - existing.stock,
          type: (stock - existing.stock) > 0 ? 'increase' : 'decrease',
          reason: data.stockReason || 'Manual stock update',
          operatorName: data.operatorName || 'Admin'
        }
      });
    }

    return updated;
  }

  static async softDeleteProduct(id: string) {
    const existing = await ProductRepository.findById(id, true);
    if (!existing) {
      throw new ApiError('Product not found', 404);
    }
    return ProductRepository.softDelete(id);
  }

  static async restoreProduct(id: string) {
    const existing = await ProductRepository.findById(id, true);
    if (!existing) {
      throw new ApiError('Product not found', 404);
    }
    return ProductRepository.restore(id);
  }

  static async deleteProduct(id: string) {
    const existing = await ProductRepository.findById(id, true);
    if (!existing) {
      throw new ApiError('Product not found', 404);
    }
    await ProductRepository.delete(id);
    if (existing.image) {
      deleteLocalImage(existing.image);
    }
    return { success: true, message: 'Product permanently deleted successfully' };
  }
}
