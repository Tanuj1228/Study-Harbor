const mongoose = require('mongoose');
const { Schema } = mongoose;

const ResourceSchema = new mongoose.Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['note', 'syllabus', 'video', 'reference'],
    required: true
  },
  driveFileId: { type: String },
  driveWebViewLink: { type: String, required: true }, // The shareable Google Drive link/URL
  description: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

ResourceSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', ResourceSchema);