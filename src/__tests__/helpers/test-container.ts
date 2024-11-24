import {
  asClass,
  asValue,
  createContainer,
  InjectionMode,
  AwilixContainer,
  Lifetime
} from 'awilix';
import { Logger } from '../../modules/core/logger/logger.service';
import { ConfigService } from '../../config/config.service';
import { DatabaseService } from '../../modules/infrastructure/database/database.service';
import { EventEmitterService } from '../../modules/core/event-emitter/event-emitter.service';
import { AuthService } from '../../modules/features/auth/auth.service';
import { UserService } from '../../modules/features/user/user.service';
import UserRepository from '../../modules/features/user/user.repository';
import testConfig from '../config/test-config';

export class TestContainer {
  private static instance: AwilixContainer;

  public static getInstance(): AwilixContainer {
    if (!TestContainer.instance) {
      TestContainer.instance = createContainer({
        injectionMode: InjectionMode.CLASSIC
      });

      const logger = new Logger({ context: 'test' });
      const configService = new ConfigService(logger);

      // Pre-initialize config service with test configuration
      configService['config'] = testConfig;

      // Register core dependencies
      TestContainer.instance.register({
        logger: asValue(logger),
        configService: asValue(configService),
        eventEmitter: asClass(EventEmitterService).singleton(),
        databaseService: asClass(DatabaseService, {
          lifetime: Lifetime.SINGLETON
        }).inject(() => ({
          logger: logger,
          configService: configService
        }))
      });

      // Register feature services
      TestContainer.instance.register({
        userRepository: asClass(UserRepository, {
          lifetime: Lifetime.SCOPED
        }),
        userService: asClass(UserService, {
          lifetime: Lifetime.SCOPED
        }),
        authService: asClass(AuthService, {
          lifetime: Lifetime.SCOPED
        })
      });
    }

    return TestContainer.instance;
  }

  public static reset(): void {
    if (TestContainer.instance) {
      TestContainer.instance.dispose();
      TestContainer.instance = undefined as any;
    }
  }

  public static async resetDatabase(): Promise<void> {
    const dbService =
      TestContainer.instance?.resolve<DatabaseService>('databaseService');
    if (dbService) {
      // Clear all tables or perform other cleanup
      const connection = await dbService['dataSource'];
      if (connection) {
        const entities = connection.entityMetadatas;
        for (const entity of entities) {
          const repository = connection.getRepository(entity.name);
          await repository.clear();
        }
      }
    }
  }
}

export const container = TestContainer.getInstance();
