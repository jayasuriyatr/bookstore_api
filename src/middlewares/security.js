const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const config = require('../config/config');

/**
 * Rate limiting middleware configuration
 */
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.RATE_LIMIT.windowMs,
    max: options.max || config.RATE_LIMIT.max,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((options.windowMs || config.RATE_LIMIT.windowMs) / 1000),
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((options.windowMs || config.RATE_LIMIT.windowMs) / 1000),
        timestamp: new Date().toISOString(),
      });
    },
  });
};

/**
 * Strict rate limiter for sensitive operations
 */
const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
});

/**
 * Standard rate limiter for general API usage
 */
const standardRateLimiter = createRateLimiter();

/**
 * Helmet security middleware configuration
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' },
});

/**
 * CORS middleware configuration
 */
const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (config.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, use configured origins
    const allowedOrigins = config.CORS.origin === '*' 
      ? [origin] 
      : Array.isArray(config.CORS.origin) 
        ? config.CORS.origin 
        : [config.CORS.origin];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.CORS.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: config.CORS.optionsSuccessStatus,
});

/**
 * Compression middleware configuration
 */
const compressionConfig = compression({
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for all responses
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress if response is larger than 1kb
});

/**
 * Morgan logger configuration
 */
const morganConfig = () => {
  if (config.NODE_ENV === 'production') {
    // Production: Log in combined format
    return morgan('combined', {
      stream: {
        write: (message) => {
          console.log(message.trim());
        }
      },
      skip: (req, res) => {
        // Skip logging for health check endpoints
        return req.originalUrl === '/health' || req.originalUrl === '/ping';
      }
    });
  } else {
    // Development: Log in dev format with colors
    return morgan('dev', {
      skip: (req, res) => {
        // Skip logging for health check endpoints
        return req.originalUrl === '/health' || req.originalUrl === '/ping';
      }
    });
  }
};

/**
 * Request sanitization middleware to prevent NoSQL injection
 */
const sanitizeRequest = (req, res, next) => {
  // Recursively sanitize object
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove potential NoSQL injection patterns
          obj[key] = obj[key].replace(/[{}$]/g, '');
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
    return obj;
  };
  
  // Sanitize request body, query, and params
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Response-Time', Date.now());
  
  next();
};

/**
 * Request timeout middleware
 */
const timeout = (seconds = 30) => {
  return (req, res, next) => {
    req.setTimeout(seconds * 1000, () => {
      const err = new Error('Request Timeout');
      err.statusCode = 408;
      next(err);
    });
    next();
  };
};

module.exports = {
  createRateLimiter,
  strictRateLimiter,
  standardRateLimiter,
  helmetConfig,
  corsConfig,
  compressionConfig,
  morganConfig,
  sanitizeRequest,
  securityHeaders,
  timeout,
};