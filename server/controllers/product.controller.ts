import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { ApiError } from '../utils/errors';
import { ApiResponse } from '../utils/response';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    const category = (req.query.category || req.query.categorySlug) as string | undefined;
    const search = (req.query.search || req.query.q) as string | undefined;
    const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
    const status = req.query.status as string | undefined;
    const availability = req.query.availability as string | undefined;
    const isFeatured = req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined;
    const includeDeleted = req.query.includeDeleted === 'true';
    const sortBy = req.query.sortBy as any;
    const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    const paginate = req.query.paginate === 'true' || page !== undefined;

    const result = await ProductService.getProducts({
      category,
      search,
      minPrice,
      maxPrice,
      status,
      availability,
      isFeatured,
      includeDeleted,
      sortBy,
      page,
      limit,
      paginate
    });

    return res.json(result);
  }

  static async getNewestProducts(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    const result = await ProductService.getNewestProducts(limit);
    return res.json(result);
  }

  static async getFeaturedProducts(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    const result = await ProductService.getFeaturedProducts(limit);
    return res.json(result);
  }

  static async getProductById(req: Request, res: Response) {
    const includeDeleted = req.query.includeDeleted === 'true';
    const product = await ProductService.getProductById(req.params.id, includeDeleted);
    return res.json(product);
  }

  static async createProduct(req: Request, res: Response) {
    const newProduct = await ProductService.createProduct(req.body);
    return res.status(201).json(newProduct);
  }

  static async updateProduct(req: Request, res: Response) {
    const updated = await ProductService.updateProduct(req.params.id, req.body);
    return res.json(updated);
  }

  static async softDeleteProduct(req: Request, res: Response) {
    const result = await ProductService.softDeleteProduct(req.params.id);
    return ApiResponse.success(res, result, 'Product soft deleted successfully');
  }

  static async restoreProduct(req: Request, res: Response) {
    const result = await ProductService.restoreProduct(req.params.id);
    return ApiResponse.success(res, result, 'Product restored successfully');
  }

  static async deleteProduct(req: Request, res: Response) {
    const result = await ProductService.deleteProduct(req.params.id);
    return res.json(result);
  }

  static async uploadImage(req: Request, res: Response) {
    if (!req.file) {
      throw new ApiError('No image file provided', 400);
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `product-${uniqueSuffix}.webp`;
    const outputPath = path.join(process.cwd(), 'uploads', 'products', filename);

    // Compress using sharp to WebP format with 80% quality
    await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .toFile(outputPath);

    const imageUrl = `/uploads/products/${filename}`;
    const stats = fs.statSync(outputPath);

    return ApiResponse.success(
      res,
      {
        imageUrl,
        filename,
        size: stats.size,
        mimetype: 'image/webp'
      },
      'Product image uploaded and compressed successfully',
      201
    );
  }
}
