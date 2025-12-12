const Joi = require('joi');
const ApiError = require('../utils/ApiError');

/**
 * Validation middleware factory
 * @param {object} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'query', 'params')
 * @returns {function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Include all errors
      allowUnknown: false, // Disallow unknown fields
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      return next(ApiError.validationError(errorMessage));
    }

    // Replace the original data with validated data (stripped of unknown fields)
    req[property] = value;
    next();
  };
};

// Book validation schemas
const bookSchemas = {
  // Create book validation
  createBook: Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Title is required',
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
        'any.required': 'Title is required',
      }),
    
    author: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Author is required',
        'string.min': 'Author cannot be empty',
        'string.max': 'Author cannot exceed 100 characters',
        'any.required': 'Author is required',
      }),
    
    genre: Joi.string()
      .valid(
        'Fiction',
        'Non-Fiction',
        'Mystery',
        'Romance',
        'Science Fiction',
        'Fantasy',
        'Biography',
        'History',
        'Self-Help',
        'Business',
        'Children',
        'Young Adult',
        'Poetry',
        'Drama',
        'Horror',
        'Thriller',
        'Comedy',
        'Adventure',
        'Other'
      )
      .required()
      .messages({
        'any.only': 'Invalid genre. Please select a valid genre',
        'any.required': 'Genre is required',
      }),
    
    publishedYear: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear() + 1)
      .required()
      .messages({
        'number.base': 'Published year must be a number',
        'number.integer': 'Published year must be an integer',
        'number.min': 'Published year must be at least 1000',
        'number.max': 'Published year cannot be in the future',
        'any.required': 'Published year is required',
      }),
    
    isbn: Joi.string()
      .trim()
      .pattern(/^(?:\d{9}X|\d{10}|97[89]\d{10})$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid ISBN format. Please provide a valid ISBN-10 or ISBN-13',
        'any.required': 'ISBN is required',
      }),
    
    description: Joi.string()
      .trim()
      .max(2000)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 2000 characters',
      }),
    
    price: Joi.number()
      .min(0)
      .precision(2)
      .optional()
      .default(0)
      .messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative',
      }),
    
    stock: Joi.number()
      .integer()
      .min(0)
      .optional()
      .default(0)
      .messages({
        'number.base': 'Stock must be a number',
        'number.integer': 'Stock must be an integer',
        'number.min': 'Stock cannot be negative',
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'discontinued')
      .optional()
      .default('active')
      .messages({
        'any.only': 'Status must be either active, inactive, or discontinued',
      }),
  }),

  // Update book validation (all fields optional except for validation rules)
  updateBook: Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.empty': 'Title cannot be empty',
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
      }),
    
    author: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.empty': 'Author cannot be empty',
        'string.min': 'Author cannot be empty',
        'string.max': 'Author cannot exceed 100 characters',
      }),
    
    genre: Joi.string()
      .valid(
        'Fiction',
        'Non-Fiction',
        'Mystery',
        'Romance',
        'Science Fiction',
        'Fantasy',
        'Biography',
        'History',
        'Self-Help',
        'Business',
        'Children',
        'Young Adult',
        'Poetry',
        'Drama',
        'Horror',
        'Thriller',
        'Comedy',
        'Adventure',
        'Other'
      )
      .optional()
      .messages({
        'any.only': 'Invalid genre. Please select a valid genre',
      }),
    
    publishedYear: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear() + 1)
      .optional()
      .messages({
        'number.base': 'Published year must be a number',
        'number.integer': 'Published year must be an integer',
        'number.min': 'Published year must be at least 1000',
        'number.max': 'Published year cannot be in the future',
      }),
    
    isbn: Joi.string()
      .trim()
      .pattern(/^(?:\d{9}X|\d{10}|97[89]\d{10})$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid ISBN format. Please provide a valid ISBN-10 or ISBN-13',
      }),
    
    description: Joi.string()
      .trim()
      .max(2000)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 2000 characters',
      }),
    
    price: Joi.number()
      .min(0)
      .precision(2)
      .optional()
      .messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative',
      }),
    
    stock: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages({
        'number.base': 'Stock must be a number',
        'number.integer': 'Stock must be an integer',
        'number.min': 'Stock cannot be negative',
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'discontinued')
      .optional()
      .messages({
        'any.only': 'Status must be either active, inactive, or discontinued',
      }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),

  // ID parameter validation
  bookId: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid book ID format',
        'any.required': 'Book ID is required',
      }),
  }),

  // Query parameters validation for GET requests
  getBooks: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
      }),
    
    sort: Joi.string()
      .optional()
      .messages({
        'string.base': 'Sort must be a string',
      }),
    
    search: Joi.string()
      .trim()
      .optional()
      .messages({
        'string.base': 'Search must be a string',
      }),
    
    genre: Joi.string()
      .valid(
        'Fiction',
        'Non-Fiction',
        'Mystery',
        'Romance',
        'Science Fiction',
        'Fantasy',
        'Biography',
        'History',
        'Self-Help',
        'Business',
        'Children',
        'Young Adult',
        'Poetry',
        'Drama',
        'Horror',
        'Thriller',
        'Comedy',
        'Adventure',
        'Other'
      )
      .optional()
      .messages({
        'any.only': 'Invalid genre filter',
      }),
    
    author: Joi.string()
      .trim()
      .optional()
      .messages({
        'string.base': 'Author filter must be a string',
      }),
    
    publishedYear: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear() + 1)
      .optional()
      .messages({
        'number.base': 'Published year must be a number',
        'number.integer': 'Published year must be an integer',
        'number.min': 'Published year must be at least 1000',
        'number.max': 'Published year cannot be in the future',
      }),
    
    publishedYear_gte: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear() + 1)
      .optional()
      .messages({
        'number.base': 'Published year (from) must be a number',
        'number.integer': 'Published year (from) must be an integer',
        'number.min': 'Published year (from) must be at least 1000',
        'number.max': 'Published year (from) cannot be in the future',
      }),
    
    publishedYear_lte: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear() + 1)
      .optional()
      .messages({
        'number.base': 'Published year (to) must be a number',
        'number.integer': 'Published year (to) must be an integer',
        'number.min': 'Published year (to) must be at least 1000',
        'number.max': 'Published year (to) cannot be in the future',
      }),
    
    price_gte: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.base': 'Minimum price must be a number',
        'number.min': 'Minimum price cannot be negative',
      }),
    
    price_lte: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.base': 'Maximum price must be a number',
        'number.min': 'Maximum price cannot be negative',
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'discontinued')
      .optional()
      .messages({
        'any.only': 'Status filter must be either active, inactive, or discontinued',
      }),
  }),
};

module.exports = {
  validate,
  bookSchemas,
};