// src/modules/infrastructure/cache/cache.services.ts

import { Service } from '../../../common/decorators/service.decorator';
import { Lifetime } from 'awilix';
import { ICacheService } from './cache.interface';
import { Logger } from '../../core/logger/logger.service';

@Service({ name: 'cacheService', lifetime: Lifetime.SINGLETON })
export class CacheService implements ICacheService {
  // Implement cache functionalities, e.g., using Redis
  constructor(private logger: Logger) {
    // Initialize cache connection here
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Implement setting a value in the cache
    this.logger.info(`Setting cache for key: ${key}`);
    // Example: await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    // Implement getting a value from the cache
    this.logger.info(`Getting cache for key: ${key}`);
    // Example:
    // const data = await redisClient.get(key);
    // return data ? JSON.parse(data) as T : null;
    return null;
  }

  async delete(key: string): Promise<void> {
    // Implement deleting a value from the cache
    this.logger.info(`Deleting cache for key: ${key}`);
    // Example: await redisClient.del(key);
  }
}
