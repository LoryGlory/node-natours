// const fs = require('fs');
const Tour = require('../models/tourModel');

// read data from file
// const tours = JSON.parse(
//   fs.readFileSync(
//     `././dev-data/data/tours-simple.json`,
//     'utf-8'
//   )
// );

// middleware to check id of tour
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//
//   next();
// };

// middleware to check name and price
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price!',
    });
  }
  next();
};

// get all tours function
exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    requestedAt: req.requestTime,
    status: 'success',
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

// function to get specific tour
exports.getTour = (req, res) => {
  console.log(req.params);
  // convert string id to a number
  // const id = req.params.id * 1;

  // const tour = tours.find((el) => el.id === id);
  //
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
};

// function to create Tour
exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    // data: {
    //   tour: newTour,
    // },
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated Tour here...>',
    },
  });
};

// function to delete tour
exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
