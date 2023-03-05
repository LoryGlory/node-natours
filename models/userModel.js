// user schema & model
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please provide a valid email',
    ],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide'],
      message: 'Role is either: user, guide or lead-guide',
    },
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Please enter a password.'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      // this only works on save & create!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same.',
    },
  },
  passwordChangedAt: {
    type: Date,
    select: true,
  },
});

userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // set current password to the encrypted password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // set confirmed password to undefined, so it doesn't persist in db
  this.passwordConfirm = undefined;
  next();
});

// compare entered password and existing password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
