class ApiResponse {
  constructor(statusCode = 200, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  // Static methods for common success responses
  static success(data = null, message = 'Operation completed successfully', statusCode = 200) {
    return new ApiResponse(statusCode, data, message);
  }

  static created(data = null, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static updated(data = null, message = 'Resource updated successfully') {
    return new ApiResponse(200, data, message);
  }

  static deleted(message = 'Resource deleted successfully') {
    return new ApiResponse(200, null, message);
  }

  // Method to add pagination metadata
  withPagination(pagination) {
    this.pagination = {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage,
    };
    return this;
  }

  // Method to add metadata
  withMeta(meta) {
    this.meta = meta;
    return this;
  }

  // Method to send the response
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.pagination && { pagination: this.pagination }),
      ...(this.meta && { meta: this.meta }),
      timestamp: this.timestamp,
    });
  }
}

module.exports = ApiResponse;