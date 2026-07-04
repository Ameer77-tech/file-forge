// middleware/requestLogger.js

import pinoHttp from "pino-http";
import logger from "../config/logger.js";

export const httpLogger = pinoHttp({
  logger,

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
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