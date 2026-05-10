const notFound = (req, res, next) => {
  console.log("[ERROR] Route not found:", { method: req.method, url: req.originalUrl });
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);

  console.error("[ERROR] Request error:", {
    statusCode,
    message: err.message,
    path: req.path,
    method: req.method,
  });

  const response = {
    success: false,
    message: err.message || "Server error",
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
    response.error = err.name;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
