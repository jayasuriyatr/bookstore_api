# Bookstore API

A RESTful API for managing a bookstore built with Express.js and MongoDB. This system provides comprehensive book management capabilities with JWT authentication, role-based access control, and advanced search functionality.

## Features

- Complete CRUD operations for book management
- JWT-based authentication and authorization
- Role-based access control (Admin/User)
- Advanced search and filtering with pagination
- Input validation using Joi schemas
- MongoDB integration with Mongoose ODM
- Request rate limiting and security middlewares
- Comprehensive error handling
- API documentation with Swagger
- Statistics and analytics endpoints

## Installation

### Prerequisites

- Node.js (>= 16.0.0)
- MongoDB (>= 4.4)
- pnpm (recommended) or npm

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd bookstore-api
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bookstore

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB**
   Ensure MongoDB is running on your system.

5. **Run the application**

   Development mode:

   ```bash
   pnpm dev
   ```

   Production mode:

   ```bash
   pnpm start
   ```

6. **Verify installation**
   ```bash
   curl http://localhost:5000/ping
   ```

## API Documentation

### Interactive Documentation

Complete interactive API documentation is available at:

```
http://localhost:5000/api-docs
```

### Base URL

```
http://localhost:5000/api
```

### Authentication

The API uses JWT (JSON Web Token) based authentication with role-based access control.

#### Authentication Flow

1. Register a new user or login with existing credentials
2. Receive JWT access token and refresh token
3. Include access token in Authorization header for protected endpoints
4. Use refresh token to obtain new access tokens when they expire

#### Token Types

- **Access Token**: Short-lived (7 days), used for API requests
- **Refresh Token**: Long-lived (30 days), used to refresh access tokens

#### Authorization Header Format

```
Authorization: Bearer <access_token>
```

#### User Roles

- **User**: Can read books and manage own profile
- **Admin**: Full access to all operations including book management

### API Endpoints

#### Health & Info

- `GET /ping` - Simple health check
- `GET /api` - API information
- `GET /api/health` - Detailed health check

#### Authentication (Public)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

#### User Management (Authenticated)

- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change user password

#### Admin Only

- `GET /api/auth/users` - Get all users (Admin only)

#### Books (Public Read, Admin Write)

##### Read Operations (Public)

- `GET /api/books` - Get all books with filtering, searching, and pagination
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/isbn/:isbn` - Get book by ISBN
- `GET /api/books/genre/:genre` - Get books by genre
- `GET /api/books/author/:author` - Get books by author
- `GET /api/books/stats` - Get book statistics

##### Write Operations (Admin Only)

- `POST /api/books` - Create a new book
- `PUT /api/books/:id` - Update book (complete update)
- `PATCH /api/books/:id` - Update book (partial update)
- `PATCH /api/books/:id/stock` - Update book stock
- `DELETE /api/books/:id` - Delete book (soft delete)
- `DELETE /api/books/:id/permanent` - Permanently delete book

#### Query Parameters for GET /api/books

| Parameter           | Description                                       | Example                   |
| ------------------- | ------------------------------------------------- | ------------------------- |
| `page`              | Page number (default: 1)                          | `?page=2`                 |
| `limit`             | Items per page (default: 10, max: 100)            | `?limit=20`               |
| `search`            | Search in title, author, description              | `?search=javascript`      |
| `genre`             | Filter by genre                                   | `?genre=Fiction`          |
| `author`            | Filter by author                                  | `?author=John Doe`        |
| `publishedYear`     | Filter by exact year                              | `?publishedYear=2023`     |
| `publishedYear_gte` | Filter by year (from)                             | `?publishedYear_gte=2020` |
| `publishedYear_lte` | Filter by year (to)                               | `?publishedYear_lte=2023` |
| `price_gte`         | Filter by minimum price                           | `?price_gte=10`           |
| `price_lte`         | Filter by maximum price                           | `?price_lte=50`           |
| `status`            | Filter by status (active, inactive, discontinued) | `?status=active`          |
| `sort`              | Sort fields (prefix with - for desc)              | `?sort=-createdAt,title`  |

##### Sorting Options

- `title` - Sort by title
- `author` - Sort by author
- `genre` - Sort by genre
- `publishedYear` - Sort by published year
- `price` - Sort by price
- `createdAt` - Sort by creation date
- `updatedAt` - Sort by last update

### Data Schemas

#### User Schema

```json
{
  "username": "string (required, 3-50 chars, alphanumeric)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 chars)",
  "role": "string (user|admin, default: user)",
  "isActive": "boolean (default: true)",
  "lastLogin": "datetime",
  "createdAt": "datetime (auto-generated)",
  "updatedAt": "datetime (auto-generated)"
}
```

#### Book Schema

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

#### Authentication Examples

##### Register New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

##### User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

##### Get User Profile

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

#### Book Management Examples

##### Create a Book (Admin Only)

```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_access_token>" \
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

##### Get Books with Filters (Public)

```bash
curl "http://localhost:5000/api/books?genre=Fiction&publishedYear_gte=1900&sort=-publishedYear&page=1&limit=10"
```

##### Search Books (Public)

```bash
curl "http://localhost:5000/api/books?search=gatsby&sort=title"
```

##### Update Book Stock (Admin Only)

```bash
curl -X PATCH http://localhost:5000/api/books/507f1f77bcf86cd799439011/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_access_token>" \
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
│   │   ├── database.js        # Database connection setup
│   │   └── swagger.js         # API documentation config
│   ├── controllers/
│   │   ├── authController.js  # Authentication handlers
│   │   └── bookController.js  # Book route handlers
│   ├── middlewares/
│   │   ├── auth.js           # JWT authentication middleware
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── security.js        # Security middlewares
│   │   └── validation.js      # Input validation schemas
│   ├── models/
│   │   ├── Book.js           # Book Mongoose model
│   │   └── User.js           # User Mongoose model
│   ├── routes/
│   │   ├── authRoutes.js     # Authentication routes
│   │   ├── bookRoutes.js     # Book API routes
│   │   └── index.js          # General API routes
│   ├── services/
│   │   └── bookService.js    # Business logic for books
│   ├── utils/
│   │   ├── ApiError.js       # Custom error class
│   │   ├── ApiResponse.js    # Response formatting utility
│   │   ├── helpers.js        # Helper functions
│   │   └── jwt.js            # JWT utility functions
│   └── app.js                # Express app setup
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies
├── README.md               # Documentation
└── server.js               # Application entry point
```

## Security Implementation

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **Role-Based Access**: User and Admin role differentiation
- **Token Expiration**: Configurable access and refresh token lifespans

### Request Security

- **Rate Limiting**: Different limits for read (100/15min) and write operations (5/15min)
- **Helmet**: Security headers including CSP, HSTS, XSS protection
- **CORS**: Cross-Origin Resource Sharing with configurable origins
- **Input Validation**: Joi schema validation on all inputs
- **Input Sanitization**: NoSQL injection prevention
- **Request Timeout**: 30-second timeout to prevent hanging requests

### Data Protection

- **Password Exclusion**: Passwords never returned in API responses
- **Token Validation**: Signature, expiry, and audience verification
- **Error Sanitization**: Stack traces hidden in production
- **Request Size Limits**: 1MB limit on request payloads

## Development

### Available Scripts

- `pnpm start` - Start server
- `pnpm dev` - Start development server with nodemon
- `pnpm test` - Run tests (if implemented)

### Code Architecture

The application follows a modular architecture with clear separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data operations
- **Models**: Define data structures and validation rules
- **Middlewares**: Handle cross-cutting concerns (auth, validation, security)
- **Routes**: Define API endpoints and their handlers
- **Utils**: Contain helper functions and utilities

### Development Guidelines

- Use async/await for asynchronous operations
- Implement comprehensive error handling
- Validate all inputs using Joi schemas
- Follow RESTful API conventions
- Maintain consistent response formats
- Write self-documenting code with clear naming

## Deployment

### Environment Variables

Required environment variables for different environments:

**Development:**

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=dev-secret-key
```

**Production:**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://username:password@cluster.mongodb.net/bookstore
JWT_SECRET=your-strong-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deployment Considerations

- Use strong JWT secrets in production
- Configure proper CORS origins
- Set up MongoDB with authentication
- Implement proper logging and monitoring
- Use HTTPS for all communications
- Consider using a reverse proxy (nginx)
- Implement proper backup strategies

## API Rate Limits

| Endpoint Type            | Rate Limit   | Window     |
| ------------------------ | ------------ | ---------- |
| Authentication endpoints | 5 requests   | 15 minutes |
| Read operations          | 100 requests | 15 minutes |
| Write operations (Admin) | 5 requests   | 15 minutes |

## Error Handling

The API returns consistent error responses with appropriate HTTP status codes:

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-12-12T10:30:00.000Z"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Testing

### Manual Testing

Use the provided curl examples or tools like Postman to test the API endpoints.

### Automated Testing

The project structure supports adding automated tests using Jest or similar testing frameworks.

## Monitoring

Health check endpoints for monitoring system status:

- `GET /ping` - Basic connectivity check
- `GET /api/health` - Detailed system health
- `GET /api/books/stats` - Application statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Submit a pull request with a clear description

## License

This project is available under the MIT License.

## Version History

### Version 1.0.0

- Initial implementation
- Book management CRUD operations
- JWT authentication system
- Role-based authorization
- Rate limiting and security features
- Comprehensive API documentation
