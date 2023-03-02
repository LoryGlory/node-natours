const express = require('express');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// middleware to modify incoming request data
// http request logger running only when in dev environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
// use middleware to serve static files, setting public as root
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middle ware!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// middleware to mount routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// handle nonexistent routes
app.all('*', (req, res, next) => {
  // add error to next function, passing all other middlewares and going straight to the error
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404
    )
  );
});

// middleware for error handling
app.use(globalErrorHandler);

module.exports = app;
