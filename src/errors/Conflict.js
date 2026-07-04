

import AppError from "./AppError.js";

class ConflictError extends AppError {
  constructor(message = "Conflict", data = null) {
    super(message, 409, data);
  }
}

export default ConflictError;
