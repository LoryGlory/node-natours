const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post(
  '/forgotPassword',
  authController.forgotPassword
);

// reset password route
router.patch(
  '/resetPassword/:token',
  authController.resetPassword
);

// change password route
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

// route to get current user
router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

// route to change user data
router.patch(
  '/updateMe',
  authController.protect,
  userController.updateMe
);

// route to set user as inactive
router.delete(
  '/deleteMe',
  authController.protect,
  userController.deleteMe
);

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
