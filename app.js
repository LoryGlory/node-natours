const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

// middleware to modify incoming request data
app.use(express.json());

// read data from file
const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/dev-data/data/tours-simple.json`,
    'utf-8'
  )
);

// get all tours function
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

// function to get specific tour
const getTour = (req, res) => {
  console.log(req.params);
  const tour = tours.find((el) => el.id === id);

  // convert string id to a number
  const id = req.params.id * 1;

  // send error message if tour id cannot be found
  if (!tour) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

// function to create Tour
const createTour = (req, res) => {
  // console.log(req.body);
  // add new tour with id + 1 and request body as tour content
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  // write tour data in file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  // send error message if tour id cannot be found
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated Tour here...>',
    },
  });
};

// function to delete tour
const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

// OLD VARIANT
// get request & call to get all tours function
// app.get('/api/v1/tours', getAllTours);

// get request & call get specific tour function
// app.get('/api/v1/tours/:id', getTour);

// post request & call add new tour function
// app.post('/api/v1/tours', createTour);

// patch request & call update tour function
// app.patch('/api/v1/tours/:id', updateTour);

// delete tour request & call delete Tour function
// app.delete('/api/v1/tours/:id', deleteTour);

// NEW VARIANT: chaining methods for all tours and specific tours
app
  .route('/api/v1/tours/')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
