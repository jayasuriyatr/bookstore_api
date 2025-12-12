require('express-async-errors');
const express = require('express');
const config = require('./config/config');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

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

const apiRoutes = require('./routes/index');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
app.set('trust proxy', 1);

app.use(helmetConfig);
app.use(corsConfig);
app.use(securityHeaders);
app.use(timeout(30));
app.use(compressionConfig);
app.use(morganConfig());

app.use(express.json({
  limit: '10mb',
  strict: true,
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));
app.use(sanitizeRequest);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Bookstore API Documentation'
}));

app.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.redirect('/api');
});

app.use('/api', apiRoutes);
app.use('/api/books', bookRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;