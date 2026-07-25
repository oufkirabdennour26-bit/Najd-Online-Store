import { Response } from 'express';

export class ApiResponse {
  static success(
    res: Response,
    data: any = null,
    message = 'Success',
    statusCode = 200,
    extra: Record<string, any> = {}
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...extra
    });
  }

  static error(
    res: Response,
    message = 'An error occurred',
    statusCode = 400,
    details: any = null
  ) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(details && { details })
    });
  }
}
