const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
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
exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log(req.query);

  // save final query results to tours variable
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    requestedAt: req.requestTime,
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// function to get specific tour
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(
      new AppError('No tour found with that ID', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// function to create Tour
// wrap async function inside catchAsync, returning a new
// anonymous function used to createTour
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  if (!tour) {
    return next(
      new AppError('No tour found with that ID', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// function to delete tour
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(
      new AppError('No tour found with that ID', 404)
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

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

//
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
