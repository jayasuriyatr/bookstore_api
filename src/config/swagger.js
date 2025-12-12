const swaggerJSDoc = require('swagger-jsdoc');
const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bookstore API',
      version: '1.0.0',
      description: 'A production-ready RESTful API for managing a bookstore with comprehensive CRUD operations, advanced filtering, search, and analytics.',
      contact: {
        name: 'API Support',
        email: 'support@bookstore.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.PORT || 5000}`,
        description: 'Development server'
      },
      {
        url: 'https://your-production-domain.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author', 'isbn', 'publicationDate'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the book',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              description: 'Title of the book',
              minLength: 1,
              maxLength: 200,
              example: 'The Great Gatsby'
            },
            author: {
              type: 'string',
              description: 'Author of the book',
              minLength: 1,
              maxLength: 100,
              example: 'F. Scott Fitzgerald'
            },
            isbn: {
              type: 'string',
              description: 'International Standard Book Number',
              pattern: '^(978|979)[0-9]{10}$',
              example: '9780743273565'
            },
            description: {
              type: 'string',
              description: 'Description of the book',
              maxLength: 1000,
              example: 'A classic American novel set in the Jazz Age'
            },
            publicationDate: {
              type: 'string',
              format: 'date',
              description: 'Publication date of the book',
              example: '1925-04-10'
            },
            genre: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
                  'Fantasy', 'Biography', 'History', 'Self-Help', 'Health',
                  'Travel', 'Children', 'Young Adult', 'Poetry', 'Drama',
                  'Horror', 'Adventure', 'Crime', 'Thriller', 'Comedy'
                ]
              },
              description: 'Genres of the book',
              example: ['Fiction', 'Classic']
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Price of the book in USD',
              example: 12.99
            },
            stock: {
              type: 'integer',
              minimum: 0,
              description: 'Number of books in stock',
              example: 50
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Average rating of the book',
              example: 4.5
            },
            totalReviews: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of reviews',
              example: 120
            },
            language: {
              type: 'string',
              description: 'Language of the book',
              example: 'English'
            },
            pageCount: {
              type: 'integer',
              minimum: 1,
              description: 'Number of pages',
              example: 180
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tags associated with the book',
              example: ['classic', 'american literature', 'jazz age']
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the book is active/available',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the book was created',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the book was last updated',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        },
        CreateBookRequest: {
          type: 'object',
          required: ['title', 'author', 'isbn', 'publicationDate'],
          properties: {
            title: { $ref: '#/components/schemas/Book/properties/title' },
            author: { $ref: '#/components/schemas/Book/properties/author' },
            isbn: { $ref: '#/components/schemas/Book/properties/isbn' },
            description: { $ref: '#/components/schemas/Book/properties/description' },
            publicationDate: { $ref: '#/components/schemas/Book/properties/publicationDate' },
            genre: { $ref: '#/components/schemas/Book/properties/genre' },
            price: { $ref: '#/components/schemas/Book/properties/price' },
            stock: { $ref: '#/components/schemas/Book/properties/stock' },
            rating: { $ref: '#/components/schemas/Book/properties/rating' },
            language: { $ref: '#/components/schemas/Book/properties/language' },
            pageCount: { $ref: '#/components/schemas/Book/properties/pageCount' },
            tags: { $ref: '#/components/schemas/Book/properties/tags' }
          }
        },
        UpdateBookRequest: {
          type: 'object',
          properties: {
            title: { $ref: '#/components/schemas/Book/properties/title' },
            author: { $ref: '#/components/schemas/Book/properties/author' },
            description: { $ref: '#/components/schemas/Book/properties/description' },
            genre: { $ref: '#/components/schemas/Book/properties/genre' },
            price: { $ref: '#/components/schemas/Book/properties/price' },
            stock: { $ref: '#/components/schemas/Book/properties/stock' },
            rating: { $ref: '#/components/schemas/Book/properties/rating' },
            language: { $ref: '#/components/schemas/Book/properties/language' },
            pageCount: { $ref: '#/components/schemas/Book/properties/pageCount' },
            tags: { $ref: '#/components/schemas/Book/properties/tags' },
            isActive: { $ref: '#/components/schemas/Book/properties/isActive' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Current page number'
                },
                limit: {
                  type: 'integer',
                  description: 'Number of items per page'
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total number of pages'
                },
                totalItems: {
                  type: 'integer',
                  description: 'Total number of items'
                },
                hasNextPage: {
                  type: 'boolean',
                  description: 'Whether there is a next page'
                },
                hasPrevPage: {
                  type: 'boolean',
                  description: 'Whether there is a previous page'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Error details'
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation error'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that failed validation'
                  },
                  message: {
                    type: 'string',
                    description: 'Validation error message'
                  }
                }
              }
            }
          }
        }
      },
      parameters: {
        pageParam: {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number for pagination'
        },
        limitParam: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Number of items per page'
        },
        sortParam: {
          name: 'sort',
          in: 'query',
          schema: {
            type: 'string',
            example: 'title,-rating'
          },
          description: 'Sort criteria (prefix with - for descending order)'
        },
        searchParam: {
          name: 'search',
          in: 'query',
          schema: {
            type: 'string'
          },
          description: 'Search term for title, author, or description'
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Book not found',
                statusCode: 404
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Internal server error',
                statusCode: 500
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Books',
        description: 'Book management operations'
      },
      {
        name: 'Health',
        description: 'API health and status endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.js', // Path to the API routes
    './src/controllers/*.js' // Path to the controllers for additional documentation
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;