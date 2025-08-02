import { Response } from 'express';

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  details?: any;
}

export class ResponseUtil {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    });
  }

  static error(res: Response, error: string, code: string, statusCode = 400, details?: any) {
    return res.status(statusCode).json({
      success: false,
      error,
      code,
      details,
    });
  }

  static validationError(res: Response, errors: any) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return res.status(401).json({
      success: false,
      error: message,
      code: 'UNAUTHORIZED',
    });
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return res.status(403).json({
      success: false,
      error: message,
      code: 'FORBIDDEN',
    });
  }

  static notFound(res: Response, resource: string) {
    return res.status(404).json({
      success: false,
      error: `${resource} not found`,
      code: 'NOT_FOUND',
    });
  }

  static serverError(res: Response, error: any) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
}