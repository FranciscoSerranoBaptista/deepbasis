// src/common/interfaces/config.interface.ts

export interface IConfigService {
  /**
   * Retrieves a configuration value by key.
   * @param key The configuration key (e.g., 'database.host')
   */
  get<T>(key: string): T;

  /**
   * Retrieves all configuration values.
   */
  getAll<T>(): T;

  /**
   * Subscribes to configuration changes.
   * @param callback The callback to invoke when configuration changes.
   */
  onChange(callback: (newConfig: any) => void): void;
}
