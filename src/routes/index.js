const express = require('express');
const ApiResponse = require('../utils/ApiResponse');

const router = express.Router();

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API Information
 *     description: Get general information about the Bookstore API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         api:
 *                           type: string
 *                           example: "Bookstore API"
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                         description:
 *                           type: string
 *                           example: "A production-ready RESTful API for managing a bookstore"
 *                         documentation:
 *                           type: object
 *                           properties:
 *                             endpoints:
 *                               type: object
 *                               example: { "books": "/api/books", "health": "/api/health" }
 *                             features:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["CRUD operations for books", "Advanced filtering and search"]
 */
router.get('/', (req, res) => {
  ApiResponse.success(
    {
      api: 'Bookstore API',
      version: '1.0.0',
      description: 'RESTful API for managing a bookstore',
      endpoints: {
        books: '/api/books',
        health: '/api/health',
        docs: '/api-docs',
      },
    },
    'Bookstore API'
  ).send(res);
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API Health Check
 *     description: Check the health status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "healthy"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         environment:
 *                           type: string
 *                           example: "development"
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                         uptime:
 *                           type: number
 *                           description: "Server uptime in seconds"
 *                           example: 3600.5
 *                         memory:
 *                           type: object
 *                           properties:
 *                             used:
 *                               type: number
 *                               description: "Used memory in MB"
 *                               example: 45.67
 *                             total:
 *                               type: number
 *                               description: "Total allocated memory in MB"
 *                               example: 128.50
 */
router.get('/health', (req, res) => {
  ApiResponse.success(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
    },
    'API is healthy'
  ).send(res);
});

module.exports = router;