import { Request, Response, NextFunction } from 'express';

interface ServerError {
  name?: string;
  message?: string;
  code?: number;
  statusCode?: number;
  errors?: Record<string, { message: string }>;
}

const getServerError = (error: unknown): ServerError => {
  if (typeof error === 'object' && error !== null) {
    return error as ServerError;
  }
  return { message: 'Server Error' };
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const serverError = getServerError(err);
  let error: { message: string; statusCode?: number } = {
    message: serverError.message || 'Server Error',
  };

  // Mongoose bad ObjectId
  if (serverError.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (serverError.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (serverError.name === 'ValidationError' && serverError.errors) {
    const message = Object.values(serverError.errors).map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (serverError.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (serverError.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};