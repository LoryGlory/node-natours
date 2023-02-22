const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

// middleware to modify incoming request data
app.use(express.json());

// read data from file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// get request to get all tours
app.get('/api/v1/tours/', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// get request to get specific tour
app.get('/api/v1/tours/:id', (req, res) => {
  console.log(req.params);

  // convert string id to a number
  const id = req.params.id * 1;

  // match id from parameters to tour id
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// post request to add a new tour
app.post('/api/v1/tours', (req, res) => {
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
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
