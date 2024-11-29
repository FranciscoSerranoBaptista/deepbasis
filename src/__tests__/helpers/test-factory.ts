// src/__tests__/helpers/test-factory.ts

import { DatabaseService } from '../../modules/infrastructure/database/database.service';
import { DatabaseSchemaService } from '../../modules/infrastructure/database/database.schema.service';
import { TestContainer } from './test-container';
import { hashPassword } from '../../common/utils/helpers';
import { User } from '../../modules/features/user/user.types';

export class TestFactory {
  private static async getServices() {
    const container = await TestContainer.getInstance();
    return {
      dbService: container.resolve<DatabaseService>('databaseService'),
      schemaService: container.resolve<DatabaseSchemaService>('schemaService')
    };
  }

  static async createUser(override: Partial<User> = {}): Promise<User> {
    const { dbService, schemaService } = await TestFactory.getServices();
    const db = dbService.getDb();
    const usersTable = schemaService.getSchema('users');

    const passwordHash = await hashPassword(
      override.passwordHash || 'password123'
    );

    const defaultUser = {
      name: 'Test User',
      email: `test.${Date.now()}@example.com`,
      passwordHash
    };

    const [user] = await db
      .insert(usersTable)
      .values({ ...defaultUser, ...override })
      .returning();

    return user;
  }

  static async createUsers(
    count: number,
    override: Partial<User> = {}
  ): Promise<User[]> {
    const { dbService, schemaService } = await TestFactory.getServices();
    const db = dbService.getDb();
    const usersTable = schemaService.getSchema('users');

    const passwordHash = await hashPassword(
      override.passwordHash || 'password123'
    );

    const users = await Promise.all(
      Array.from({ length: count }, async (_, index) => {
        const defaultUser = {
          name: `Test User ${index + 1}`,
          email: `test.${Date.now()}.${index}@example.com`,
          passwordHash
        };

        const [user] = await db
          .insert(usersTable)
          .values({ ...defaultUser, ...override })
          .returning();

        return user;
      })
    );

    return users;
  }
}
