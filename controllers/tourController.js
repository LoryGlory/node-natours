const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

// default top tours sorted by highest average rating and price
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
};

// get all tours function
exports.getAllTours = factory.getAll(Tour);

// get tour and populate conditionally with reviews or not
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// function to create tour
exports.createOne = factory.createOne(Tour);

//function to update tour
exports.updateTour = factory.updateOne(Tour);

// function to delete tour with refactored code
exports.deleteTour = factory.deleteOne(Tour);

// calculate stats for tours
exports.getTourStats = catchAsync(
  async (req, res, next) => {
    // mongoDB aggregation pipeline for matching & grouping
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 }, // add 1 for each tour and add up
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1, // ascending
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  }
);

exports.getMonthlyPlan = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1; // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // first day of 2021
            $lte: new Date(`${year}-12-31`), // last day of 2021
          },
        },
      },
      {
        // group by month
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        // hide _id field
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 }, // sort number of tours descending
      },
      {
        $limit: 12, // limit outputs (redundant because of 12 months, just for reference)
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  }
);

// get tours within a radius
exports.getToursWithin = catchAsync(
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius =
      unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400
        )
      );
    }

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  }
);

exports.getDistances = catchAsync(
  async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitute and longitude in the format lat,lng.',
          400
        )
      );
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      },
    });
  }
);

// old function to create Tour
// wrap async function inside catchAsync, returning a new
// anonymous function used to createTour
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// old function to update tour
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     {
//       new: true,
//     }
//   );
//
//   if (!tour) {
//     return next(
//       new AppError('No tour found with that ID', 404)
//     );
//   }
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// old function to delete tour
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//
//   if (!tour) {
//     return next(
//       new AppError('No tour found with that ID', 404)
//     );
//   }
//
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// old function to get tour
// function to get specific tour
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate(
//     'reviews'
//   );
//
//   if (!tour) {
//     return next(
//       new AppError('No tour found with that ID', 404)
//     );
//   }
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
