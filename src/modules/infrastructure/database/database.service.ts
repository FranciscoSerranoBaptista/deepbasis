// src/modules/infrastructure/database/database.service.ts

import 'reflect-metadata';
import {
  IDatabaseService,
  IRepository,
  FindOptions,
  DatabaseConfig
} from './database.interface';
import { Service } from '../../../common/decorators/service.decorator';
import { Lifetime } from 'awilix';
import { ConfigService } from '../../../config/config.service';
import { Logger } from '../../core/logger/logger.service';
import { User } from '../../features/user/user.entity';
import {
  DataSource,
  Repository,
  ObjectLiteral,
  EntityTarget,
  FindOptionsWhere,
  DeepPartial,
  FindOneOptions,
  FindManyOptions,
  FindOptionsOrder
} from 'typeorm';
import { ILogger } from '@app/modules/core/logger/logger.interface';

@Service({ name: 'databaseService', lifetime: Lifetime.SINGLETON })
export class DatabaseService implements IDatabaseService {
  private dataSource!: DataSource;
  private logger: ILogger;
  private readonly config: DatabaseConfig;

  constructor(configService: ConfigService, logger: ILogger) {
    this.logger = logger.child({ context: DatabaseService.name });

    // Get database config during construction
    const dbConfig = configService.getAll<{ database: DatabaseConfig }>()
      .database;
    this.validateDatabaseConfig(dbConfig);
    this.config = dbConfig;
  }

  async connect(): Promise<void> {
    try {
      this.dataSource = new DataSource({
        type: 'postgres',
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        password: this.config.password,
        database: this.config.dbName,
        entities: [User], // Add your entities here
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development'
      });

      await this.dataSource.initialize();
      this.logger.info('Database connected successfully');
    } catch (error) {
      this.logger.error('Database connection failed', { error });
      throw error;
    }
  }

  private validateDatabaseConfig(
    config: unknown
  ): asserts config is DatabaseConfig {
    if (!config || typeof config !== 'object') {
      throw new Error(
        'Invalid database configuration: configuration must be an object'
      );
    }

    const c = config as Record<string, unknown>;

    if (typeof c.host !== 'string') {
      throw new Error('Invalid database configuration: host must be a string');
    }
    if (typeof c.port !== 'number') {
      throw new Error('Invalid database configuration: port must be a number');
    }
    if (typeof c.username !== 'string') {
      throw new Error(
        'Invalid database configuration: username must be a string'
      );
    }
    if (typeof c.password !== 'string') {
      throw new Error(
        'Invalid database configuration: password must be a string'
      );
    }
    if (typeof c.dbName !== 'string') {
      throw new Error(
        'Invalid database configuration: dbName must be a string'
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      this.logger.info('Database connection closed');
    }
  }

  getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>
  ): IRepository<T> {
    return new TypeORMRepository<T>(this.dataSource.getRepository(entity));
  }
}

class TypeORMRepository<T extends ObjectLiteral> implements IRepository<T> {
  constructor(private repository: Repository<T>) {}

  async find(options?: FindOptions): Promise<T[]> {
    const typeormOptions: FindManyOptions<T> = {};

    if (options?.where) {
      typeormOptions.where = options.where as FindOptionsWhere<T>;
    }

    if (options?.relations) {
      typeormOptions.relations = options.relations;
    }

    if (options?.order) {
      typeormOptions.order = {} as FindOptionsOrder<T>;
      for (const [key, value] of Object.entries(options.order)) {
        (typeormOptions.order as any)[key] = value;
      }
    }

    if (options?.skip !== undefined) {
      typeormOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      typeormOptions.take = options.take;
    }

    return this.repository.find(typeormOptions);
  }

  async findOne(id: string): Promise<T | null> {
    const options: FindOneOptions<T> = {
      where: { id: id as any } as FindOptionsWhere<T>
    };
    return this.repository.findOne(options);
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const newEntity = this.repository.create(entity);
    return this.repository.save(newEntity);
  }

  async update(id: string, entity: DeepPartial<T>): Promise<T> {
    await this.repository.update(id, entity as any);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Entity not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
