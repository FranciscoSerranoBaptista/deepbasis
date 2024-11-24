// src/app.ts

import {
  asClass,
  asFunction,
  AwilixContainer,
  createContainer,
  InjectionMode,
  Lifetime
} from 'awilix';
import path from 'path';
import 'reflect-metadata';
import { ConfigService } from './config/config.service';
import { EventEmitterService } from './modules/core/event-emitter/event-emitter.service';
import { createLogger } from './modules/core/logger/logger.factory';
import { DatabaseService } from './modules/infrastructure/database/database.service';
import { Server } from './server';

export class App {
  private container: AwilixContainer;

  constructor() {
    this.container = createContainer({
      injectionMode: InjectionMode.CLASSIC
    });
  }

  private registerDependencies(): void {
    // Manually register core instances
    this.container.register({
      logger: asFunction(createLogger).singleton(),
      configService: asClass(ConfigService).singleton(),
      eventEmitter: asClass(EventEmitterService).singleton(),
      databaseService: asClass(DatabaseService).singleton(),
      server: asClass(Server).singleton()
    });
  }

  private loadFeatureModules(): void {
    const modulesPath = path.resolve(__dirname, 'modules');
    const glob = require('glob');

    type LifetimeType = 'SCOPED' | 'SINGLETON';
    type LifetimeMethodType = 'scoped' | 'singleton';

    interface ModulePattern {
      pattern: string;
      type: string;
      lifetime?: LifetimeType;
    }

    // Define patterns based on module functionality, not location
    const patterns: ModulePattern[] = [
      // Core infrastructure services (singletons)
      {
        pattern: '**/core/**/health.service.{js,ts}',
        type: 'Service',
        lifetime: 'SINGLETON'
      },
      // Feature modules (scoped per request)
      {
        pattern: '**/features/**/*.controller.{js,ts}',
        type: 'Controller',
        lifetime: 'SCOPED'
      },
      {
        pattern: '**/features/**/*.service.{js,ts}',
        type: 'Service',
        lifetime: 'SCOPED'
      },
      {
        pattern: '**/features/**/*.repository.{js,ts}',
        type: 'Repository',
        lifetime: 'SCOPED'
      }
    ];

    patterns.forEach(({ pattern, type, lifetime = 'SCOPED' }) => {
      const files: string[] = glob.sync(pattern, { cwd: modulesPath });
      console.log(`Found ${type}s:`, files);

      files.forEach((filePath: string) => {
        const fullPath = path.resolve(modulesPath, filePath);
        const module = require(fullPath);
        const ModuleClass = module.default || Object.values(module)[0];

        if (ModuleClass) {
          const name =
            ModuleClass.name.charAt(0).toLowerCase() +
            ModuleClass.name.slice(1);
          const lifetimeMethod = lifetime.toLowerCase() as LifetimeMethodType;

          this.container.register({
            [name]: asClass(ModuleClass)[lifetimeMethod]()
          });
          console.log(
            `Registered ${type.toLowerCase()}: ${name} (${lifetime})`
          );
        }
      });
    });

    console.log(
      'All registered modules:',
      Object.keys(this.container.registrations)
    );
  }

  private registerMiddleware(): void {
    this.container.register({
      requestLogger: asClass(
        require('./middleware/request-logger.middleware')
          .RequestLoggerMiddleware
      ).singleton(),
      errorHandler: asFunction(
        require('./middleware/error-handler.middleware').errorHandlerMiddleware
      ).singleton()
    });
  }

  public async start(): Promise<void> {
    try {
      // Step 1: Register core dependencies
      console.log('Step 1: Starting registration of dependencies');
      this.registerDependencies();

      // Step 2: Initialize ConfigService
      console.log('Step 2: Resolving and initializing ConfigService');
      const configService: ConfigService =
        this.container.resolve('configService');
      await configService.initialize();

      // Step 3: Initialize DatabaseService
      console.log('Step 3: Resolving and initializing DatabaseService');
      const dbService: DatabaseService =
        this.container.resolve('databaseService');
      await dbService.connect();

      // Step 4: Load feature modules
      console.log('Step 4: Loading feature modules');
      this.loadFeatureModules();

      // Step 5: Register middleware
      console.log('Step 5: Registering middleware');
      this.registerMiddleware();

      // Step 6: Initialize and start server
      console.log('Step 6: Resolving and initializing Server');
      const server: Server = this.container.resolve('server');
      await server.initialize();

      console.log('Step 7: Starting server');
      await server.start();
    } catch (error) {
      console.error('Application startup failed:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    const server: Server = this.container.resolve('server');
    await server.stop();

    const dbService: DatabaseService =
      this.container.resolve('databaseService');
    await dbService.disconnect();
  }
}
