// middleware/requestLogger.js

import pinoHttp from "pino-http";
import logger from "../config/logger.js";

export const httpLogger = pinoHttp({
  logger,

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customLogLevel(req, res, err) {
    if (res.statusCode >= 500 || err) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },

  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
