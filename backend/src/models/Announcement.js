const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['exam', 'event', 'general'], default: 'general', required: true },
  // ADDED: Optional field for the event/exam date
  dateOfEvent: { type: String }, 
  pinned: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);