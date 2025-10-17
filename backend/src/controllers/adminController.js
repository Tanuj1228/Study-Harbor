const Year = require('../models/Year');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Holiday = require('../models/Holiday');
const User = require('../models/User');
const Quote = require('../models/Quote');

// --- ADMIN API ENDPOINTS ---

// 1. Years and Subjects (Creation)
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

// UPDATED: Edit Subject
exports.updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!subject) return res.status(404).json({ msg: 'Subject not found.' });
        res.json({ msg: 'Subject updated successfully.', subject });
    } catch (err) {
        res.status(400).json({ msg: 'Error updating subject', error: err.message });
    }
};

// UPDATED: Delete Subject
exports.deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) return res.status(404).json({ msg: 'Subject not found.' });

        await Resource.deleteMany({ subjectId: req.params.id }); 
        
        res.json({ msg: 'Subject and associated resources deleted successfully.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error deleting subject.' });
    }
};

// --- NEW LIST RETRIEVAL FUNCTIONS (REQUIRED FOR MANAGE TAB) ---

// NEW: Get all subjects for admin management
exports.getAllSubjectsAdmin = async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ yearId: 1, code: 1 });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching all subjects for admin.' });
    }
};

// NEW: Get resources by subject ID for admin management
exports.getResourcesBySubjectAdmin = async (req, res) => {
    try {
        // Fetch resources matching the subjectId provided in the URL parameter
        const resources = await Resource.find({ subjectId: req.params.subjectId }).sort({ title: 1 });
        res.json(resources);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching resources for admin.' });
    }
};

// NEW: Get all announcements for admin management
exports.getAllAnnouncementsAdmin = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ dateOfEvent: -1, createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching all announcements for admin.' });
    }
};

// NEW: Get all holidays for admin management
exports.getAllHolidaysAdmin = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.json(holidays);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching all holidays for admin.' });
    }
};

// --- END NEW LIST RETRIEVAL FUNCTIONS ---


// 2. Resources (Creation)
exports.addResource = async (req, res) => {
    try {
        if (!req.body.driveWebViewLink) {
            return res.status(400).json({ msg: 'driveWebViewLink is required for the resource.' });
        }
        
        const subject = await Subject.findById(req.body.subjectId).populate('yearId');
        if (!subject) return res.status(404).json({ msg: 'Subject not found.' });

        const resource = new Resource({
            ...req.body,
            uploadedBy: req.user.userId,
            year: subject.yearId.yearNumber,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
        });
        await resource.save();
        res.status(201).json(resource);
    } catch (err) {
        res.status(400).json({ msg: 'Error adding resource', error: err.message });
    }
};

// UPDATED: Edit Resource
exports.updateResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!resource) return res.status(404).json({ msg: 'Resource not found.' });
        res.json({ msg: 'Resource updated successfully.', resource });
    } catch (err) {
        res.status(400).json({ msg: 'Error updating resource', error: err.message });
    }
};

// UPDATED: Delete Resource
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) return res.status(404).json({ msg: 'Resource not found.' });
        res.json({ msg: 'Resource deleted successfully.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error deleting resource.' });
    }
};


// 3. Announcements (Creation)
exports.createAnnouncement = async (req, res) => {
    try {
        const announcement = new Announcement({ ...req.body, createdBy: req.user.userId });
        await announcement.save();
        res.status(201).json(announcement);
    } catch (err) {
        res.status(400).json({ msg: 'Error creating announcement', error: err.message });
    }
};

// UPDATED: Edit Announcement
exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!announcement) return res.status(404).json({ msg: 'Announcement not found.' });
        res.json({ msg: 'Announcement updated successfully.', announcement });
    } catch (err) {
        res.status(400).json({ msg: 'Error updating announcement', error: err.message });
    }
};

// UPDATED: Delete Announcement
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ msg: 'Announcement not found.' });
        res.json({ msg: 'Announcement deleted successfully.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error deleting announcement.' });
    }
};


// Holidays (Creation)
exports.createHoliday = async (req, res) => {
    try {
        const holiday = new Holiday({ ...req.body, createdBy: req.user.userId });
        await holiday.save();
        res.status(201).json(holiday);
    } catch (err) {
        res.status(400).json({ msg: 'Error creating holiday', error: err.message });
    }
};

// UPDATED: Edit Holiday
exports.updateHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!holiday) return res.status(404).json({ msg: 'Holiday not found.' });
        res.json({ msg: 'Holiday updated successfully.', holiday });
    } catch (err) {
        res.status(400).json({ msg: 'Error updating holiday', error: err.message });
    }
};

// UPDATED: Delete Holiday
exports.deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);
        if (!holiday) return res.status(404).json({ msg: 'Holiday not found.' });
        res.json({ msg: 'Holiday deleted successfully.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error deleting holiday.' });
    }
};


// --- QUOTE MANAGEMENT FUNCTIONS (Existing) ---
exports.createQuote = async (req, res) => {
    try {
        const quote = new Quote(req.body);
        await quote.save();
        res.status(201).json(quote);
    } catch (err) {
        res.status(400).json({ msg: 'Error creating quote', error: err.message });
    }
};

exports.setQuote = async (req, res) => {
    const { quoteId } = req.params;
    try {
        // 1. Clear the 'isSelected' flag on all quotes
        await Quote.updateMany({}, { isSelected: false });

        // 2. Set the selected quote
        const quote = await Quote.findByIdAndUpdate(
            quoteId, 
            { isSelected: true, lastUsed: new Date() }, 
            { new: true }
        );
        if (!quote) return res.status(404).json({ msg: 'Quote not found.' });

        res.json({ msg: 'Quote successfully set for the day.', quote });
    } catch (err) {
        res.status(500).json({ msg: 'Server error setting quote.' });
    }
};

exports.getAllQuotes = async (req, res) => {
    try {
        // Sort by 'isSelected' (current quote first), then by last used date
        const quotes = await Quote.find().sort({ isSelected: -1, lastUsed: -1 });
        res.json(quotes);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching quotes.' });
    }
};
// --- END QUOTE MANAGEMENT ---


// 4. User Management (Existing)
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