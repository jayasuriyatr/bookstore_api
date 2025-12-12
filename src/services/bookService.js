const Book = require('../models/Book');
const ApiError = require('../utils/ApiError');
const { calculatePagination, parseSort, parseFilters, buildSearchQuery } = require('../utils/helpers');

class BookService {
  /**
   * Get all books with advanced filtering, searching, sorting, and pagination
   * @param {object} queryParams - Query parameters from request
   * @returns {Promise<object>} Books with pagination metadata
   */
  async getAllBooks(queryParams = {}) {
    try {
      const {
        page,
        limit,
        sort,
        search,
        ...filterParams
      } = queryParams;

      // Build filter object
      const allowedFilters = ['genre', 'author', 'status', 'publishedYear', 'price'];
      const filters = parseFilters(filterParams, allowedFilters);

      // Add status filter to only show active books by default if no status filter provided
      if (!filters.status) {
        filters.status = 'active';
      }

      // Build search query
      const searchQuery = buildSearchQuery(search);

      // Combine filters and search query
      const query = { ...filters, ...searchQuery };

      // Build sort object
      const allowedSortFields = ['title', 'author', 'genre', 'publishedYear', 'price', 'createdAt', 'updatedAt'];
      const sortObj = parseSort(sort, allowedSortFields);

      // Get total count for pagination
      const totalBooks = await Book.countDocuments(query);

      // Calculate pagination
      const pagination = calculatePagination(page, limit, totalBooks);

      // Fetch books with pagination
      const books = await Book.find(query)
        .sort(sortObj)
        .skip(pagination.skip)
        .limit(pagination.itemsPerPage)
        .lean(); // Use lean() for better performance as we don't need mongoose document methods

      return {
        books,
        pagination,
        filters: query,
        sort: sortObj,
      };
    } catch (error) {
      throw new ApiError(500, `Error fetching books: ${error.message}`);
    }
  }

  /**
   * Get a single book by ID
   * @param {string} bookId - Book ID
   * @returns {Promise<object>} Book object
   */
  async getBookById(bookId) {
    try {
      const book = await Book.findById(bookId);
      
      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      return book;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'CastError') {
        throw ApiError.badRequest('Invalid book ID format');
      }
      
      throw new ApiError(500, `Error fetching book: ${error.message}`);
    }
  }

  /**
   * Get a single book by ISBN
   * @param {string} isbn - Book ISBN
   * @returns {Promise<object>} Book object
   */
  async getBookByIsbn(isbn) {
    try {
      const cleanIsbn = isbn.replace(/[-\s]/g, '');
      const book = await Book.findOne({ isbn: cleanIsbn });
      
      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      return book;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(500, `Error fetching book: ${error.message}`);
    }
  }

  /**
   * Create a new book
   * @param {object} bookData - Book data
   * @returns {Promise<object>} Created book
   */
  async createBook(bookData) {
    try {
      // Check if book with same ISBN already exists
      const existingBook = await Book.findOne({ isbn: bookData.isbn.replace(/[-\s]/g, '') });
      
      if (existingBook) {
        throw ApiError.conflict('A book with this ISBN already exists');
      }

      const book = new Book(bookData);
      const savedBook = await book.save();
      
      return savedBook;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        throw ApiError.validationError(validationErrors.join(', '));
      }
      
      if (error.code === 11000) {
        throw ApiError.conflict('A book with this ISBN already exists');
      }
      
      throw new ApiError(500, `Error creating book: ${error.message}`);
    }
  }

  /**
   * Update a book by ID
   * @param {string} bookId - Book ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object>} Updated book
   */
  async updateBook(bookId, updateData) {
    try {
      // If ISBN is being updated, check for duplicates
      if (updateData.isbn) {
        const cleanIsbn = updateData.isbn.replace(/[-\s]/g, '');
        const existingBook = await Book.findOne({ 
          isbn: cleanIsbn,
          _id: { $ne: bookId } // Exclude current book from check
        });
        
        if (existingBook) {
          throw ApiError.conflict('A book with this ISBN already exists');
        }
      }

      const book = await Book.findByIdAndUpdate(
        bookId,
        updateData,
        { 
          new: true, // Return updated document
          runValidators: true, // Run model validators
          context: 'query' // For proper validation context
        }
      );
      
      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      return book;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'CastError') {
        throw ApiError.badRequest('Invalid book ID format');
      }
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        throw ApiError.validationError(validationErrors.join(', '));
      }
      
      if (error.code === 11000) {
        throw ApiError.conflict('A book with this ISBN already exists');
      }
      
      throw new ApiError(500, `Error updating book: ${error.message}`);
    }
  }

  /**
   * Delete a book by ID (soft delete - change status to discontinued)
   * @param {string} bookId - Book ID
   * @returns {Promise<object>} Deleted book
   */
  async deleteBook(bookId) {
    try {
      const book = await Book.findByIdAndUpdate(
        bookId,
        { status: 'discontinued' },
        { new: true }
      );
      
      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      return book;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'CastError') {
        throw ApiError.badRequest('Invalid book ID format');
      }
      
      throw new ApiError(500, `Error deleting book: ${error.message}`);
    }
  }

  /**
   * Permanently delete a book by ID (hard delete)
   * @param {string} bookId - Book ID
   * @returns {Promise<object>} Deletion confirmation
   */
  async permanentlyDeleteBook(bookId) {
    try {
      const book = await Book.findByIdAndDelete(bookId);
      
      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      return { 
        message: 'Book permanently deleted',
        deletedBook: book 
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'CastError') {
        throw ApiError.badRequest('Invalid book ID format');
      }
      
      throw new ApiError(500, `Error permanently deleting book: ${error.message}`);
    }
  }

  /**
   * Get books by genre
   * @param {string} genre - Genre to filter by
   * @param {object} queryParams - Additional query parameters
   * @returns {Promise<object>} Books in the specified genre
   */
  async getBooksByGenre(genre, queryParams = {}) {
    try {
      const booksQuery = { genre, status: 'active', ...buildSearchQuery(queryParams.search) };
      
      // Calculate pagination
      const totalBooks = await Book.countDocuments(booksQuery);
      const pagination = calculatePagination(queryParams.page, queryParams.limit, totalBooks);
      
      // Build sort object
      const allowedSortFields = ['title', 'author', 'publishedYear', 'price', 'createdAt'];
      const sortObj = parseSort(queryParams.sort, allowedSortFields);

      const books = await Book.find(booksQuery)
        .sort(sortObj)
        .skip(pagination.skip)
        .limit(pagination.itemsPerPage)
        .lean();

      return {
        books,
        pagination,
        genre,
      };
    } catch (error) {
      throw new ApiError(500, `Error fetching books by genre: ${error.message}`);
    }
  }

  /**
   * Get books by author
   * @param {string} author - Author name (partial match)
   * @param {object} queryParams - Additional query parameters
   * @returns {Promise<object>} Books by the specified author
   */
  async getBooksByAuthor(author, queryParams = {}) {
    try {
      const booksQuery = {
        author: { $regex: author, $options: 'i' },
        status: 'active',
        ...buildSearchQuery(queryParams.search)
      };
      
      // Calculate pagination
      const totalBooks = await Book.countDocuments(booksQuery);
      const pagination = calculatePagination(queryParams.page, queryParams.limit, totalBooks);
      
      // Build sort object
      const allowedSortFields = ['title', 'genre', 'publishedYear', 'price', 'createdAt'];
      const sortObj = parseSort(queryParams.sort, allowedSortFields);

      const books = await Book.find(booksQuery)
        .sort(sortObj)
        .skip(pagination.skip)
        .limit(pagination.itemsPerPage)
        .lean();

      return {
        books,
        pagination,
        author,
      };
    } catch (error) {
      throw new ApiError(500, `Error fetching books by author: ${error.message}`);
    }
  }

  /**
   * Update book stock
   * @param {string} bookId - Book ID
   * @param {number} quantity - Quantity to add/subtract
   * @returns {Promise<object>} Updated book
   */
  async updateStock(bookId, quantity) {
    try {
      const book = await Book.findById(bookId);
      
      if (!book) {
        throw ApiError.notFound('Book not found');
      }

      const newStock = book.stock + quantity;
      
      if (newStock < 0) {
        throw ApiError.badRequest('Insufficient stock');
      }

      book.stock = newStock;
      await book.save();

      return book;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'CastError') {
        throw ApiError.badRequest('Invalid book ID format');
      }
      
      throw new ApiError(500, `Error updating stock: ${error.message}`);
    }
  }

  /**
   * Get book statistics
   * @returns {Promise<object>} Book statistics
   */
  async getBookStats() {
    try {
      const stats = await Book.aggregate([
        {
          $group: {
            _id: null,
            totalBooks: { $sum: 1 },
            activeBooks: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
            avgPrice: { $avg: '$price' },
            totalStock: { $sum: '$stock' },
          }
        }
      ]);

      const genreStats = await Book.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const yearStats = await Book.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$publishedYear', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 10 }
      ]);

      return {
        overview: stats[0] || {
          totalBooks: 0,
          activeBooks: 0,
          totalValue: 0,
          avgPrice: 0,
          totalStock: 0,
        },
        genreDistribution: genreStats,
        yearDistribution: yearStats,
      };
    } catch (error) {
      throw new ApiError(500, `Error fetching book statistics: ${error.message}`);
    }
  }
}

module.exports = new BookService();