// src/modules/infrastructure/database/database.service.ts;

import { Lifetime } from 'awilix';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Service } from '../../../common/decorators/service.decorator';
import { ConfigService } from '../../../config/config.service';
import { ILogger } from '@app/modules/core/logger/logger.interface';
import { DatabaseSchemaService } from '@app/modules/infrastructure/database/database.schema.service';
import {
  DatabaseConfig,
  DrizzleDB,
  IDatabaseService
} from '@app/modules/infrastructure/database/database.interface';

@Service({ name: 'databaseService', lifetime: Lifetime.SINGLETON })
export class DatabaseService implements IDatabaseService {
  private pool: Pool | null = null;
  private db: DrizzleDB | null = null;
  private readonly config: DatabaseConfig;
  private readonly Pool: typeof Pool;

  constructor(
    configService: ConfigService,
    private readonly logger: ILogger,
    private readonly schemaService: DatabaseSchemaService,
    PoolClass?: typeof Pool
  ) {
    this.logger = logger.child({ context: DatabaseService.name });
    const dbConfig = configService.get<DatabaseConfig>('database');
    this.validateConfig(dbConfig);
    this.config = dbConfig;
    // Allow dependency injection of Pool for testing
    this.Pool = PoolClass || Pool;
  }

  async connect(): Promise<void> {
    try {
      this.pool = new this.Pool(this.config);
      await this.pool.query('SELECT 1');

      this.db = drizzle(this.pool, {
        schema: this.schemaService.schemas
      }) as DrizzleDB;

      this.logger.info('Database connected successfully');
    } catch (error) {
      this.logger.error('Database connection failed', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.db = null;
      this.logger.info('Database connection closed');
    }
  }

  getDb(): DrizzleDB {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  private validateConfig(config: unknown): asserts config is DatabaseConfig {
    if (!config || typeof config !== 'object') {
      throw new Error('Database configuration must be an object');
    }

    const c = config as Record<string, unknown>;
    const requiredFields: Array<keyof DatabaseConfig> = [
      'host',
      'port',
      'user',
      'password',
      'database'
    ];

    for (const field of requiredFields) {
      if (!c[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (typeof c.host !== 'string') throw new Error('host must be a string');
    if (typeof c.port !== 'number') throw new Error('port must be a number');
    if (typeof c.user !== 'string') throw new Error('user must be a string');
    if (typeof c.password !== 'string')
      throw new Error('password must be a string');
    if (typeof c.database !== 'string')
      throw new Error('database must be a string');
  }
}
