import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/errors';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'] as string;
    }

    if (!token) {
      throw new ApiError('Authentication token required', 401, true, 'يتطلب تسجيل الدخول للوصول', 'Authentication token required');
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };

    next();
  } catch (err: any) {
    if (err instanceof ApiError) {
      next(err);
    } else if (err.name === 'TokenExpiredError') {
      next(new ApiError('Access token expired', 401, true, 'انتهت جلسة التسجيل، يرجى تحديث الرمز', 'Access token expired'));
    } else {
      next(new ApiError('Invalid authentication token', 401, true, 'رمز المصادقة غير صالحة', 'Invalid authentication token'));
    }
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: payload.name
      };
    }
  } catch (err) {
    // Ignore error for optional authentication
  }
  next();
}
