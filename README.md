# Bookstore API

A fully production-ready, secure, RESTful API for managing a bookstore built with Express.js and MongoDB.

## Features

- 🚀 **Production-ready architecture** with scalable folder structure
- 🔒 **Security-first approach** with Helmet, CORS, rate limiting, and input sanitization
- 🔍 **Advanced search and filtering** with pagination and sorting
- ✅ **Comprehensive validation** using Joi schemas
- 🗄️ **MongoDB integration** with Mongoose ODM
- 📝 **Detailed logging** with Morgan
- 🛡️ **Error handling** with global error handler and custom ApiError
- 🔄 **Consistent API responses** with ApiResponse utility
- 📊 **Book statistics and analytics**
- 🎯 **RESTful endpoints** following best practices

## Quick Start

### Prerequisites

- Node.js (>= 16.0.0)
- MongoDB (>= 4.4)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookstore-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bookstore
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CORS_ORIGIN=*
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   
   **Development mode:**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

6. **Test the API**
   ```bash
   curl http://localhost:5000/ping
   ```

## API Documentation

### Interactive API Documentation
🚀 **Swagger UI** - Complete interactive API documentation is available at:
```
http://localhost:5000/api-docs
```

The Swagger documentation provides:
- **Interactive Testing**: Test all endpoints directly from the browser
- **Request/Response Examples**: See sample requests and responses for each endpoint
- **Schema Definitions**: Complete data models and validation rules
- **Parameter Documentation**: Detailed information about all query parameters, path parameters, and request bodies
- **Response Codes**: All possible HTTP status codes and their meanings

### Base URL
```
http://localhost:5000/api
```

### Authentication
Currently, the API does not require authentication. All endpoints are public.

### API Endpoints

#### Health & Info
- `GET /ping` - Simple health check
- `GET /api` - API information
- `GET /api/health` - Detailed health check
- `GET /api/books/health` - Books service health check

#### Books Management

##### Get Books
- `GET /api/books` - Get all books with filtering, searching, and pagination
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/isbn/:isbn` - Get book by ISBN
- `GET /api/books/genre/:genre` - Get books by genre
- `GET /api/books/author/:author` - Get books by author
- `GET /api/books/search?q=term` - Search books
- `GET /api/books/count` - Get total book count
- `GET /api/books/stats` - Get book statistics

##### Create/Update Books
- `POST /api/books` - Create a new book
- `PUT /api/books/:id` - Update book (complete update)
- `PATCH /api/books/:id` - Update book (partial update)
- `PATCH /api/books/:id/stock` - Update book stock

##### Delete Books
- `DELETE /api/books/:id` - Delete book (soft delete - changes status to 'discontinued')
- `DELETE /api/books/:id/permanent` - Permanently delete book

#### Query Parameters for GET /api/books

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number (default: 1) | `?page=2` |
| `limit` | Items per page (default: 10, max: 100) | `?limit=20` |
| `search` | Search in title, author, description | `?search=javascript` |
| `genre` | Filter by genre | `?genre=Fiction` |
| `author` | Filter by author | `?author=John Doe` |
| `publishedYear` | Filter by exact year | `?publishedYear=2023` |
| `publishedYear_gte` | Filter by year (from) | `?publishedYear_gte=2020` |
| `publishedYear_lte` | Filter by year (to) | `?publishedYear_lte=2023` |
| `price_gte` | Filter by minimum price | `?price_gte=10` |
| `price_lte` | Filter by maximum price | `?price_lte=50` |
| `status` | Filter by status (active, inactive, discontinued) | `?status=active` |
| `sort` | Sort fields (prefix with - for desc) | `?sort=-createdAt,title` |

##### Sorting Options
- `title` - Sort by title
- `author` - Sort by author
- `genre` - Sort by genre
- `publishedYear` - Sort by published year
- `price` - Sort by price
- `createdAt` - Sort by creation date
- `updatedAt` - Sort by last update

### Book Schema

```json
{
  "title": "string (required, 1-200 chars)",
  "author": "string (required, 1-100 chars)",
  "genre": "string (required, from predefined list)",
  "publishedYear": "number (required, 1000-current year+1)",
  "isbn": "string (required, unique, ISBN-10 or ISBN-13)",
  "description": "string (optional, max 2000 chars)",
  "price": "number (optional, >= 0, default: 0)",
  "stock": "number (optional, >= 0, default: 0)",
  "status": "string (optional, active|inactive|discontinued, default: active)",
  "createdAt": "datetime (auto-generated)",
  "updatedAt": "datetime (auto-generated)"
}
```

#### Valid Genres
- Fiction
- Non-Fiction
- Mystery
- Romance
- Science Fiction
- Fantasy
- Biography
- History
- Self-Help
- Business
- Children
- Young Adult
- Poetry
- Drama
- Horror
- Thriller
- Comedy
- Adventure
- Other

### Example Requests

#### Create a Book
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Fiction",
    "publishedYear": 1925,
    "isbn": "9780743273565",
    "description": "A classic American novel set in the Jazz Age",
    "price": 12.99,
    "stock": 100
  }'
```

#### Get Books with Filters
```bash
curl "http://localhost:5000/api/books?genre=Fiction&publishedYear_gte=1900&sort=-publishedYear&page=1&limit=10"
```

#### Search Books
```bash
curl "http://localhost:5000/api/books?search=gatsby&sort=title"
```

#### Update Book Stock
```bash
curl -X PATCH http://localhost:5000/api/books/507f1f77bcf86cd799439011/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": -5}'
```

### Response Format

All API responses follow a consistent format:

#### Success Response
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "meta": {
    "appliedFilters": {...},
    "appliedSort": {...}
  },
  "timestamp": "2023-12-12T10:30:00.000Z"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2023-12-12T10:30:00.000Z"
}
```

## Project Structure

```
bookstore-api/
├── src/
│   ├── config/
│   │   ├── config.js          # Application configuration
│   │   └── database.js        # Database connection setup
│   ├── controllers/
│   │   └── bookController.js  # Book route handlers
│   ├── middlewares/
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── security.js        # Security middlewares
│   │   └── validation.js      # Input validation schemas
│   ├── models/
│   │   └── Book.js           # Book Mongoose model
│   ├── routes/
│   │   ├── bookRoutes.js     # Book API routes
│   │   └── index.js          # General API routes
│   ├── services/
│   │   └── bookService.js    # Business logic for books
│   ├── utils/
│   │   ├── ApiError.js       # Custom error class
│   │   ├── ApiResponse.js    # Response formatting utility
│   │   └── helpers.js        # Helper functions
│   └── app.js                # Express app setup
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies
├── README.md               # This file
└── server.js               # Application entry point
```

## Security Features

- **Helmet**: Security headers protection
- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Joi schema validation
- **Input Sanitization**: NoSQL injection prevention
- **Error Handling**: Secure error responses
- **Request Timeout**: Prevent hanging requests

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (if implemented)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix

### Code Style

The project follows these conventions:
- ES6+ JavaScript features
- Async/await for asynchronous operations
- Modular architecture with clear separation of concerns
- Comprehensive error handling
- Input validation on all endpoints
- Consistent naming conventions

### Adding New Features

1. **Models**: Add new Mongoose models in `src/models/`
2. **Services**: Add business logic in `src/services/`
3. **Controllers**: Add route handlers in `src/controllers/`
4. **Routes**: Define new routes in `src/routes/`
5. **Validation**: Add Joi schemas in `src/middlewares/validation.js`

## Production Deployment

### Environment Variables

Set the following environment variables for production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://username:password@host:port/database
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://yourdomain.com
```

### Performance Tips

- Use MongoDB indexes for better query performance
- Enable compression for responses
- Use process managers like PM2 for production
- Implement caching for frequently accessed data
- Monitor application performance and errors
- Use load balancing for high traffic

### Monitoring

The API provides several endpoints for monitoring:
- `/ping` - Basic health check
- `/api/health` - Detailed health information
- `/api/books/health` - Service-specific health check
- `/api/books/stats` - Application statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: contact@bookstore-api.com
- Documentation: https://api-docs.bookstore-api.com
- Issues: https://github.com/your-repo/bookstore-api/issues

## Changelog

### Version 1.0.0 (2023-12-12)
- Initial release
- Complete CRUD operations for books
- Advanced search and filtering
- Security middlewares
- Production-ready architecture
- Comprehensive documentation