// src/modules/infrastructure/cache/cache.interface.ts

// Define cache-related interfaces here
// Example:
export interface ICacheService {
  set(key: string, value: any, ttl?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
}
