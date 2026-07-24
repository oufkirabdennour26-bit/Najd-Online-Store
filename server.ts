import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { createServer as createViteServer } from 'vite';
import { prisma } from './server/prisma/client';
import { seedDatabase } from './prisma/seed';
import apiRouter from './server/routes/index';
import { swaggerSpec } from './server/utils/swaggerSpec';
import { errorHandler } from './server/middlewares/errorHandler';
import { apiRateLimiter } from './server/middlewares/rateLimiter';
import { logger } from './server/utils/logger';
import { requestLogger } from './server/middlewares/requestLogger';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for reverse proxy environments (Cloud Run / Nginx)
  app.set('trust proxy', 1);

  // Security headers using Helmet (with relaxed CSP for Vite & external images)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // Cookie parsing middleware
  app.use(cookieParser());

  // Body parsing middleware
  app.use(express.json());

  // Serve local upload files (e.g. /uploads/products/...)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Ensure DB is seeded on startup
  try {
    logger.info('Verifying database initialization and seed data...');
    await seedDatabase();
  } catch (err) {
    logger.error({ err }, 'Database connection/seed check failed:');
  }

  // General rate limiter for /api
  app.use('/api', apiRateLimiter);

  // HTTP Request structured logging
  app.use('/api', requestLogger);

  // Mount API Subsystem Routes under /api
  app.use('/api', apiRouter);

  // Serve interactive API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Reusable Error Handler Middleware
  app.use(errorHandler);

  // Vite development vs. Production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on http://0.0.0.0:${PORT}`);
  });
}


startServer();
