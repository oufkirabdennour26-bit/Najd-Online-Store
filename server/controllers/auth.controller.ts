import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export class AuthController {
  static async register(req: Request, res: Response) {
    const result = await AuthService.register(req.body);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });

    // إزالة التوكنات من الـ Body لمنع تخزينها في localStorage وحماية ضد XSS
    return ApiResponse.success(
      res,
      {
        user: result.user
      },
      'Registration successful',
      201
    );
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });

    return ApiResponse.success(
      res,
      { user: result.user },
      'Login successful'
    );
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    if (req.user) {
      await AuthService.logout(req.user.id);
    }

    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.clearCookie('accessToken', { ...COOKIE_OPTIONS, maxAge: undefined });

    return ApiResponse.success(res, null, 'Logged out successfully');
  }

  static async refreshToken(req: Request, res: Response) {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    const result = await AuthService.refreshToken(token);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });

    return ApiResponse.success(
      res,
      { user: result.user },
      'Token refreshed successfully'
    );
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    return ApiResponse.success(res, result, 'Password reset request processed');
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    const result = await AuthService.resetPassword(token, newPassword);
    return ApiResponse.success(res, result, 'Password reset successful');
  }

  static async verifyEmail(req: Request, res: Response) {
    const token = req.body.token || (req.query.token as string);
    const result = await AuthService.verifyEmail(token);
    return ApiResponse.success(res, result, 'Email verified successfully');
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return ApiResponse.error(res, 'Not authenticated', 401);
    }
    const profile = await AuthService.getProfile(req.user.id);
    return ApiResponse.success(res, profile, 'User profile retrieved');
  }
}