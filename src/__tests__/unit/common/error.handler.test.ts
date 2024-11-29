import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandlerMiddleware } from '@app/middleware/error-handler.middleware';
import { Logger } from '@app/modules/core/logger/logger.service';
import { HttpError } from '@app/common/utils/error-handler';

describe('ErrorHandlerMiddleware', () => {
  let mockLogger: Logger;
  let mockChildLogger: Logger;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let middleware: (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;

  beforeEach(() => {
    // Mock child logger
    mockChildLogger = {
      error: vi.fn(),
      warn: vi.fn()
    } as unknown as Logger;

    // Mock main logger
    mockLogger = {
      child: vi.fn().mockReturnValue(mockChildLogger)
    } as unknown as Logger;

    // Mock response
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as Partial<Response>;

    // Mock request
    mockRequest = {
      headers: {}
    } as Partial<Request>;

    // Mock next function
    mockNext = vi.fn();

    // Initialize middleware
    middleware = errorHandlerMiddleware(mockLogger);
  });

  it('should initialize with correct logger context', () => {
    expect(mockLogger.child).toHaveBeenCalledWith({
      context: 'ErrorHandlerMiddleware'
    });
  });

  it('should handle HttpError with custom status code', () => {
    // Arrange
    const httpError = new HttpError(400, 'Bad Request');

    // Act
    middleware(
      httpError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Bad Request' });
    expect(mockChildLogger.warn).toHaveBeenCalledWith('Client Error', {
      error: httpError,
      requestId: ''
    });
  });

  it('should handle generic Error with 500 status code', () => {
    // Arrange
    const genericError = new Error('Something went wrong');

    // Act
    middleware(
      genericError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Something went wrong'
    });
    expect(mockChildLogger.error).toHaveBeenCalledWith('Server Error', {
      error: genericError,
      requestId: ''
    });
  });

  it('should use default message for errors without message', () => {
    // Arrange
    const errorWithoutMessage = new Error();

    // Act
    middleware(
      errorWithoutMessage,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
  });

  it('should include request ID in logs when present', () => {
    // Arrange
    const error = new Error('Test error');
    mockRequest = {
      headers: {
        'x-request-id': 'test-request-id'
      }
    } as Partial<Request>;

    // Act
    middleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert
    expect(mockChildLogger.error).toHaveBeenCalledWith('Server Error', {
      error,
      requestId: 'test-request-id'
    });
  });

  it('should handle array of request IDs', () => {
    // Arrange
    const error = new Error('Test error');
    mockRequest = {
      headers: {
        'x-request-id': ['test-request-id-1', 'test-request-id-2']
      }
    } as Partial<Request>;

    // Act
    middleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert
    expect(mockChildLogger.error).toHaveBeenCalledWith('Server Error', {
      error,
      requestId: ['test-request-id-1', 'test-request-id-2']
    });
  });

  describe('Error logging levels', () => {
    it('should log as warning for 4xx errors', () => {
      // Arrange
      const clientErrors = [
        new HttpError(400, 'Bad Request'),
        new HttpError(401, 'Unauthorized'),
        new HttpError(403, 'Forbidden'),
        new HttpError(404, 'Not Found')
      ];

      // Act & Assert
      clientErrors.forEach((error) => {
        middleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
        expect(mockChildLogger.warn).toHaveBeenCalledWith('Client Error', {
          error,
          requestId: ''
        });
      });
    });

    it('should log as error for 5xx errors', () => {
      // Arrange
      const serverErrors = [
        new HttpError(500, 'Internal Server Error'),
        new HttpError(502, 'Bad Gateway'),
        new HttpError(503, 'Service Unavailable')
      ];

      // Act & Assert
      serverErrors.forEach((error) => {
        middleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
        expect(mockChildLogger.error).toHaveBeenCalledWith('Server Error', {
          error,
          requestId: ''
        });
      });
    });
  });
});
