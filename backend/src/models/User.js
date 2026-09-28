const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    // FIX: passwordHash made optional for OAuth users
    passwordHash: { type: String, required: false }, 
    // ADDED: Field to store Google's unique ID
    googleId: { type: String, unique: true, sparse: true }, 
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);