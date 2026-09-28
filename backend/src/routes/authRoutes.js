const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const googleAuthController = require('../controllers/googleAuthController'); // <-- NEW IMPORT

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/google
// @desc    Login/Register using Google ID token
// @access  Public
router.post('/google', googleAuthController.googleLogin); // <-- ADD THIS

module.exports = router;