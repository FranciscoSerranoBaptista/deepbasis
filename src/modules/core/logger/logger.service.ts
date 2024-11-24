// src/modules/core/logger/logger.service.ts

import {
  createLogger as createWinstonLogger,
  format,
  transports,
  Logger as WinstonLogger,
  LoggerOptions
} from 'winston';
import { ILogger } from './logger.interface';
import { v4 as uuidv4 } from 'uuid';

export class Logger implements ILogger {
  private readonly logger: WinstonLogger;
  private readonly contextMeta: Record<string, unknown>;

  constructor(contextMeta: Record<string, unknown> = {}) {
    // Generate a default correlation ID if not provided
    const correlationId = contextMeta['correlationId'] || uuidv4();
    const env = process.env.NODE_ENV || 'development';
    const isProduction = env === 'production';

    const loggerOptions: LoggerOptions = {
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: {
        service: process.env.APP_NAME || 'DeepBasis',
        correlationId,
        ...contextMeta
      },
      transports: [
        new transports.Console({
          format: isProduction
            ? format.combine(format.timestamp(), format.json())
            : format.combine(
                format.colorize(),
                format.printf(
                  ({
                    timestamp,
                    level,
                    message,
                    context,
                    correlationId,
                    ...meta
                  }) => {
                    const contextStr = context ? `[${context}] ` : '';
                    const correlationStr = correlationId
                      ? `[CorrID: ${correlationId}] `
                      : '';
                    return `${timestamp} ${level}: ${correlationStr}${contextStr}${message} ${
                      Object.keys(meta).length ? JSON.stringify(meta) : ''
                    }`;
                  }
                )
              )
        })
        // Additional transports can be added here (e.g., File, HTTP)
      ],
      exitOnError: false
    };

    this.logger = createWinstonLogger(loggerOptions);
    this.contextMeta = contextMeta;
  }

  child(meta: Record<string, unknown>): ILogger {
    return new Logger({ ...this.contextMeta, ...meta });
  }

  extendMeta(meta: Record<string, unknown>): ILogger {
    return new Logger({ ...this.contextMeta, ...meta });
  }

  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.debug(message, meta);
  }

  info(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.error(message, meta);
  }

  fatal(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.log('fatal', message, meta);
  }
}
