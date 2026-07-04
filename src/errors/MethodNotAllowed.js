

import AppError from "./AppError.js";

class MethodNotAllowedError extends AppError {
  constructor(message = "Method Not Allowed", data = null) {
    super(message, 405, data);
  }
}

export default MethodNotAllowedError;
