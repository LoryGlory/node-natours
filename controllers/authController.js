const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// function for creating and sending JWT
const createSendToken = (user, statusCode, res) => {
  // log user in (send JWT)
  const token = signToken(user._id);

  // set expiration date to now + 10 minutes (in milliseconds)
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  // remove password from output
  user.password = undefined;

  // send cookie & cookieOptions
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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
  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
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

// forgot password function
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
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}. \nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject:
          'Your password reset token (valid for 10min)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email, try again later!',
          500
        )
      );
    }
  }
);

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
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

// reset password function
exports.resetPassword = catchAsync(
  async (req, res, next) => {
    // get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token) // params because of route in authController (/users/:token)
      .digest('hex');

    // search for user with that token and check token expiration
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    //if token has not expired and there is the user, set the new password
    if (!user) {
      return next(
        new AppError('Token is invalid or has expired', 400)
      );
    }

    // set new password and confirm
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // update changedPasswordAt property for the user

    // log the user in, send JWT
    // if everything is ok - send token to client
    createSendToken(user, 200, res);
  }
);

// change password function
exports.updatePassword = catchAsync(
  async (req, res, next) => {
    // get user from collection
    const user = await User.findById(req.user.id).select(
      '+password'
    );

    // check if POSTed password is correct
    if (
      !(await user.correctPassword(
        req.body.passwordCurrent,
        user.password
      ))
    ) {
      return next(
        new AppError('Your current password is wrong.', 401)
      );
    }

    // if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // log user in, send JWT
    createSendToken(user, 200, res);
  }
);
