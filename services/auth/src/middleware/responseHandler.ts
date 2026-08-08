import { Request, Response, NextFunction } from "express";

export interface CustomResponse extends Response {
  success: (data?: Record<string, unknown>, message?: string, statusCode?: number) => Response;
}

export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  (res as CustomResponse).success = function (
    data: Record<string, unknown> = {},
    message = "Success",
    statusCode = 200
  ) {
    return this.status(statusCode).json({
      message,
      ...data,
    });
  };
  next();
};