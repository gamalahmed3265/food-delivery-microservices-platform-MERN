import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });
    } else {
      logger.warn(`${req.method} ${req.originalUrl} - ${err.message}`);
    }
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (typeof err === "object" && err !== null && "code" in err && (err as any).code === 11000) {
    logger.warn(`${req.method} ${req.originalUrl} - Duplicate key error`);
    return res.status(400).json({ message: "Duplicate field value, already exists" });
  }

  logger.error(`${req.method} ${req.originalUrl} - Unhandled error`, { error: err });
  return res.status(500).json({ message: "Something went wrong, please try again" });
};