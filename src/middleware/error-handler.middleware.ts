// src/middleware/error-handler.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../modules/core/logger/logger.service';
import { HttpError } from '../common/utils/error-handler';

export function errorHandlerMiddleware(logger: Logger) {
  const log = logger.child({ context: 'ErrorHandlerMiddleware' });

  return (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const statusCode = err instanceof HttpError ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    const requestId = req.headers['x-request-id'] || '';

    if (statusCode >= 500) {
      log.error('Server Error', { error: err, requestId });
    } else {
      log.warn('Client Error', { error: err, requestId });
    }

    res.status(statusCode).json({ message });
  };
}
