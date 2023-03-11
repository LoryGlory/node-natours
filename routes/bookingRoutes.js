const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// add option to merge params, enabling parameters in other routers to merge
const router = express.Router();

router.use(authController.protect);

router.get(
  '/checkout-session/:tourId/',
  bookingController.getCheckoutSession
);

router.use(
  authController.restrictTo('admin', 'leagit d-guide')
);
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
