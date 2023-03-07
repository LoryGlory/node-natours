// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// set tour and user IDs
exports.setTourUserIds = (req, res, next) => {
  //nested routes
  // define tour id as the one coming in from the url if no tour id exists in request body
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // define user id as the one coming in from the url if no user id exists in request body
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
