/**
 * Custom Application Error
 * 
 * Кастомный класс ошибок для единообразной обработки
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';

    // Сохранение stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

