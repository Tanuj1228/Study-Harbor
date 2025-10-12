const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectSchema = new mongoose.Schema({
  yearId: { type: Schema.Types.ObjectId, ref: 'Year', required: true },
  code: { type: String, required: true, trim: true, uppercase: true }, // e.g., "CS101"
  title: { type: String, required: true, trim: true }, // e.g., "Data Structures"
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subject', SubjectSchema);