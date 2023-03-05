const { promisify } = require('util');
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
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
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

exports.protect = catchAsync(async (req, res, next) => {
  // get token, check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get access.',
        401
      )
    );
  }

  // verify token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // check if user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.'
      ),
      401
    );
  }

  // check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again!',
        401
      )
    );
  }

  // grant access to protected route
  req.user = freshUser;
  next();
});

// (...roles) contains roles defined in tourRoutes.js, where we define which user roles have permission
// restrict user roles for delete action
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // only allow roles 'admin' and 'lead-guide', not 'user' etc.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }
    next();
  };
};

//
exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // get user based on POST email
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return next(
        new AppError(
          'There is no user with email address',
          404
        )
      );
    }

    // generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // send it back as an email

    // next();

    res.status(200).json({
      status: 'success',
      resetToken, // resetToken = await user.createResetPasswordToken();
    });
  }
);

exports.resetPassword = (req, res, next) => {};
