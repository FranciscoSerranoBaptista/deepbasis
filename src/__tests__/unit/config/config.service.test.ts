import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@app/config/config.service';
import { Logger } from '@app/modules/core/logger/logger.service';
import { parse } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigSchema } from '@app/config/config.schema';
import { PathLike } from 'fs';
import testConfig from '@app/__tests__/config/test-config';

// Mock external dependencies
vi.mock('fs');
vi.mock('path');
vi.mock('dotenv');

// Mock config files - these must be at the top level
vi.mock('./environments/default', () => ({
  default: testConfig
}));

vi.mock('./environments/test', () => ({
  default: testConfig
}));

describe('ConfigService', () => {
  let configService: ConfigService;
  let mockLogger: Logger;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn().mockReturnThis()
    } as unknown as Logger;

    // Mock path.resolve
    vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'));

    // Mock fs.existsSync
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock dotenv parse with test environment variables
    vi.mocked(parse).mockReturnValue({
      NODE_ENV: 'test',
      APP_PORT: '3002',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'deepdialogue_test_user',
      DB_PASSWORD: 'DLtswBB24mvwDCtYqlPipA==',
      DB_NAME: 'deepdialogue_test',
      AUTH_JWT_SECRET: 'test-secret-key',
      LOG_LEVEL: 'error'
    });

    // Initialize ConfigService
    configService = new ConfigService(mockLogger);
  });

  describe('initialize', () => {
    it('should load and validate configuration successfully', async () => {
      // Arrange
      const expectedConfig = {
        ...testConfig,
        app: {
          ...testConfig.app,
          port: 3002 // from env variables
        }
      };

      vi.spyOn(ConfigSchema, 'safeParse').mockReturnValue({
        success: true,
        data: expectedConfig
      });

      // Act
      await configService.initialize();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Configuration loaded successfully'
      );
      expect(configService.getAll()).toEqual(expectedConfig);
    });

    it('should throw error when configuration validation fails', async () => {
      // Arrange
      vi.spyOn(ConfigSchema, 'safeParse').mockReturnValue({
        success: false,
        error: {
          errors: [
            { path: ['auth', 'jwtSecret'], message: 'JWT secret is required' }
          ]
        }
      } as any);

      // Act & Assert
      await expect(configService.initialize()).rejects.toThrow(
        'Invalid configuration'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Configuration validation failed',
        {
          errors: expect.any(Object)
        }
      );
    });

    it('should handle missing environment config file', async () => {
      // Arrange
      vi.mocked(fs.existsSync).mockImplementation(
        (path: PathLike) =>
          typeof path === 'string' && path.includes('default.ts')
      );

      vi.spyOn(ConfigSchema, 'safeParse').mockReturnValue({
        success: true,
        data: testConfig
      });

      // Act
      await configService.initialize();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Configuration loaded successfully'
      );
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      vi.spyOn(ConfigSchema, 'safeParse').mockReturnValue({
        success: true,
        data: testConfig
      });
      await configService.initialize();
    });

    it('should return value for simple key', () => {
      const result = configService.get<number>('app.port');
      expect(result).toBe(testConfig.app.port);
    });

    it('should return value for nested key', () => {
      const result = configService.get<string>('database.host');
      expect(result).toBe(testConfig.database.host);
    });

    it('should throw error for non-existent key', () => {
      // Test various non-existent paths
      expect(() => configService.get('non')).toThrow(
        "Configuration key 'non' not found"
      );
      expect(() => configService.get('non.existent')).toThrow(
        "Configuration key 'non.existent' not found"
      );
      expect(() => configService.get('non.existent.key')).toThrow(
        "Configuration key 'non.existent.key' not found"
      );
      expect(() => configService.get('app.nonexistent')).toThrow(
        "Configuration key 'app.nonexistent' not found"
      );
    });

    it('should throw error for empty or invalid keys', () => {
      expect(() => configService.get('')).toThrow(
        "Configuration key '' not found"
      );
      expect(() => configService.get('.')).toThrow(
        "Configuration key '.' not found"
      );
      expect(() => configService.get('..')).toThrow(
        "Configuration key '..' not found"
      );
    });
  });

  describe('getAll', () => {
    it('should return complete configuration object', async () => {
      // Arrange
      vi.spyOn(ConfigSchema, 'safeParse').mockReturnValue({
        success: true,
        data: testConfig
      });
      await configService.initialize();

      // Act
      const result = configService.getAll();

      // Assert
      expect(result).toEqual(testConfig);
    });
  });
});
