import { CategoryRepository } from '../repositories/category.repository';
import { ApiError } from '../utils/errors';

export class CategoryService {
  static async getCategories(tree = false) {
    const categories = await CategoryRepository.findAll();
    if (tree) {
      return this.buildCategoryTree(categories);
    }
    return categories;
  }

  static async getCategoryById(id: string) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new ApiError('Category not found', 404);
    }
    return category;
  }

  static async createCategory(data: { slug: string; nameAr: string; nameEn: string; parentId?: string | null }) {
    const existing = await CategoryRepository.findBySlug(data.slug);
    if (existing) {
      throw new ApiError(`Category with slug '${data.slug}' already exists`, 400);
    }

    if (data.parentId) {
      const parent = await CategoryRepository.findById(data.parentId);
      if (!parent) {
        throw new ApiError('Specified parent category does not exist', 400);
      }
    }

    return CategoryRepository.create({
      slug: data.slug.toLowerCase().trim(),
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      parentId: data.parentId || null
    });
  }

  static async updateCategory(id: string, data: { slug?: string; nameAr?: string; nameEn?: string; parentId?: string | null }) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new ApiError('Category not found', 404);
    }

    if (data.slug && data.slug !== category.slug) {
      const existing = await CategoryRepository.findBySlug(data.slug);
      if (existing) {
        throw new ApiError(`Category with slug '${data.slug}' already exists`, 400);
      }
    }

    if (data.parentId) {
      if (data.parentId === id) {
        throw new ApiError('A category cannot be its own parent', 400);
      }
      const parent = await CategoryRepository.findById(data.parentId);
      if (!parent) {
        throw new ApiError('Specified parent category does not exist', 400);
      }
    }

    return CategoryRepository.update(id, {
      ...(data.slug && { slug: data.slug.toLowerCase().trim() }),
      ...(data.nameAr && { nameAr: data.nameAr }),
      ...(data.nameEn && { nameEn: data.nameEn }),
      ...(data.parentId !== undefined && { parentId: data.parentId })
    });
  }

  static async deleteCategory(id: string) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new ApiError('Category not found', 404);
    }

    if (category.children && category.children.length > 0) {
      throw new ApiError('Cannot delete category that has child categories. Reassign or delete children first.', 400);
    }

    await CategoryRepository.delete(id);
    return { success: true, message: 'Category deleted successfully' };
  }

  private static buildCategoryTree(categories: any[]) {
    const categoryMap = new Map<string, any>();
    const roots: any[] = [];

    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, childrenTree: [] });
    });

    categories.forEach((cat) => {
      const node = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId).childrenTree.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
