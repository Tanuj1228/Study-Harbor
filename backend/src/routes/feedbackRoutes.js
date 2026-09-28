const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// @route   POST /api/feedback
// @desc    Submit feedback and trigger email auto-reply
// @access  Public (Rate limiting recommended for production)
router.post('/feedback', feedbackController.submitFeedback);

module.exports = router;