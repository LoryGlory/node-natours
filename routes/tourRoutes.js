// route handlers
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// middleware call to check id
// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

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

// return tour stats when route is /tour-stats
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo(
      'admin',
      'lead-guide',
      'guide'
    ),
    tourController.getMonthlyPlan
  );

router
  .route(
    '/tours-within/:distance/center/:latlng/unit/:unit'
  )
  .get(tourController.getToursWithin);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createOne
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
