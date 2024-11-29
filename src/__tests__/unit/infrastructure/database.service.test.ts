// src/__tests__/unit/infrastructure/database.service.test.ts

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../../config/config.service';
import { ILogger } from '../../../modules/core/logger/logger.interface';
import { DatabaseSchemaService } from '../../../modules/infrastructure/database/database.schema.service';
import { DatabaseService } from '../../../modules/infrastructure/database/database.service';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Mock modules before any imports
vi.mock('drizzle-orm/node-postgres', () => {
  const mockDb = {
    query: {},
    $client: {},
    _: {
      schema: {},
      fullSchema: {},
      tableNamesMap: {}
    },
    dialect: {
      casing: {
        cache: {},
        convert: () => {}
      }
    }
  };
  return {
    drizzle: vi.fn().mockReturnValue(mockDb)
  };
});

describe('DatabaseService', () => {
  let service: DatabaseService;
  let configService: ConfigService;
  let logger: ILogger;
  let schemaService: DatabaseSchemaService;
  let mockPool: any;
  let MockPool: typeof Pool;

  const testConfig = {
    host: 'localhost',
    port: 5432,
    user: 'test_user',
    password: 'test_password',
    database: 'test_db'
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock pool instance
    mockPool = {
      query: vi.fn().mockResolvedValue({ rows: [{ '1': 1 }] }),
      end: vi.fn().mockResolvedValue(undefined)
    };

    // Create mock Pool constructor that implements the required Pool interface
    MockPool = vi.fn(() => mockPool) as unknown as typeof Pool;
    Object.assign(MockPool, Pool, {
      on: vi.fn(),
      once: vi.fn(),
      removeListener: vi.fn(),
      removeAllListeners: vi.fn(),
      getEventListeners: vi.fn(),
      listenerCount: vi.fn(),
      prependListener: vi.fn(),
      prependOnceListener: vi.fn(),
      eventNames: vi.fn(),
      emit: vi.fn()
    });

    configService = {
      get: vi.fn().mockReturnValue(testConfig)
    } as unknown as ConfigService;

    logger = {
      info: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis()
    } as unknown as ILogger;

    schemaService = {
      schemas: {}
    } as unknown as DatabaseSchemaService;

    // Pass mock Pool constructor to service
    service = new DatabaseService(
      configService,
      logger,
      schemaService,
      MockPool
    );
  });

  it('should create service instance', () => {
    expect(service).toBeDefined();
    expect(configService.get).toHaveBeenCalledWith('database');
  });

  it('should connect to database', async () => {
    await service.connect();

    // Verify we tested the connection
    expect(mockPool.query).toHaveBeenCalledWith('SELECT 1');
    // Verify we logged success
    expect(logger.info).toHaveBeenCalledWith('Database connected successfully');
  });

  it('should handle connection error', async () => {
    const error = new Error('Connection error');
    mockPool.query.mockRejectedValueOnce(error);

    await expect(service.connect()).rejects.toThrow('Connection error');
    expect(logger.error).toHaveBeenCalledWith('Database connection failed', {
      error
    });
  });

  it('should disconnect from database', async () => {
    await service.connect();
    await service.disconnect();

    expect(mockPool.end).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Database connection closed');
  });

  it('should throw error when getting db before connection', () => {
    expect(() => service.getDb()).toThrow('Database not connected');
  });

  it('should return db instance after connection', async () => {
    await service.connect();
    const db = service.getDb();
    // Instead of comparing the entire object, check for specific properties
    expect(db).toHaveProperty('query');
    expect(db).toHaveProperty('dialect');
  });

  describe('config validation', () => {
    it('should validate config with missing fields', () => {
      const invalidConfig = {
        host: 'localhost'
        // Missing required fields
      };
      configService.get = vi.fn().mockReturnValue(invalidConfig);

      expect(
        () => new DatabaseService(configService, logger, schemaService)
      ).toThrow('Missing required field: port');
    });

    it('should validate config with wrong types', () => {
      const invalidConfig = {
        host: 'localhost',
        port: '5432', // should be number
        user: 'test_user',
        password: 'test_password',
        database: 'test_db'
      };
      configService.get = vi.fn().mockReturnValue(invalidConfig);

      expect(
        () => new DatabaseService(configService, logger, schemaService)
      ).toThrow('port must be a number');
    });
  });
});
