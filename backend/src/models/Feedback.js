const mongoose = require('mongoose');
const FeedbackSchema = new mongoose.Schema({
  userEmail: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['new', 'reviewed', 'closed'], default: 'new' }
});
module.exports = mongoose.model('Feedback', FeedbackSchema);