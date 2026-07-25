import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  static async getCategories(req: Request, res: Response) {
    const isTree = req.query.tree === 'true';
    const categories = await CategoryService.getCategories(isTree);
    return res.json(categories);
  }

  static async getCategoryById(req: Request, res: Response) {
    const category = await CategoryService.getCategoryById(req.params.id);
    return res.json(category);
  }

  static async createCategory(req: Request, res: Response) {
    const created = await CategoryService.createCategory(req.body);
    return res.status(201).json(created);
  }

  static async updateCategory(req: Request, res: Response) {
    const updated = await CategoryService.updateCategory(req.params.id, req.body);
    return res.json(updated);
  }

  static async deleteCategory(req: Request, res: Response) {
    const result = await CategoryService.deleteCategory(req.params.id);
    return res.json(result);
  }
}
