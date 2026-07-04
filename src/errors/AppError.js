class AppError extends Error {
  constructor(message = "Internal Server Error", statusCode = 500, data = {}) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = data;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
