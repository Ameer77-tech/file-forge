

import AppError from "./AppError.js";

class BadRequestError extends AppError {
  constructor(message = "Bad Request", data = null) {
    super(message, 400, data);
  }
}

export default BadRequestError;
