// src/modules/infrastructure/database/database.schema.service.ts
import { Service } from '../../../common/decorators/service.decorator';
import { Lifetime } from 'awilix';
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

@Service({ name: 'databaseSchemaService', lifetime: Lifetime.SINGLETON })
export class DatabaseSchemaService {
  public readonly schemas = {
    users: pgTable('users', {
      id: uuid('id').defaultRandom().primaryKey(),
      name: varchar('name', { length: 100 }).notNull(),
      email: varchar('email', { length: 150 }).notNull().unique(),
      passwordHash: varchar('password_hash').notNull(),
      createdAt: timestamp('created_at').defaultNow().notNull(),
      updatedAt: timestamp('updated_at').defaultNow().notNull()
    })
  };

  getSchema(name: keyof DatabaseSchemaService['schemas']) {
    const schema = this.schemas[name];
    if (!schema) {
      throw new Error(`Schema with name '${name}' does not exist`);
    }
    return schema;
  }
}

// Export the schema types
export type UsersTable = typeof DatabaseSchemaService.prototype.schemas.users;
