import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path, method: req.method }, '[GLOBAL ERROR HANDLER]');
    } else {
      logger.warn({ path: req.path, method: req.method, statusCode: err.statusCode }, `[API CLIENT INFO] ${err.message}`);
    }
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      messageAr: err.messageAr,
      messageEn: err.messageEn || err.message
    });
  }

  logger.error({ err, path: req.path, method: req.method }, '[GLOBAL ERROR HANDLER]');

  // Fallback for unexpected errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: message
  });
}

