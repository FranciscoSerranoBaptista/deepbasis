// src/modules/features/auth/auth.controller.ts

import { ILogger } from '@app/modules/core/logger/logger.interface';
import { Lifetime } from 'awilix';
import { Request, Response, Router } from 'express';
import { Service } from '../../../common/decorators/service.decorator';
import {
  ApplicationError,
  HttpError
} from '../../../common/utils/error-handler';
import { Logger } from '../../core/logger/logger.service';
import { AuthService } from './auth.service';
import { LoginDTO, RefreshTokenDTO, RegisterDTO } from './auth.types';
import { ValidationError } from '../../../common/utils/error-handler';

@Service({ name: 'authController', lifetime: Lifetime.SCOPED })
export class AuthController {
  public router: Router;
  private logger: ILogger;

  constructor(
    private authService: AuthService,
    logger: ILogger
  ) {
    // Create a child logger with context specific to AuthController
    this.logger = logger.child({ context: AuthController.name });
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/refresh-token', this.refreshToken.bind(this));
  }

  private async register(req: Request, res: Response): Promise<void> {
    const requestId = this.getRequestId(req);
    this.logger.info('Registering new user', { requestId });

    try {
      const dto: RegisterDTO = req.body;
      const tokens = await this.authService.register(dto);
      res.status(201).json(tokens);
      this.logger.info('User registered successfully', { requestId, tokens });
    } catch (error) {
      this.handleError(res, error, requestId);
    }
  }

  private async login(req: Request, res: Response): Promise<void> {
    const requestId = this.getRequestId(req);
    this.logger.info('User login attempt', { requestId });

    try {
      const dto: LoginDTO = req.body;
      const tokens = await this.authService.login(dto);
      res.json(tokens);
      this.logger.info('User logged in successfully', { requestId, tokens });
    } catch (error) {
      this.handleError(res, error, requestId);
    }
  }

  private async refreshToken(req: Request, res: Response): Promise<void> {
    const requestId = this.getRequestId(req);
    this.logger.info('Refreshing user token', { requestId });

    try {
      const dto: RefreshTokenDTO = req.body;
      const tokens = await this.authService.refreshToken(dto);
      res.json(tokens);
      this.logger.info('User token refreshed successfully', {
        requestId,
        tokens
      });
    } catch (error) {
      this.handleError(res, error, requestId);
    }
  }

  private handleError(res: Response, error: unknown, requestId: string): void {
    if (error instanceof ValidationError) {
      this.logger.error('Validation error occurred', {
        requestId,
        error: error.message
      });
      res.status(400).json({ message: error.message });
    } else if (error instanceof HttpError) {
      this.logger.error('HTTP error occurred', {
        requestId,
        error: error.message
      });
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof ApplicationError) {
      this.logger.error('Application error occurred', {
        requestId,
        error: error.message
      });
      res.status(500).json({ message: error.message });
    } else if (error instanceof Error) {
      this.logger.error('Unexpected error occurred', {
        requestId,
        error: error.message
      });
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      this.logger.error('Unknown error occurred', { requestId, error });
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // Helper function to safely extract requestId as a string
  private getRequestId(req: Request): string {
    const requestIdHeader = req.headers['x-request-id'];
    if (Array.isArray(requestIdHeader)) {
      return requestIdHeader[0];
    }
    return requestIdHeader || '';
  }
}
