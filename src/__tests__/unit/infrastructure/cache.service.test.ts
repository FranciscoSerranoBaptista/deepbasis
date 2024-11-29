// src/modules/infrastructure/cache/cache.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheService } from '@app/modules/infrastructure/cache/cache.services';
import { Logger } from '@app/modules/core/logger/logger.service';

describe('CacheService', () => {
  let cacheService: CacheService;
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({ context: 'test' });
    vi.spyOn(logger, 'info');
    vi.spyOn(logger, 'error');

    cacheService = new CacheService(logger);
  });

  describe('set operations', () => {
    it('should log setting cache values', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };

      await cacheService.set(key, value);

      expect(logger.info).toHaveBeenCalledWith(`Setting cache for key: ${key}`);
    });

    it('should set value with TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 1; // 1 second

      await cacheService.set(key, value, ttl);

      expect(logger.info).toHaveBeenCalledWith(`Setting cache for key: ${key}`);
    });

    it('should handle complex objects', async () => {
      const key = 'test-key';
      const value = {
        id: 1,
        nested: {
          data: 'test'
        },
        array: [1, 2, 3]
      };

      await cacheService.set(key, value);

      expect(logger.info).toHaveBeenCalledWith(`Setting cache for key: ${key}`);
    });
  });

  describe('get operations', () => {
    it('should log getting cache values', async () => {
      const key = 'test-key';

      await cacheService.get(key);

      expect(logger.info).toHaveBeenCalledWith(`Cache miss for key: ${key}`);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle type casting correctly', async () => {
      interface TestType {
        id: number;
        name: string;
      }

      const result = await cacheService.get<TestType>('test-key');
      expect(result).toBeNull();
    });

    it('should return cached value if it exists', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };

      await cacheService.set(key, value);
      const result = await cacheService.get<typeof value>(key);

      expect(result).toEqual(value);
      expect(logger.info).toHaveBeenCalledWith(`Cache hit for key: ${key}`);
    });

    it('should return null if cached value has expired', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };

      await cacheService.set(key, value, 1); // 1 second TTL
      await new Promise((resolve) => setTimeout(resolve, 1100)); // Wait for 1.1 seconds
      const result = await cacheService.get<typeof value>(key);

      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(`Cache expired for key: ${key}`);
    });
  });

  describe('delete operations', () => {
    it('should log deleting cache values', async () => {
      const key = 'test-key';

      await cacheService.delete(key);

      expect(logger.info).toHaveBeenCalledWith(
        `Deleting cache for key: ${key}`
      );
    });

    it('should handle deleting non-existent keys', async () => {
      await expect(
        cacheService.delete('non-existent-key')
      ).resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle set operation errors gracefully', async () => {
      // Simulate an error in the internal set operation
      const error = new Error('Set operation error');
      const setSpy = vi
        .spyOn(cacheService['cache'], 'set')
        .mockImplementation(() => {
          throw error;
        });

      await expect(cacheService.set('key', 'value')).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        `Error setting cache for key: key`,
        { error }
      );
      setSpy.mockRestore();
    });

    it('should handle get operation errors gracefully', async () => {
      // Simulate an error in the internal get operation
      const error = new Error('Get operation error');
      const getSpy = vi
        .spyOn(cacheService['cache'], 'get')
        .mockImplementation(() => {
          throw error;
        });

      const result = await cacheService.get('key');
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        `Error getting cache for key: key`,
        { error }
      );
      getSpy.mockRestore();
    });

    it('should handle delete operation errors gracefully', async () => {
      // Simulate an error in the internal delete operation
      const error = new Error('Delete operation error');
      const deleteSpy = vi
        .spyOn(cacheService['cache'], 'delete')
        .mockImplementation(() => {
          throw error;
        });

      await expect(cacheService.delete('key')).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        `Error deleting cache for key: key`,
        { error }
      );
      deleteSpy.mockRestore();
    });
  });
});
