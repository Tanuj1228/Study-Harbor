const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Holiday', HolidaySchema);