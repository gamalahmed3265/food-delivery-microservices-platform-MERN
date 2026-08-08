// utils/sendResponse.ts
import { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: Record<string, unknown> = {}
) => {
  return res.status(statusCode).json({ message, ...data });
};