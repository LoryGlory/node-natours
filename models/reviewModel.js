const mongoose = require('mongoose');
// const validator = require('validator');
const Tour = require('./tourModel');

// mongoose schema for tour model
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must be written by a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// prevent duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// populate query with guides fields
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  //
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// aggregation to calculate average ratings
reviewSchema.statics.calcAverageRatings = async function (
  tourId
) {
  console.log(tourId);

  // calculate average number of ratings and average ratings
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  // save statistics to current tour
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// call calcAverageRatings function after a new review has been created
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// update ratings and call calcAverageRatings
reviewSchema.post(/^findOneAnd/, async function (docs) {
  if (docs)
    await docs.constructor.calcAverageRatings(docs.tour);
});

// Review model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
