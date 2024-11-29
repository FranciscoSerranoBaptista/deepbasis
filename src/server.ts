// src/server.ts

import { Lifetime } from 'awilix';
import bodyParser from 'body-parser';
import express, { Application } from 'express';
import { Service } from './common/decorators/service.decorator';
import { IService } from './common/interfaces/service.interface';
import { ConfigService } from './config/config.service';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { HealthService } from './modules/core/health/health.service';
import { Logger } from './modules/core/logger/logger.service';
import { AuthController } from './modules/features/auth/auth.controller';
import { UserController } from './modules/features/user/user.controller';

@Service({ name: 'server', lifetime: Lifetime.SINGLETON })
export class Server implements IService {
  public readonly app: Application;
  private configService: ConfigService;

  constructor(
    private logger: Logger,
    configService: ConfigService,
    private requestLogger: RequestLoggerMiddleware,
    private userController: UserController,
    private authController: AuthController,
    private healthService: HealthService
  ) {
    this.configService = configService;
    this.app = express();
  }

  async initialize(): Promise<void> {
    // Initialize middleware
    this.app.use(bodyParser.json());
    this.app.use(this.requestLogger.middleware.bind(this.requestLogger));

    // Register routes
    this.app.use('/users', this.userController.router);
    this.app.use('/auth', this.authController.router);

    // Register health check route
    this.app.use('/', this.healthService.router);

    // Global error handling middleware (should be registered last)
    this.app.use(errorHandlerMiddleware(this.logger));

    this.logger.info('Server initialized');
  }

  async start(): Promise<void> {
    const port = this.configService.get<number>('app.port');
    this.app.listen(port, () => {
      this.logger.info(`Server is running on port ${port}`);
    });
  }

  async stop(): Promise<void> {
    // Implement graceful shutdown if needed
    this.logger.info('Server stopped');
  }
}
