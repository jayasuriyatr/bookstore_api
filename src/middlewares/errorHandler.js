const ApiError = require('../utils/ApiError');
const config = require('../config/config');

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (config.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 422;
    message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  } else if (err.name === 'CastError') {
    // Mongoose invalid ObjectId error
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired error
    statusCode = 401;
    message = 'Token expired';
  } else if (!(err instanceof ApiError)) {
    // Convert non-ApiError to ApiError
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
  }

  // Prepare response
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Add error details in development mode
  if (config.NODE_ENV === 'development') {
    response.error = {
      type: err.name,
      stack: err.stack,
    };
  }

  // Add request information for debugging
  if (config.NODE_ENV === 'development') {
    response.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    };
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};