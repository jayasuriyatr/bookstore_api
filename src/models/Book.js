const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true, // Index for search performance
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      minlength: [1, 'Author cannot be empty'],
      maxlength: [100, 'Author cannot exceed 100 characters'],
      index: true, // Index for search performance
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      enum: {
        values: [
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
        ],
        message: '{VALUE} is not a valid genre'
      },
      index: true, // Index for filtering
    },
    publishedYear: {
      type: Number,
      required: [true, 'Published year is required'],
      min: [1000, 'Published year must be at least 1000'],
      max: [new Date().getFullYear() + 1, 'Published year cannot be in the future'],
      index: true, // Index for filtering and sorting
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function(v) {
          // ISBN-10 or ISBN-13 validation (simplified)
          const isbn10Pattern = /^(?:\d{9}X|\d{10})$/;
          const isbn13Pattern = /^(?:97[89]\d{10})$/;
          const cleanIsbn = v.replace(/[-\s]/g, '');
          return isbn10Pattern.test(cleanIsbn) || isbn13Pattern.test(cleanIsbn);
        },
        message: 'Invalid ISBN format. Please provide a valid ISBN-10 or ISBN-13'
      },
      index: { unique: true }, // Unique index
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    stock: {
      type: Number,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'discontinued'],
        message: '{VALUE} is not a valid status'
      },
      default: 'active',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
BookSchema.index({ title: 'text', author: 'text', description: 'text' }); // Text index for search
BookSchema.index({ genre: 1, publishedYear: -1 }); // Compound index for filtering
BookSchema.index({ createdAt: -1 }); // Index for sorting by creation date

// Virtual for formatted price
BookSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for availability status
BookSchema.virtual('isAvailable').get(function() {
  return this.stock > 0 && this.status === 'active';
});

// Pre-save middleware to format ISBN
BookSchema.pre('save', function(next) {
  if (this.isModified('isbn')) {
    // Remove hyphens and spaces from ISBN
    this.isbn = this.isbn.replace(/[-\s]/g, '');
  }
  next();
});

// Static method to find books by genre
BookSchema.statics.findByGenre = function(genre) {
  return this.find({ genre, status: 'active' });
};

// Static method to find books by author
BookSchema.statics.findByAuthor = function(author) {
  return this.find({ 
    author: { $regex: author, $options: 'i' },
    status: 'active'
  });
};

// Instance method to check if book is new (published in last 2 years)
BookSchema.methods.isNewBook = function() {
  const currentYear = new Date().getFullYear();
  return this.publishedYear >= (currentYear - 2);
};

// Instance method to update stock
BookSchema.methods.updateStock = function(quantity) {
  this.stock = Math.max(0, this.stock + quantity);
  return this.save();
};

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;