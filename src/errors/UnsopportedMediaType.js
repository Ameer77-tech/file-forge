

import AppError from "./AppError.js";

class UnsupportedMediaTypeError extends AppError {
  constructor(message = "Unsupported Media Type", data = null) {
    super(message, 415, data);
  }
}

export default UnsupportedMediaTypeError;