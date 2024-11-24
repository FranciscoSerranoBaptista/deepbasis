// src/middleware/request-logger.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../modules/core/logger/logger.service';
import { Service } from '../common/decorators/service.decorator';
import { Lifetime } from 'awilix';
import { v4 as uuidv4 } from 'uuid';
import { ILogger } from '../modules/core/logger/logger.interface';

@Service({ lifetime: Lifetime.SCOPED })
export class RequestLoggerMiddleware {
  private logger: ILogger;

  constructor(logger: Logger) {
    this.logger = logger.child({ context: RequestLoggerMiddleware.name });
  }

  public middleware(req: Request, res: Response, next: NextFunction): void {
    //const requestId = uuidv4();
    const requestId = Array.isArray(req.headers['x-request-id'])
      ? req.headers['x-request-id'][0]
      : req.headers['x-request-id'] || '';
    req.headers['x-request-id'] = requestId; // Attach requestId to request headers

    const childLogger = this.logger.child({
      requestId,
      method: req.method,
      url: req.originalUrl
    });
    (req as any).logger = childLogger; // Attach childLogger to request object

    const startHrTime = process.hrtime();

    res.on('finish', () => {
      const elapsedHrTime = process.hrtime(startHrTime);
      const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
      childLogger.info(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedTimeInMs.toFixed(3)}ms`,
        {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: elapsedTimeInMs
        }
      );
    });

    next();
  }
}
