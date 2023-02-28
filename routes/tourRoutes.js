// route handlers
const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// middleware call to check id
// router.param('id', tourController.checkID);

// prettier-ignore
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
