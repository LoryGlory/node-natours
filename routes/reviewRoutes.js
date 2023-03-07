const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// add option to merge params, enabling parameters in other routers to merge
const router = express.Router({
  mergeParams: true,
});

// route to get reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

// route to delete reviews
router.route('/:id').delete(reviewController.deleteReview);

module.exports = router;
