import morgan, { StreamOptions } from "morgan";
import logger from "../utils/logger";

const stream: StreamOptions = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};

const skip = () => process.env.NODE_ENV === "test";

export const requestLogger = morgan(
  process.env.NODE_ENV === "production"
    ? "combined"
    : ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);