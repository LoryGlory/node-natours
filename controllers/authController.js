const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // define data stored in User object (cannot add roles etc.)
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // create jsonwebtoken token for user login
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // create email and password variables from req.body object
  // {email} = req.body is equal to email = req.body.email
  const { email, password } = req.body;

  // check if email and password exist
  if (!email || !password) {
    return next(
      new AppError(
        'Please provide email and password.',
        400
      )
    );
  }

  // check if user exist && if password is correct
  const user = await User.findOne({ email }).select(
    '+password'
  );

  // check if password is correct with correctPassword function from userModel
  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(
      new AppError('Incorrect email or password!', 401)
    );
  }

  // if everything is ok - send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
