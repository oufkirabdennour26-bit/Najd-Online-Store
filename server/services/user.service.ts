import { UserRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/errors';
import { AuthService } from './auth.service';

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new ApiError('User not found', 404);
    return AuthService.sanitizeUser(user);
  }

  static async updateUserProfile(userId: string, data: { name?: string; phone?: string; address?: string; city?: string; zipCode?: string }) {
    const updatedUser = await UserRepository.update(userId, {
      ...(data.name && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.zipCode !== undefined && { zipCode: data.zipCode })
    });
    return AuthService.sanitizeUser(updatedUser);
  }

  static async getAllUsers() {
    const users = await UserRepository.findAll();
    return users.map(AuthService.sanitizeUser);
  }
}
