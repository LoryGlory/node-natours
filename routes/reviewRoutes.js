const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// add option to merge params, enabling parameters in other routers to merge
const router = express.Router({
  mergeParams: true,
});

// protect routes below (must be authenticated)
router.use(authController.protect);

// route to get reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

// route to delete reviews
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
