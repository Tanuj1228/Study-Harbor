const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    quote: { type: String, required: true, trim: true },
    author: { type: String, default: 'Unknown', trim: true },
    // Tracks if this quote is currently selected for the day
    isSelected: { type: Boolean, default: false }, 
    // Records the date when this quote was last selected
    lastUsed: { type: Date, default: null }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quote', QuoteSchema);