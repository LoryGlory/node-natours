const Tour = require('../models/tourModel');

// get all tours function
exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    // build query
    const queryObj = { ...req.query };
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
    ];

    // exclude fields from query object
    excludedFields.forEach((el) => delete queryObj[el]);

    // advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    console.log(JSON.parse(queryStr));

    // execute query, return all tour documents depending on parameters
    const query = Tour.find(JSON.parse(queryStr));
    const tours = await query;

    res.status(200).json({
      requestedAt: req.requestTime,
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};

// function to get specific tour
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};

// function to create Tour
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};

// function to delete tour
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};
