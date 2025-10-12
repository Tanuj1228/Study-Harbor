const Year = require('../models/Year');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Holiday = require('../models/Holiday');
const User = require('../models/User');

// --- ADMIN API ENDPOINTS ---

// 1. Years and Subjects
exports.createYear = async (req, res) => {
    try {
        const year = new Year(req.body);
        await year.save();
        res.status(201).json(year);
    } catch (err) {
        res.status(400).json({ msg: 'Error creating year', error: err.message });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const subject = new Subject({ ...req.body, uploadedBy: req.user.userId });
        await subject.save();
        res.status(201).json(subject);
    } catch (err) {
        res.status(400).json({ msg: 'Error creating subject', error: err.message });
    }
};

// 2. Resources (Notes, Syllabus, Videos)
exports.addResource = async (req, res) => {
    try {
        // Validation check for essential fields, especially driveWebViewLink for MVP
        if (!req.body.driveWebViewLink) {
            return res.status(400).json({ msg: 'driveWebViewLink is required for the resource.' });
        }
        
        // Find year number based on subject's yearId (optional but useful for filtering)
        const subject = await Subject.findById(req.body.subjectId).populate('yearId');
        if (!subject) return res.status(404).json({ msg: 'Subject not found.' });

        const resource = new Resource({
            ...req.body,
            uploadedBy: req.user.userId,
            year: subject.yearId.yearNumber, // Populate year number
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
        });
        await resource.save();
        res.status(201).json(resource);
    } catch (err) {
        res.status(400).json({ msg: 'Error adding resource', error: err.message });
    }
};

// 3. Announcements and Holidays
exports.createAnnouncement = async (req, res) => {
    try {
        const announcement = new Announcement({ ...req.body, createdBy: req.user.userId });
        await announcement.save();
        res.status(201).json(announcement);
    } catch (err) {
        res.status(400).json({ msg: 'Error creating announcement', error: err.message });
    }
};

exports.createHoliday = async (req, res) => {
    try {
        const holiday = new Holiday({ ...req.body, createdBy: req.user.userId });
        await holiday.save();
        res.status(201).json(holiday);
    } catch (err) {
        res.status(400).json({ msg: 'Error creating holiday', error: err.message });
    }
};

// 4. User Management (Promote/Demote)
exports.updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body; // should be 'user' or 'admin'

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ msg: 'Invalid role specified.' });
    }

    try {
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        res.json({ msg: `User ${user.email} role updated to ${user.role}` });
    } catch (err) {
        res.status(500).json({ msg: 'Server error updating user role.' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        // Do not return passwordHash
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching users.' });
    }
};