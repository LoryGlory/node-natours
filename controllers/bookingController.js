const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const Stripe = require('stripe');

exports.getCheckoutSession = catchAsync(
  async (req, res, next) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const tour = await Tour.findById(req.params.tourId);

    if (!tour)
      return next(new AppError('Tour not found!', 404));

    // create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get(
        'host'
      )}/?tour=${req.params.tourId}&user=${
        req.user.id
      }&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get(
        'host'
      )}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `https://www.natours.dev/img/tours/${tour.imageCover}`,
              ],
            },
          },
        },
      ],
      mode: 'payment',
    });

    //3- Send to client
    res.status(200).json({
      status: 'success',
      session,
    });
  }
);

exports.createBookingCheckout = catchAsync(
  async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();

    // create new document
    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
  }
);