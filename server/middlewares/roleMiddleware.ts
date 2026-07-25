import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/errors';

export function authorize(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `Forbidden: Role '${req.user.role}' does not have permission to perform this action.`,
          403,
          true,
          'غير مصرح لك للوصول إلى هذه الصفحة',
          'Forbidden access'
        )
      );
    }

    next();
  };
}
