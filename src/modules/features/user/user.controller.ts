// src/modules/features/user/user.controller.ts

import { ILogger } from '@app/modules/core/logger/logger.interface';
import { Lifetime } from 'awilix';
import { Request, Response, Router } from 'express';
import { Service } from '../../../common/decorators/service.decorator';
import {
  ApplicationError,
  HttpError
} from '../../../common/utils/error-handler';
import { UserService } from './user.service';
import { CreateUserDTO, UpdateUserDTO } from './user.types';

@Service({ name: 'userController', lifetime: Lifetime.SCOPED })
export class UserController {
  public router: Router;
  private logger: ILogger;

  constructor(
    private userService: UserService,
    logger: ILogger
  ) {
    // Create a child logger with context specific to UserController
    this.logger = logger.child({ context: UserController.name });
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getAllUsers.bind(this));
    this.router.post('/', this.createUser.bind(this));
    this.router.get('/:id', this.getUserById.bind(this));
    this.router.put('/:id', this.updateUser.bind(this));
    this.router.delete('/:id', this.deleteUser.bind(this));
  }

  private async getAllUsers(req: Request, res: Response): Promise<void> {
    const requestId = this.getRequestId(req);
    this.logger.info('Fetching all users', { requestId });

    try {
      const users = await this.userService.listUsers();
      res.json(users);
      this.logger.info('Fetched all users successfully', {
        requestId,
        count: users.length
      });
    } catch (error) {
      this.handleError(res, error, requestId);
    }
  }

  private async createUser(req: Request, res: Response): Promise<void> {
    const requestId = this.getRequestId(req);
    this.logger.info('Creating new user', { requestId });

    try {
      const dto: CreateUserDTO = req.body;
      const user = await this.userService.createUser(dto);
      res.status(201).json(user);
      this.logger.info('User created successfully', {
        requestId,
        userId: user.id
      });
    } catch (error) {
      this.handleError(res, error, requestId);
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    const requestId = this.getRequestId(req);
    const userId = req.params.id;
    this.logger.info(`Fetching user with ID: ${userId}`, { requestId, userId });

    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        this.logger.warn(`User not found: ${userId}`, { requestId, userId });
        throw new HttpError(404, 'User not found');
      }
      res.json(user);
      this.logger.info(`Fetched user successfully: ${userId}`, {
        requestId,
        userId
      });
    } catch (error) {
      this.handleError(res, error, requestId);
    }
  }

  private async updateUser(req: Request, res: Response): Promise<void> {
    const requestId = this.getRequestId(req);
    const userId = req.params.id;
    this.logger.info(`Updating user with ID: ${userId}`, { requestId, userId });

    try {
      const dto: UpdateUserDTO = req.body;
      const updatedUser = await this.userService.updateUser(userId, dto);
      res.json(updatedUser);
      this.logger.info(`User updated successfully: ${userId}`, {
        requestId,
        userId
      });
    } catch (error) {
      this.handleError(res, error, requestId);
    }
  }

  private async deleteUser(req: Request, res: Response): Promise<void> {
    const requestId = this.getRequestId(req);
    const userId = req.params.id;
    this.logger.info(`Deleting user with ID: ${userId}`, { requestId, userId });

    try {
      await this.userService.deleteUser(userId);
      res.status(204).send();
      this.logger.info(`User deleted successfully: ${userId}`, {
        requestId,
        userId
      });
    } catch (error) {
      this.handleError(res, error, requestId);
    }
  }

  private handleError(res: Response, error: unknown, requestId: string): void {
    if (error instanceof ApplicationError) {
      this.logger.error('Application error occurred', {
        requestId,
        error: error.message
      });
      res
        .status(error instanceof HttpError ? error.statusCode : 500)
        .json({ message: error.message });
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
