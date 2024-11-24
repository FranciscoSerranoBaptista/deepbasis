// src/modules/core/health/health.service.ts

import { Lifetime } from 'awilix';
import { Request, Response, Router } from 'express';
import { Service } from '../../../common/decorators/service.decorator';
import { IService } from '../../../common/interfaces/service.interface';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { ILogger } from '../logger/logger.interface';

@Service({ lifetime: Lifetime.SINGLETON })
export class HealthService implements IService {
  public router: Router;
  private logger: ILogger;

  constructor(
    private databaseService: DatabaseService,
    logger: ILogger
  ) {
    this.logger = logger.child({ context: HealthService.name });
    this.router = Router();
  }

  async initialize(): Promise<void> {
    this.router.get('/health', this.healthCheck.bind(this));
    this.logger.info('HealthService initialized');
  }

  async start(): Promise<void> {
    // No specific start actions needed
  }

  async stop(): Promise<void> {
    // No specific stop actions needed
  }

  private async healthCheck(req: Request, res: Response): Promise<void> {
    const dbStatus = await this.checkDatabase();
    const isHealthy = dbStatus;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'unhealthy',
      checks: {
        database: dbStatus ? 'ok' : 'failed'
      }
    });
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      // Get the repository for any entity (e.g., User) just to test the connection
      const repository = this.databaseService.getRepository('user');
      // Execute a simple query to check database connectivity
      await repository.find({ take: 1 });
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', { error });
      return false;
    }
  }
}
