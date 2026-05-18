const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err);

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      status: 'error',
      message: 'Resource already exists (duplicate key)',
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      status: 'error',
      message: 'Referenced resource does not exist',
    });
  }

  // Not found
  if (err.status === 404) {
    return res.status(404).json({
      status: 'error',
      message: err.message || 'Resource not found',
    });
  }

  // Generic
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Internal server error' : err.message,
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFound };
