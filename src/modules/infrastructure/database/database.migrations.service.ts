// src/modules/infrastructure/database/database.migrations.service.ts
import { Service } from '../../../common/decorators/service.decorator';
import { Lifetime } from 'awilix';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { DatabaseService } from './database.service';
import { ILogger } from '../../core/logger/logger.interface';

@Service({ name: 'databaseMigrationsService', lifetime: Lifetime.SINGLETON })
export class DatabaseMigrationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly logger: ILogger
  ) {}

  async runMigrations(): Promise<void> {
    try {
      const db = this.databaseService.getDb();
      await migrate(db, { migrationsFolder: './migrations' });
      this.logger.info('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Database migrations failed', { error });
      throw error;
    }
  }
}
