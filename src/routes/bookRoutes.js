const express = require('express');
const bookController = require('../controllers/bookController');
const { validate, bookSchemas } = require('../middlewares/validation');
const { standardRateLimiter, strictRateLimiter } = require('../middlewares/security');

const router = express.Router();

// Rate limiting is now applied per route - standard for GET, strict for write operations

// GET routes
/**
 * @swagger
 * /api/books/stats:
 *   get:
 *     summary: Get Book Statistics
 *     description: Retrieve comprehensive statistics about the book collection
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                         totalBooks:
 *                           type: integer
 *                           example: 1250
 *                         averagePrice:
 *                           type: number
 *                           example: 24.99
 *                         averageRating:
 *                           type: number
 *                           example: 4.2
 *                         genreDistribution:
 *                           type: object
 *                           example: { "Fiction": 450, "Science": 200 }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/stats', bookController.getBookStats);

/**
 * @swagger
 * /api/books/count:
 *   get:
 *     summary: Get Total Book Count
 *     description: Get the total number of books in the collection
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Count retrieved successfully
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
 *                         count:
 *                           type: integer
 *                           example: 1250
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/count', standardRateLimiter, bookController.getBookCount);

/**
 * @swagger
 * /api/books/health:
 *   get:
 *     summary: Books Service Health Check
 *     description: Check the health status of the books service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health status
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
 *                         service:
 *                           type: string
 *                           example: "books"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/health', standardRateLimiter, bookController.healthCheck);

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search Books
 *     description: Search for books using various criteria with pagination and sorting
 *     tags: [Books]
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Search term to find in title, author, or description
 *         schema:
 *           type: string
 *         example: "gatsby"
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/sortParam'
 *       - name: genre
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - name: author
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *     responses:
 *       200:
 *         description: Books found successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     pagination:
 *                       $ref: '#/components/schemas/ApiResponse/properties/pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/search',
  standardRateLimiter,
  validate(bookSchemas.getBooks, 'query'),
  bookController.searchBooks
);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get All Books
 *     description: Retrieve all books with advanced filtering, searching, sorting, and pagination
 *     tags: [Books]
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/sortParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - name: genre
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by genre
 *         example: "Fiction"
 *       - name: author
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by author name
 *         example: "fitzgerald"
 *       - name: publishedYear
 *         in: query
 *         schema:
 *           type: integer
 *         description: Filter by publication year
 *         example: 1925
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *         example: 10.00
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *         example: 50.00
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [active, inactive, discontinued]
 *         description: Filter by book status
 *         example: "active"
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     pagination:
 *                       $ref: '#/components/schemas/ApiResponse/properties/pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/',
  standardRateLimiter,
  validate(bookSchemas.getBooks, 'query'),
  bookController.getAllBooks
);

/**
 * @swagger
 * /api/books/genre/{genre}:
 *   get:
 *     summary: Get Books by Genre
 *     description: Retrieve all books belonging to a specific genre
 *     tags: [Books]
 *     parameters:
 *       - name: genre
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The genre to filter by
 *         example: "Fiction"
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/sortParam'
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/genre/:genre',
  standardRateLimiter,
  validate(bookSchemas.getBooks, 'query'),
  bookController.getBooksByGenre
);

/**
 * @swagger
 * /api/books/author/{author}:
 *   get:
 *     summary: Get Books by Author
 *     description: Retrieve all books by a specific author (supports partial matching)
 *     tags: [Books]
 *     parameters:
 *       - name: author
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Author name or partial author name
 *         example: "fitzgerald"
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/sortParam'
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/author/:author',
  standardRateLimiter,
  validate(bookSchemas.getBooks, 'query'),
  bookController.getBooksByAuthor
);

/**
 * @swagger
 * /api/books/isbn/{isbn}:
 *   get:
 *     summary: Get Book by ISBN
 *     description: Retrieve a specific book using its ISBN number
 *     tags: [Books]
 *     parameters:
 *       - name: isbn
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^(978|979)[0-9]{10}$'
 *         description: 13-digit ISBN number
 *         example: "9780743273565"
 *     responses:
 *       200:
 *         description: Book found successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Book'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/isbn/:isbn', standardRateLimiter, bookController.getBookByIsbn);

/**
 * @swagger
 * /api/books/isbn/{isbn}:
 *   head:
 *     summary: Check if Book Exists by ISBN
 *     description: Check whether a book with the given ISBN exists without returning the full data
 *     tags: [Books]
 *     parameters:
 *       - name: isbn
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^(978|979)[0-9]{10}$'
 *         description: 13-digit ISBN number
 *         example: "9780743273565"
 *     responses:
 *       200:
 *         description: Book exists
 *       404:
 *         description: Book not found
 *       400:
 *         description: Invalid ISBN format
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.head('/isbn/:isbn', bookController.checkBookExists);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get Book by ID
 *     description: Retrieve a specific book using its MongoDB ObjectId
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the book
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Book'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id',
  standardRateLimiter,
  validate(bookSchemas.bookId, 'params'),
  bookController.getBookById
);

// POST routes
/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create New Book
 *     description: Add a new book to the collection
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookRequest'
 *           example:
 *             title: "The Great Gatsby"
 *             author: "F. Scott Fitzgerald"
 *             isbn: "9780743273565"
 *             description: "A classic American novel set in the Jazz Age"
 *             publicationDate: "1925-04-10"
 *             genre: ["Fiction", "Classic"]
 *             price: 12.99
 *             stock: 50
 *             language: "English"
 *             pageCount: 180
 *             tags: ["classic", "american literature"]
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Book with this ISBN already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/',
  strictRateLimiter,
  validate(bookSchemas.createBook, 'body'),
  bookController.createBook
);

// PUT routes (complete update)
/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update Book (Complete Update)
 *     description: Completely update an existing book with new data
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the book
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookRequest'
 *           example:
 *             title: "The Great Gatsby - Updated Edition"
 *             author: "F. Scott Fitzgerald"
 *             description: "Updated description of the classic novel"
 *             genre: ["Fiction", "Classic", "Literature"]
 *             price: 14.99
 *             stock: 75
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id',
  strictRateLimiter,
  validate(bookSchemas.bookId, 'params'),
  validate(bookSchemas.updateBook, 'body'),
  bookController.updateBook
);

// PATCH routes (partial update)
/**
 * @swagger
 * /api/books/{id}:
 *   patch:
 *     summary: Partially Update Book
 *     description: Update specific fields of an existing book
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the book
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookRequest'
 *           example:
 *             price: 15.99
 *             stock: 100
 *             tags: ["classic", "literature", "bestseller"]
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id',
  strictRateLimiter,
  validate(bookSchemas.bookId, 'params'),
  validate(bookSchemas.updateBook, 'body'),
  bookController.patchBook
);

/**
 * @swagger
 * /api/books/{id}/stock:
 *   patch:
 *     summary: Update Book Stock
 *     description: Add or subtract from the current stock quantity of a book
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the book
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Number to add (positive) or subtract (negative) from current stock
 *                 example: 25
 *           example:
 *             quantity: 25
 *     responses:
 *       200:
 *         description: Stock updated successfully
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
 *                         previousStock:
 *                           type: integer
 *                           example: 50
 *                         newStock:
 *                           type: integer
 *                           example: 75
 *                         book:
 *                           $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/stock',
  strictRateLimiter,
  validate(bookSchemas.bookId, 'params'),
  validate(
    require('joi').object({
      quantity: require('joi').number()
        .integer()
        .required()
        .messages({
          'number.base': 'Quantity must be a number',
          'number.integer': 'Quantity must be an integer',
          'any.required': 'Quantity is required',
        })
    }),
    'body'
  ),
  bookController.updateStock
);

// DELETE routes
/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete Book (Soft Delete)
 *     description: Soft delete a book by changing its status to discontinued
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the book
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Book deleted successfully (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Book'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id',
  strictRateLimiter,
  validate(bookSchemas.bookId, 'params'),
  bookController.deleteBook
);

/**
 * @swagger
 * /api/books/{id}/permanent:
 *   delete:
 *     summary: Permanently Delete Book
 *     description: Permanently remove a book from the database (hard delete)
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the book
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Book permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Book permanently deleted"
 *               data: null
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id/permanent',
  strictRateLimiter,
  validate(bookSchemas.bookId, 'params'),
  bookController.permanentlyDeleteBook
);

module.exports = router;