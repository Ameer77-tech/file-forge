import multer from "multer";
import AppError from "../errors/AppError.js";
import env from "../config/env.js";
import logger from "../config/logger.js";

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.warn(err.message);

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(413).json({
          success: false,
          message: "File size exceeds the 10 GB limit.",
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Only one file is allowed.",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Unexpected file field.",
        });

      default:
        return res.status(400).json({
          success: false,
          message: err.message,
        });
    }
  }

  if (err instanceof AppError) {
    logger.error(err.message);

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: env.NODE_ENV === "development" ? err.data : null,
    });
  }

  logger.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: env.NODE_ENV === "development" ? err : null,
  });
};

export default errorMiddleware;
