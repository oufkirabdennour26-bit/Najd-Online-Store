export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly messageAr?: string;
  public readonly messageEn?: string;

  constructor(message: string, statusCode = 400, isOperational = true, messageAr?: string, messageEn?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.messageAr = messageAr;
    this.messageEn = messageEn;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError as AppError };
