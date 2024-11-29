// src/modules/core/health/health.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { HealthService } from '@app/modules/core/health/health.service';
import { DatabaseService } from '@app/modules/infrastructure/database/database.service';
import { DatabaseSchemaService } from '@app/modules/infrastructure/database/database.schema.service';
import { ILogger } from '@app/modules/core/logger/logger.interface';

describe('HealthService', () => {
  let healthService: HealthService;
  let databaseServiceMock: DatabaseService;
  let schemaServiceMock: DatabaseSchemaService;
  let loggerMock: ILogger;

  beforeEach(() => {
    const dbMock = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ count: 1 }])
    };

    databaseServiceMock = {
      getDb: vi.fn().mockReturnValue(dbMock)
    } as unknown as DatabaseService;

    schemaServiceMock = {
      getSchema: vi.fn().mockReturnValue('users')
    } as unknown as DatabaseSchemaService;

    loggerMock = {
      child: vi.fn().mockReturnThis(),
      info: vi.fn(),
      error: vi.fn()
    } as unknown as ILogger;

    healthService = new HealthService(
      databaseServiceMock,
      schemaServiceMock,
      loggerMock
    );
  });

  it('should initialize the service and set up the health check route', async () => {
    const routerGetSpy = vi.spyOn(healthService.router, 'get');
    await healthService.initialize();
    expect(routerGetSpy).toHaveBeenCalledWith('/health', expect.any(Function));
    expect(loggerMock.info).toHaveBeenCalledWith('HealthService initialized');
  });

  it('should return 200 status and ok when database is healthy', async () => {
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;

    await healthService['healthCheck'](req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      checks: {
        database: 'ok'
      }
    });
  });

  it('should return 503 status and unhealthy when database is not healthy', async () => {
    const dbMock = databaseServiceMock.getDb() as unknown as {
      select: ReturnType<typeof vi.fn>;
      from: ReturnType<typeof vi.fn>;
      limit: ReturnType<typeof vi.fn>;
    };
    dbMock.limit.mockRejectedValue(new Error('Database error'));

    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;

    await healthService['healthCheck'](req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: 'unhealthy',
      checks: {
        database: 'failed'
      }
    });
    expect(loggerMock.error).toHaveBeenCalledWith(
      'Database health check failed',
      { error: expect.any(Error) }
    );
  });
});
