// src/modules/core/logger/logger.factory.ts

import { Logger } from './logger.service';

/**
 * Factory function to create a new Logger instance with optional context and correlationId.
 * @param context Optional context to be included in the log metadata.
 * @param correlationId Optional correlation ID for tracking across services.
 */
export function createLogger(): Logger {
  return new Logger();
}
