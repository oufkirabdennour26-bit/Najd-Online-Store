import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const status = res.statusCode;

    const logPayload = {
      method: req.method,
      url: req.originalUrl || req.url,
      status,
      responseTimeMs: parseFloat(timeInMs),
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    if (status >= 500) {
      logger.error(logPayload, `HTTP ${req.method} ${req.url} failed with ${status}`);
    } else if (status >= 400) {
      logger.warn(logPayload, `HTTP ${req.method} ${req.url} returned ${status}`);
    } else {
      logger.info(logPayload, `HTTP ${req.method} ${req.url} completed ${status}`);
    }
  });

  next();
}

export default requestLogger;
