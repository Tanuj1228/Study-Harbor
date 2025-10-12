const mongoose = require('mongoose');

const YearSchema = new mongoose.Schema({
  yearNumber: { type: Number, required: true, unique: true, min: 1, max: 4 }, // 1, 2, 3, 4
  displayName: { type: String, required: true, trim: true }, // e.g., "First Year"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Year', YearSchema);