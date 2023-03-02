// error handling
class AppError extends Error {
  constructor(message, statusCode) {
    // call parent constructor for message
    super(message); //calling error

    this.statusCode = statusCode;
    // if statusCode starts with 4 -> fail, else error
    this.status = `${statusCode}`.startsWith('4')
      ? 'fail'
      : 'error';
    // set property to true for operational errors
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
