// route handlers
const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// middleware call to check id
// router.param('id', tourController.checkID);

// return top 5 tours when route is /top-5-cheap
router
  .route('/top-5-cheap')
  .get(
    tourController.aliasTopTours,
    tourController.getAllTours
  );

// return tour stats when route is /tour-stats
router
  .route('/tour-stats')
  .get(tourController.getTourStats);

// prettier-ignore
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
