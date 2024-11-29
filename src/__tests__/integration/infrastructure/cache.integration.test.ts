// src/__tests__/integration/cache/cache.integration.test.ts
import { TestContainer } from '../../helpers/test-container';
import { CacheService } from '../../../modules/infrastructure/cache/cache.services';
import { AwilixContainer } from 'awilix';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('CacheService Integration Tests', () => {
  let container: AwilixContainer;
  let cacheService: CacheService;

  beforeAll(async () => {
    container = await TestContainer.getInstance();
    cacheService = container.resolve('cacheService');
  });

  afterAll(async () => {
    await TestContainer.reset();
  });

  describe('Cache operations', () => {
    it('should set and get cache values', async () => {
      await cacheService.set('test-key', { data: 'test-value' });
      const value = await cacheService.get<{ data: string }>('test-key');
      expect(value).toEqual({ data: 'test-value' });
    });

    it('should delete cache values', async () => {
      await cacheService.set('test-key', { data: 'test-value' });
      await cacheService.delete('test-key');
      const value = await cacheService.get<{ data: string }>('test-key');
      expect(value).toBeNull();
    });

    it('should handle cache expiration', async () => {
      await cacheService.set('test-key', { data: 'test-value' }, 1);
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const value = await cacheService.get<{ data: string }>('test-key');
      expect(value).toBeNull();
    });
  });
});
