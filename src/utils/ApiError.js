class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Common HTTP status codes and error types
ApiError.BAD_REQUEST = 400;
ApiError.UNAUTHORIZED = 401;
ApiError.FORBIDDEN = 403;
ApiError.NOT_FOUND = 404;
ApiError.METHOD_NOT_ALLOWED = 405;
ApiError.CONFLICT = 409;
ApiError.VALIDATION_ERROR = 422;
ApiError.INTERNAL_SERVER_ERROR = 500;
ApiError.SERVICE_UNAVAILABLE = 503;

// Static methods for common errors
ApiError.badRequest = (message = 'Bad Request') => {
  return new ApiError(ApiError.BAD_REQUEST, message);
};

ApiError.unauthorized = (message = 'Unauthorized') => {
  return new ApiError(ApiError.UNAUTHORIZED, message);
};

ApiError.forbidden = (message = 'Forbidden') => {
  return new ApiError(ApiError.FORBIDDEN, message);
};

ApiError.notFound = (message = 'Resource not found') => {
  return new ApiError(ApiError.NOT_FOUND, message);
};

ApiError.conflict = (message = 'Conflict') => {
  return new ApiError(ApiError.CONFLICT, message);
};

ApiError.validationError = (message = 'Validation Error') => {
  return new ApiError(ApiError.VALIDATION_ERROR, message);
};

ApiError.internal = (message = 'Internal Server Error') => {
  return new ApiError(ApiError.INTERNAL_SERVER_ERROR, message);
};

module.exports = ApiError;