import AppError from "./AppError.js";

class NotFoundError extends AppError {
  constructor(message = "Resource Not Found", data = null) {
    super(message, 404, data);
  }
}

export default NotFoundError;
