const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, try again later',
  };

  // Mongoose Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
    customError.statusCode = 400;
  }

  // Mongo Duplicate Key Error
  if (err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field. Please choose another value.`;
    customError.statusCode = 400;
  }

  // CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = 404;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
