import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export interface TokenPayload {
  id: string;
  role: string;
}

const ensureSecret = () => {
  if (!JWT_SECRET) {
    logger.error("JWT_SECRET is not set in environment variables");
    throw AppError.internal("Server configuration error");
  }
  return JWT_SECRET;
};

export const signToken = (payload: TokenPayload): string => {
  const secret = ensureSecret();
  const token = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
  logger.debug("Token issued", { id: payload.id, role: payload.role });
  return token;
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = ensureSecret();

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & TokenPayload;
    return { id: decoded.id, role: decoded.role };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn("Token expired");
      throw AppError.unauthorized("Token expired, please log in again");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("Invalid token", { message: error.message });
      throw AppError.unauthorized("Invalid token");
    }
    // re-throw AppError from ensureSecret() untouched
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Unexpected token verification error", { error });
    throw AppError.internal("Something went wrong, please try again");
  }
};