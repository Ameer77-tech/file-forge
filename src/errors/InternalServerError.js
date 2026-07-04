import AppError from "./AppError.js";

class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", data = null) {
    super(message, 500, data);
  }
}

export default InternalServerError;
