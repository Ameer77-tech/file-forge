import AppError from "../errors/AppError.js";
import env from "../config/env.js";
import logger from "../config/logger.js";
const errorMiddleware = (err, req, res, next) => {
  if (err instanceof AppError) {
    const message = err.message || "Internal Server Error";
    const statusCode = err.statusCode || 500;
    const error = err.data || null;

    logger.error(message);
    return res.status(statusCode).json({
      message,
      success: false,
      error: env.NODE_ENV == "development" ? error : null,
    });
  }
  const message = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;
  const error = err.data || null;
  return res.status(statusCode).json({
    message,
    success: false,
    error: env.NODE_ENV == "development" ? error : null,
  });
};

export default errorMiddleware;
