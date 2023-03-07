const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');

// get all reviews
exports.getAllReviews = catchAsync(
  async (req, res, next) => {
    const reviews = await Review.find();

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
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  }
);
