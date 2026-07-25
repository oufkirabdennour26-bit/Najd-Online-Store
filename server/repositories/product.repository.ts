import { prisma, formatProduct } from '../prisma/client';
import { ProductQueryParams, PaginatedProductsResult } from '../types';

export class ProductRepository {
  static async findWithQuery(params: ProductQueryParams) {
    const {
      category,
      search,
      q,
      minPrice,
      maxPrice,
      status,
      availability,
      isFeatured,
      includeDeleted = false,
      sortBy = 'newest',
      page,
      limit
    } = params;

    const whereClause: any = {};

    // Soft delete filter: by default hide soft deleted products unless includeDeleted is explicitly true
    if (!includeDeleted) {
      whereClause.isDeleted = false;
    }

    // Category filter: match slug or category id
    if (category && category !== 'all') {
      whereClause.OR = [
        { category: { slug: category } },
        { categoryId: category },
        { category: { parent: { slug: category } } }
      ];
    }

    // Search query (name, description, SKU, barcode)
    const queryTerm = (search || q || '').trim();
    if (queryTerm) {
      const term = queryTerm.toLowerCase();
      const searchConditions = [
        { nameAr: { contains: term } },
        { nameEn: { contains: term } },
        { descAr: { contains: term } },
        { descEn: { contains: term } },
        { sku: { contains: term } },
        { barcode: { contains: term } }
      ];

      if (whereClause.OR) {
        whereClause.AND = [
          { OR: whereClause.OR },
          { OR: searchConditions }
        ];
        delete whereClause.OR;
      } else {
        whereClause.OR = searchConditions;
      }
    }

    // Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined && !isNaN(minPrice)) {
        whereClause.price.gte = minPrice;
      }
      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        whereClause.price.lte = maxPrice;
      }
    }

    // Status / Availability filters
    if (status) {
      whereClause.status = status;
    } else if (availability) {
      if (availability === 'in_stock') {
        whereClause.stock = { gt: 0 };
        whereClause.status = { not: 'OutOfStock' };
      } else if (availability === 'out_of_stock') {
        whereClause.OR = [
          { stock: { lte: 0 } },
          { status: 'OutOfStock' }
        ];
      } else if (availability === 'low_stock') {
        whereClause.stock = { lte: 5, gt: 0 };
      }
    }

    // Featured products
    if (isFeatured !== undefined) {
      whereClause.isFeatured = Boolean(isFeatured);
    }

    // Sorting options
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'name':
        orderBy = { nameEn: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const totalItems = await prisma.product.count({ where: whereClause });

    // Pagination
    const shouldPaginate = page !== undefined || limit !== undefined || params.paginate;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const queryOptions: any = {
      where: whereClause,
      include: { category: { include: { parent: true } } },
      orderBy
    };

    if (shouldPaginate) {
      queryOptions.skip = skip;
      queryOptions.take = limitNum;
    }

    const rawProducts = await prisma.product.findMany(queryOptions);
    const items = rawProducts.map(formatProduct);

    if (shouldPaginate) {
      return {
        items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum) || 1
        }
      } as PaginatedProductsResult;
    }

    return items;
  }

  static async findById(id: string, includeDeleted = false) {
    const where: any = { id };
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    const product = await prisma.product.findFirst({
      where,
      include: { category: { include: { parent: true } } }
    });
    return product ? formatProduct(product) : null;
  }

  static async create(data: any) {
    const newProduct = await prisma.product.create({
      data,
      include: { category: { include: { parent: true } } }
    });
    return formatProduct(newProduct);
  }

  static async update(id: string, data: any) {
    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: { include: { parent: true } } }
    });
    return formatProduct(updated);
  }

  static async softDelete(id: string) {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: 'Hidden'
      },
      include: { category: { include: { parent: true } } }
    });
    return formatProduct(updated);
  }

  static async restore(id: string) {
    const restored = await prisma.product.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        status: 'Active'
      },
      include: { category: { include: { parent: true } } }
    });
    return formatProduct(restored);
  }

  static async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  static async count(where?: any) {
    return prisma.product.count({ where });
  }
}
