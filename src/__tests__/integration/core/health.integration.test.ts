// src/__tests__/integration/health/health.integration.test.ts
import { Application } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { App } from '../../../app';
import { Server } from '../../../server';
import { TestContainer } from '../../helpers/test-container';

describe('HealthService Integration Tests', () => {
  let app: App;
  let server: Application;

  beforeAll(async () => {
    app = new App();
    await app.start();
    const container = await TestContainer.getInstance();
    server = container.resolve<Server>('server').app;
  });

  afterAll(async () => {
    await app.stop();
    await TestContainer.reset();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(server).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database', 'ok');
    });

    it('should return unhealthy status if database is down', async () => {
      const container = await TestContainer.getInstance();
      const databaseService = container.resolve('databaseService');
      await databaseService.disconnect();

      const response = await request(server).get('/health');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'unhealthy');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database', 'failed');

      await databaseService.connect();
    });
  });
});
