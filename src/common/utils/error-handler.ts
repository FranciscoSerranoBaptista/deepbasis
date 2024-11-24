// src/common/utils/error-handler.ts

export class ApplicationError extends Error {
  public readonly isOperational: boolean;

  constructor(message: string, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends ApplicationError {}

export class DatabaseError extends ApplicationError {}

export class HttpError extends ApplicationError {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
