/**
 * Custom Application Error class
 * 
 * Расширенный класс Error с поддержкой HTTP статус кодов и кодов ошибок
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintain proper stack trace (only available on V8)
    Error.captureStackTrace(this, this.constructor);
  }
}

