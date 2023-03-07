const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// get all reviews
exports.getAllReviews = catchAsync(
  async (req, res, next) => {
    let filter = {};

    if (req.params.tourId)
      filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    if (!reviews) {
      return next(
        new AppError('No review found with that ID', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

// create new review
exports.createReview = catchAsync(
  async (req, res, next) => {
    //nested routes
    // define tour id as the one coming in from the url if no tour id exists in request body
    if (!req.body.tour) req.body.tour = req.params.tourId;

    // define user id as the one coming in from the url if no user id exists in request body
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  }
);

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
