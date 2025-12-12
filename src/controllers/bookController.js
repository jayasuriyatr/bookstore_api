const bookService = require('../services/bookService');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

class BookController {
  getAllBooks = asyncHandler(async (req, res) => {
    const result = await bookService.getAllBooks(req.query);

    const response = ApiResponse.success(
      result.books,
      'Books retrieved successfully'
    ).withPagination(result.pagination);

    if (Object.keys(result.filters).length > 0) {
      response.withMeta({
        appliedFilters: result.filters,
        appliedSort: result.sort,
      });
    }

    response.send(res);
  });

  getBookById = asyncHandler(async (req, res) => {
    const book = await bookService.getBookById(req.params.id);

    ApiResponse.success(
      book,
      'Book retrieved successfully'
    ).send(res);
  });

  getBookByIsbn = asyncHandler(async (req, res) => {
    const book = await bookService.getBookByIsbn(req.params.isbn);

    ApiResponse.success(
      book,
      'Book retrieved successfully'
    ).send(res);
  });

  createBook = asyncHandler(async (req, res) => {
    const book = await bookService.createBook(req.body);

    ApiResponse.created(
      book,
      'Book created successfully'
    ).send(res);
  });

  updateBook = asyncHandler(async (req, res) => {
    const book = await bookService.updateBook(req.params.id, req.body);

    ApiResponse.updated(
      book,
      'Book updated successfully'
    ).send(res);
  });

  patchBook = asyncHandler(async (req, res) => {
    const book = await bookService.updateBook(req.params.id, req.body);

    ApiResponse.updated(
      book,
      'Book updated successfully'
    ).send(res);
  });

  deleteBook = asyncHandler(async (req, res) => {
    await bookService.deleteBook(req.params.id);

    ApiResponse.deleted(
      'Book deleted successfully'
    ).send(res);
  });

  permanentlyDeleteBook = asyncHandler(async (req, res) => {
    const result = await bookService.permanentlyDeleteBook(req.params.id);

    ApiResponse.deleted(
      result.message
    ).withMeta({
      deletedBook: {
        id: result.deletedBook._id,
        title: result.deletedBook.title,
        author: result.deletedBook.author,
      }
    }).send(res);
  });

  getBooksByGenre = asyncHandler(async (req, res) => {
    const result = await bookService.getBooksByGenre(req.params.genre, req.query);

    const response = ApiResponse.success(
      result.books,
      `Books in ${req.params.genre} genre retrieved successfully`
    ).withPagination(result.pagination);

    response.withMeta({
      genre: result.genre,
    });

    response.send(res);
  });

  getBooksByAuthor = asyncHandler(async (req, res) => {
    const result = await bookService.getBooksByAuthor(req.params.author, req.query);

    const response = ApiResponse.success(
      result.books,
      `Books by ${req.params.author} retrieved successfully`
    ).withPagination(result.pagination);

    response.withMeta({
      author: result.author,
    });

    response.send(res);
  });

  updateStock = asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    if (typeof quantity !== 'number') {
      return res.status(400).json(
        new ApiResponse(400, null, 'Quantity must be a number')
      );
    }

    const book = await bookService.updateStock(req.params.id, quantity);

    ApiResponse.updated(
      book,
      `Stock updated successfully. New stock: ${book.stock}`
    ).send(res);
  });

  getBookStats = asyncHandler(async (req, res) => {
    const stats = await bookService.getBookStats();

    ApiResponse.success(
      stats,
      'Book statistics retrieved successfully'
    ).send(res);
  });

  searchBooks = asyncHandler(async (req, res) => {
    if (!req.query.q) {
      return res.status(400).json(
        new ApiResponse(400, null, 'Search query parameter "q" is required')
      );
    }

    // Map search parameter to the expected format
    const searchQuery = { ...req.query, search: req.query.q };
    delete searchQuery.q;

    const result = await bookService.getAllBooks(searchQuery);

    const response = ApiResponse.success(
      result.books,
      `Search results for "${req.query.q}"`
    ).withPagination(result.pagination);

    response.withMeta({
      searchTerm: req.query.q,
      appliedFilters: result.filters,
      appliedSort: result.sort,
    });

    response.send(res);
  });

  checkBookExists = asyncHandler(async (req, res) => {
    try {
      await bookService.getBookByIsbn(req.params.isbn);
      // Book exists
      res.status(200).end();
    } catch (error) {
      if (error.statusCode === 404) {
        // Book doesn't exist
        res.status(404).end();
      } else {
        throw error;
      }
    }
  });

  getBookCount = asyncHandler(async (req, res) => {
    const result = await bookService.getAllBooks({ limit: 1 }); // Just get pagination info

    ApiResponse.success(
      {
        total: result.pagination.totalItems,
        active: result.pagination.totalItems, // Since we filter by active by default
      },
      'Book count retrieved successfully'
    ).send(res);
  });

  healthCheck = asyncHandler(async (req, res) => {
    // Try to count books to verify database connection
    const result = await bookService.getAllBooks({ limit: 1 });

    ApiResponse.success(
      {
        service: 'Books API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        totalBooks: result.pagination.totalItems,
      },
      'Books service is healthy'
    ).send(res);
  });
}

module.exports = new BookController();