// src/modules/infrastructure/cache/cache.services.ts

import { Service } from '../../../common/decorators/service.decorator';
import { Lifetime } from 'awilix';
import { ICacheService } from './cache.interface';
import { Logger } from '../../core/logger/logger.service';

@Service({ name: 'cacheService', lifetime: Lifetime.SINGLETON })
export class CacheService implements ICacheService {
  private cache: Map<string, { value: any; expiry: number | null }>;

  constructor(private logger: Logger) {
    this.cache = new Map();
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const expiry = ttl ? Date.now() + ttl * 1000 : null;
      this.cache.set(key, { value, expiry });
      this.logger.info(`Setting cache for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error setting cache for key: ${key}`, { error });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = this.cache.get(key);
      if (!cached) {
        this.logger.info(`Cache miss for key: ${key}`);
        return null;
      }

      if (cached.expiry && cached.expiry < Date.now()) {
        this.cache.delete(key);
        this.logger.info(`Cache expired for key: ${key}`);
        return null;
      }

      this.logger.info(`Cache hit for key: ${key}`);
      return cached.value as T;
    } catch (error) {
      this.logger.error(`Error getting cache for key: ${key}`, { error });
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      this.logger.info(`Deleting cache for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache for key: ${key}`, { error });
    }
  }
}
