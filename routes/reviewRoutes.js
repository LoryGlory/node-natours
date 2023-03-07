const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// add option to merge params, enabling parameters in other routers to merge
const router = express.Router({
  mergeParams: true,
});

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
