import { Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../types';
import { ApiResponse } from '../utils/response';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated', 401);
    }
    const profile = await UserService.getUserProfile(req.user.id);
    return ApiResponse.success(res, profile, 'User profile retrieved');
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated', 401);
    }
    const updated = await UserService.updateUserProfile(req.user.id, req.body);
    return ApiResponse.success(res, updated, 'Profile updated successfully');
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    const users = await UserService.getAllUsers();
    return ApiResponse.success(res, users, 'Users retrieved');
  }
}
