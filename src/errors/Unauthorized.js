
import AppError from "./AppError.js";

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", data = null) {
    super(message, 401, data);
  }
}

export default UnauthorizedError;