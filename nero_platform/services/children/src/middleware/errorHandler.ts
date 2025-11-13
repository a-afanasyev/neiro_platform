import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ProblemDetails } from '@neiro/types';

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  if (error instanceof AppError) {
    const problemDetails: ProblemDetails = {
      type: `https://api.neiro.dev/errors/${error.code}`,
      title: error.message,
      status: error.statusCode,
      detail: error.message,
      instance: req.originalUrl,
      ...(error.details && { errors: error.details }),
    };

    return res.status(error.statusCode).json(problemDetails);
  }

  const problemDetails: ProblemDetails = {
    type: 'https://api.neiro.dev/errors/INTERNAL_ERROR',
    title: 'Внутренняя ошибка сервера',
    status: 500,
    detail: process.env.NODE_ENV === 'development' ? error.message : 'Произошла ошибка',
    instance: req.originalUrl,
  };

  res.status(500).json(problemDetails);
}

