require('dotenv').config();
const app = require('./src/app');
const database = require('./src/config/database');
const config = require('./src/config/config');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});

// Function to start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();
    
    // Start the HTTP server
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📡 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${config.PORT}/api`);
      console.log(`📚 Books API: http://localhost:${config.PORT}/api/books`);
      console.log(`� API Documentation: http://localhost:${config.PORT}/api-docs`);
      console.log(`�💖 Health Check: http://localhost:${config.PORT}/ping`);
      
      if (config.NODE_ENV === 'development') {
        console.log('\n📖 Available Endpoints:');
        console.log('  GET    /api              - API information');
        console.log('  GET    /api/health       - General health check');
        console.log('  GET    /ping            - Simple ping');
        console.log('  GET    /api/books       - Get all books (with filters, search, pagination)');
        console.log('  POST   /api/books       - Create a new book');
        console.log('  GET    /api/books/:id   - Get book by ID');
        console.log('  PUT    /api/books/:id   - Update book (complete)');
        console.log('  PATCH  /api/books/:id   - Update book (partial)');
        console.log('  DELETE /api/books/:id   - Delete book (soft delete)');
        console.log('  GET    /api/books/stats - Get book statistics');
        console.log('  GET    /api/books/search- Search books');
        console.log('  GET    /api/books/genre/:genre - Get books by genre');
        console.log('  GET    /api/books/author/:author - Get books by author');
        console.log('  GET    /api/books/isbn/:isbn - Get book by ISBN');
        console.log('\n🔧 Query Parameters for GET /api/books:');
        console.log('  ?page=1&limit=10       - Pagination');
        console.log('  ?search=javascript     - Search in title, author, description');
        console.log('  ?genre=Fiction         - Filter by genre');
        console.log('  ?author=John           - Filter by author');
        console.log('  ?publishedYear=2023    - Filter by year');
        console.log('  ?sort=-createdAt       - Sort by field (- for desc)');
        console.log('  ?status=active         - Filter by status');
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('💥 UNHANDLED REJECTION! Shutting down...');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated!');
      });
    });

    process.on('SIGINT', () => {
      console.log('\n👋 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated!');
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
