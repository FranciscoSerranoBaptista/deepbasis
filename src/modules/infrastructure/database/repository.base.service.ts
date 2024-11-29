// src/modules/infrastructure/database/repository.base.service.ts

import { PgTable } from 'drizzle-orm/pg-core';
import { Service } from '../../../common/decorators/service.decorator';
import { DatabaseService } from './database.service';

@Service({ name: 'repositoryBaseService' })
export abstract class RepositoryBaseService<T extends PgTable> {
  protected abstract readonly table: T;

  constructor(protected readonly databaseService: DatabaseService) {}

  protected getDb() {
    return this.databaseService.getDb();
  }
}
