// src/__tests__/helpers/test-container.ts
import {
  asValue,
  AwilixContainer,
  createContainer,
  InjectionMode
} from 'awilix';
import { sql } from 'drizzle-orm';
import { vi } from 'vitest';
import { ConfigService } from '../../config/config.service';
import { Logger } from '../../modules/core/logger/logger.service';
import { DatabaseSchemaService } from '../../modules/infrastructure/database/database.schema.service';
import { DatabaseService } from '../../modules/infrastructure/database/database.service';
import testConfig from '../config/test-config';

export class TestContainer {
  private static instance: AwilixContainer | null = null;
  private static dbService: DatabaseService | null = null;

  public static async getInstance(): Promise<AwilixContainer> {
    if (!TestContainer.instance) {
      TestContainer.instance = createContainer({
        injectionMode: InjectionMode.CLASSIC
      });

      // Initialize core services
      const logger = new Logger({ context: 'test' });
      const configService = new ConfigService(logger);
      const schemaService = new DatabaseSchemaService();

      // Set test configuration
      configService['config'] = testConfig;

      // Register core services
      TestContainer.instance.register({
        logger: asValue(logger),
        configService: asValue(configService),
        schemaService: asValue(schemaService)
      });

      // For integration tests, initialize database
      if (process.env.TEST_TYPE === 'integration') {
        await TestContainer.initializeDatabase();
      } else {
        // For unit tests, register mock database service
        TestContainer.instance.register({
          databaseService: asValue({
            getDb: vi.fn(),
            connect: vi.fn(),
            disconnect: vi.fn()
          })
        });
      }
    }

    return TestContainer.instance;
  }

  private static async initializeDatabase(): Promise<void> {
    if (!TestContainer.instance) {
      throw new Error('Container must be initialized before database');
    }

    const configService =
      TestContainer.instance.resolve<ConfigService>('configService');
    const logger = TestContainer.instance.resolve<Logger>('logger');
    const schemaService =
      TestContainer.instance.resolve<DatabaseSchemaService>('schemaService');

    TestContainer.dbService = new DatabaseService(
      configService,
      logger,
      schemaService
    );
    await TestContainer.dbService.connect();

    TestContainer.instance.register({
      databaseService: asValue(TestContainer.dbService)
    });
  }

  public static async reset(): Promise<void> {
    if (TestContainer.dbService) {
      await TestContainer.dbService.disconnect();
      TestContainer.dbService = null;
    }

    if (TestContainer.instance) {
      TestContainer.instance.dispose();
      TestContainer.instance = null;
    }
  }

  public static async truncateTables(): Promise<void> {
    if (!TestContainer.dbService || process.env.TEST_TYPE !== 'integration') {
      return;
    }

    const db = TestContainer.dbService.getDb();
    const schemaService =
      TestContainer.instance!.resolve<DatabaseSchemaService>('schemaService');

    await db.transaction(async (tx) => {
      const tables = Object.keys(schemaService.schemas);
      for (const table of tables) {
        await tx.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`);
      }
    });
  }

  // Rename the method to match what's being called
  public static async resetDatabase(): Promise<void> {
    if (!TestContainer.instance || process.env.TEST_TYPE !== 'integration') {
      return;
    }
    try {
      const dbService =
        TestContainer.instance.resolve<DatabaseService>('databaseService');
      const db = dbService.getDb();
      const schemaService =
        TestContainer.instance.resolve<DatabaseSchemaService>('schemaService');

      // Truncate all tables in a transaction
      await db.transaction(async (tx) => {
        const tables = Object.keys(schemaService.schemas);
        for (const table of tables) {
          await tx.execute(
            sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`
          );
        }
      });
    } catch (error) {
      console.error('Error resetting database:', error); // Log the error for debugging
      throw error; // Re-throw the error to fail the test
    }
  }
}
