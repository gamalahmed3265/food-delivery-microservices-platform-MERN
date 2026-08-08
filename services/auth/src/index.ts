import "dotenv/config"; // MUST be the first import — no exceptions

import express from "express";

import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import logger from "./utils/logger";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import healthRoutes from "./routes/health";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { requestLogger } from "./middleware/requestLogger.js";


const app = express();
const PORT = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());
app.use(requestLogger); // log every incoming request

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use(notFoundHandler);

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Rejection", { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
  process.exit(1);
});