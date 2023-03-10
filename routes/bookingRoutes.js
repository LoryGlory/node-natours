const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// add option to merge params, enabling parameters in other routers to merge
const router = express.Router();

router.get(
  '/checkout-session/:tourId/',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
