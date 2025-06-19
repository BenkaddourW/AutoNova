function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  const response = {
    message: err.message || 'Internal Server Error'
   
  };
  if (err.errors) {
    response.errors = err.errors;
  }
  res.json(response);
}

module.exports = errorHandler;
