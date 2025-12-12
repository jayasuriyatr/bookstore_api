require('express-async-errors'); // Handle async errors automatically
const express = require('express');
const config = require('./config/config');

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import middlewares
const {
  helmetConfig,
  corsConfig,
  compressionConfig,
  morganConfig,
  sanitizeRequest,
  securityHeaders,
  timeout,
} = require('./middlewares/security');

const {
  errorHandler,
  notFoundHandler,
} = require('./middlewares/errorHandler');

// Import routes
const apiRoutes = require('./routes/index');
const bookRoutes = require('./routes/bookRoutes');

// Create Express app
const app = express();

// Trust proxy (important for rate limiting and getting real IP addresses)
app.set('trust proxy', 1);

// Security middlewares
app.use(helmetConfig);
app.use(corsConfig);
app.use(securityHeaders);

// Request timeout middleware
app.use(timeout(30)); // 30 seconds timeout

// Compression middleware
app.use(compressionConfig);

// Logging middleware
app.use(morganConfig());

// Body parsing middlewares
app.use(express.json({ 
  limit: '10mb',
  strict: true,
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb',
}));

// Request sanitization middleware
app.use(sanitizeRequest);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Bookstore API Documentation'
}));

// Health check endpoint (before rate limiting)
app.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint redirect
app.get('/', (req, res) => {
  res.redirect('/api');
});

// API routes
app.use('/api', apiRoutes);
app.use('/api/books', bookRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last middleware)
app.use(errorHandler);

module.exports = app;