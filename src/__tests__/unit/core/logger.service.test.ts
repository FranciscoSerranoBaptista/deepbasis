// src/modules/core/logger/logger.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogger } from '@app/modules/core/logger/logger.factory';
import { Logger } from '@app/modules/core/logger/logger.service';

describe('Logger Factory', () => {
  it('should create a new Logger instance', () => {
    const logger = createLogger();
    expect(logger).toBeInstanceOf(Logger);
  });
});

describe('Logger Service', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  it('should log debug messages', () => {
    const debugSpy = vi.spyOn(logger['logger'], 'debug');
    logger.debug('Debug message');
    expect(debugSpy).toHaveBeenCalledWith('Debug message', {});
  });

  it('should log info messages', () => {
    const infoSpy = vi.spyOn(logger['logger'], 'info');
    logger.info('Info message');
    expect(infoSpy).toHaveBeenCalledWith('Info message', {});
  });

  it('should log warn messages', () => {
    const warnSpy = vi.spyOn(logger['logger'], 'warn');
    logger.warn('Warn message');
    expect(warnSpy).toHaveBeenCalledWith('Warn message', {});
  });

  it('should log error messages', () => {
    const errorSpy = vi.spyOn(logger['logger'], 'error');
    logger.error('Error message');
    expect(errorSpy).toHaveBeenCalledWith('Error message', {});
  });

  it('should log fatal messages', () => {
    const fatalSpy = vi.spyOn(logger['logger'], 'log');
    logger.fatal('Fatal message');
    expect(fatalSpy).toHaveBeenCalledWith('fatal', 'Fatal message', {});
  });

  it('should create a child logger with extended metadata', () => {
    const childLogger = logger.child({ requestId: '12345' });
    expect(childLogger).toBeInstanceOf(Logger);
  });

  it('should extend metadata', () => {
    const extendedLogger = logger.extendMeta({ userId: 'user123' });
    expect(extendedLogger).toBeInstanceOf(Logger);
  });
});
