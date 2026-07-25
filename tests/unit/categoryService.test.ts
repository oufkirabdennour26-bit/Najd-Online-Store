import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryService } from '../../server/services/category.service';
import { CategoryRepository } from '../../server/repositories/category.repository';
import { ApiError } from '../../server/utils/errors';

// Mock CategoryRepository
vi.mock('../../server/repositories/category.repository', () => {
  return {
    CategoryRepository: {
      findAll: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('CategoryService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories without tree formatting if tree parameter is false', async () => {
      const mockCategories = [
        { id: '1', nameEn: 'Electronics', nameAr: 'إلكترونيات', slug: 'electronics', parentId: null },
        { id: '2', nameEn: 'Laptops', nameAr: 'لابتوبات', slug: 'laptops', parentId: '1' },
      ];

      vi.mocked(CategoryRepository.findAll).mockResolvedValue(mockCategories);

      const result = await CategoryService.getCategories(false);
      expect(result).toEqual(mockCategories);
      expect(CategoryRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return formatted category tree when tree parameter is true', async () => {
      const mockCategories = [
        { id: '1', nameEn: 'Electronics', nameAr: 'إلكترونيات', slug: 'electronics', parentId: null },
        { id: '2', nameEn: 'Laptops', nameAr: 'لابتوبات', slug: 'laptops', parentId: '1' },
      ];

      vi.mocked(CategoryRepository.findAll).mockResolvedValue(mockCategories);

      const result = await CategoryService.getCategories(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].childrenTree).toHaveLength(1);
      expect(result[0].childrenTree[0].id).toBe('2');
    });
  });

  describe('getCategoryById', () => {
    it('should return a category if it exists', async () => {
      const mockCategory = { id: '123', nameEn: 'Mobiles', slug: 'mobiles' };
      vi.mocked(CategoryRepository.findById).mockResolvedValue(mockCategory as any);

      const result = await CategoryService.getCategoryById('123');
      expect(result).toEqual(mockCategory);
      expect(CategoryRepository.findById).toHaveBeenCalledWith('123');
    });

    it('should throw an ApiError if the category does not exist', async () => {
      vi.mocked(CategoryRepository.findById).mockResolvedValue(null);

      await expect(CategoryService.getCategoryById('nonexistent')).rejects.toThrow(ApiError);
      await expect(CategoryService.getCategoryById('nonexistent')).rejects.toThrow('Category not found');
    });
  });

  describe('createCategory', () => {
    it('should create a new category if the slug is unique', async () => {
      const newCategoryData = {
        nameEn: 'Smartphones',
        nameAr: 'هواتف ذكية',
        slug: 'smartphones',
      };

      vi.mocked(CategoryRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(CategoryRepository.create).mockResolvedValue({
        id: 'new_id',
        ...newCategoryData,
        parentId: null,
      } as any);

      const result = await CategoryService.createCategory(newCategoryData);
      expect(result.id).toBe('new_id');
      expect(CategoryRepository.findBySlug).toHaveBeenCalledWith('smartphones');
      expect(CategoryRepository.create).toHaveBeenCalledWith({
        slug: 'smartphones',
        nameEn: 'Smartphones',
        nameAr: 'هواتف ذكية',
        parentId: null,
      });
    });

    it('should throw an ApiError if the slug already exists', async () => {
      vi.mocked(CategoryRepository.findBySlug).mockResolvedValue({ id: 'existing' } as any);

      await expect(
        CategoryService.createCategory({
          nameEn: 'Smartphones',
          nameAr: 'هواتف ذكية',
          slug: 'smartphones',
        })
      ).rejects.toThrow(ApiError);
    });
  });
});
