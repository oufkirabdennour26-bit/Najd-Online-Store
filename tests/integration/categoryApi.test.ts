import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import apiRouter from '../../server/routes/index';
import { errorHandler } from '../../server/middlewares/errorHandler';
import { CategoryService } from '../../server/services/category.service';

// Mock CategoryService
vi.mock('../../server/services/category.service', () => {
  return {
    CategoryService: {
      getCategories: vi.fn(),
      getCategoryById: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    },
  };
});

describe('Category API Integration Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a fresh lightweight Express instance for integration testing
    app = express();
    app.use(express.json());
    app.use('/api', apiRouter);
    app.use(errorHandler);
  });

  describe('GET /api/categories', () => {
    it('should return 200 and a list of categories', async () => {
      const mockCategories = [
        { id: '1', slug: 'electronics', nameAr: 'إلكترونيات', nameEn: 'Electronics' },
        { id: '2', slug: 'fashion', nameAr: 'أزياء', nameEn: 'Fashion' },
      ];

      vi.mocked(CategoryService.getCategories).mockResolvedValue(mockCategories);

      const response = await request(app)
        .get('/api/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockCategories);
      expect(CategoryService.getCategories).toHaveBeenCalledWith(false);
    });

    it('should pass tree=true to CategoryService if query param is set', async () => {
      vi.mocked(CategoryService.getCategories).mockResolvedValue([]);

      await request(app)
        .get('/api/categories?tree=true')
        .expect(200);

      expect(CategoryService.getCategories).toHaveBeenCalledWith(true);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return 200 and a category if found', async () => {
      const mockCategory = { id: '1', slug: 'electronics', nameAr: 'إلكترونيات', nameEn: 'Electronics' };
      vi.mocked(CategoryService.getCategoryById).mockResolvedValue(mockCategory);

      const response = await request(app)
        .get('/api/categories/1')
        .expect(200);

      expect(response.body).toEqual(mockCategory);
      expect(CategoryService.getCategoryById).toHaveBeenCalledWith('1');
    });
  });
});
