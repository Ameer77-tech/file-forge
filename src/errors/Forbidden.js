

import AppError from "./AppError.js";

class ForbiddenError extends AppError {
  constructor(message = "Forbidden", data = null) {
    super(message, 403, data);
  }
}

export default ForbiddenError;