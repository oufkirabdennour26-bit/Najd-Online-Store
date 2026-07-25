import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import apiRouter from '../../server/routes/index';
import { errorHandler } from '../../server/middlewares/errorHandler';

describe('Promo API Integration Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', apiRouter);
    app.use(errorHandler);
  });

  it('POST /api/promo/validate - should return 200 with discount for valid promo code', async () => {
    const response = await request(app)
      .post('/api/promo/validate')
      .send({ code: 'SALLA10', subtotal: 200 })
      .expect(200);

    expect(response.body.valid).toBe(true);
    expect(response.body.discount).toBe(20);
    expect(response.body.code).toBe('SALLA10');
  });

  it('POST /api/promo/validate - should return 400 for invalid promo code', async () => {
    const response = await request(app)
      .post('/api/promo/validate')
      .send({ code: 'BADCODE', subtotal: 200 })
      .expect(400);

    expect(response.body.valid).toBe(false);
    expect(response.body.discount).toBe(0);
  });
});
