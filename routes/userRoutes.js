const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post(
  '/forgotPassword',
  authController.forgotPassword
);

// reset password route
router.patch(
  '/resetPassword/:token',
  authController.resetPassword
);

// protect all routes below
router.use(authController.protect);

// change password route
router.patch(
  '/updateMyPassword',
  authController.updatePassword
);

// route to get current user
router.get(
  '/me',
  userController.getMe,
  userController.getUser
);

// route to change user data
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe
);

// route to set user as inactive
router.delete('/deleteMe', userController.deleteMe);

// restrict route access below to admins
router.use(authController.restrictTo('admin'));

//user routes
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
