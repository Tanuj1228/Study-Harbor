const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  // FIX: Change type from Date to String to store "YYYY-MM-DD" and avoid timezone offset errors.
  date: { type: String, required: true, unique: true }, 
  title: { type: String, required: true, trim: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Holiday', HolidaySchema);