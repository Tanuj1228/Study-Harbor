const Year = require('../models/Year');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Holiday = require('../models/Holiday');
const User = require('../models/User');
const Quote = require('../models/Quote');

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

// NEW: Delete Resource
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) return res.status(404).json({ msg: 'Resource not found.' });
        res.json({ msg: 'Resource successfully deleted.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error deleting resource.' });
    }
};

// NEW: Delete Subject
exports.deleteSubject = async (req, res) => {
    try {
        // OPTIONAL: Delete all resources associated with this subject first
        await Resource.deleteMany({ subjectId: req.params.id }); 
        
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) return res.status(404).json({ msg: 'Subject not found.' });
        
        res.json({ msg: 'Subject and associated resources successfully deleted.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error deleting subject.' });
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

// NEW: Delete Announcement
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ msg: 'Announcement not found.' });
        res.json({ msg: 'Announcement successfully deleted.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error deleting announcement.' });
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

exports.deleteHoliday = async (req, res) => {
    try {
        // Use findByIdAndDelete to remove the holiday based on the ID passed in the URL params
        const holiday = await Holiday.findByIdAndDelete(req.params.id);
        
        // If no holiday was found, return a 404
        if (!holiday) {
            return res.status(404).json({ msg: 'Holiday not found.' });
        }
        
        // Success response
        res.json({ msg: 'Holiday successfully deleted.' });
    } catch (err) {
        // Catch any server or database error
        res.status(500).json({ msg: 'Server error deleting holiday.' });
    }
};
// --- QUOTE MANAGEMENT FUNCTIONS ---

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
        await Quote.updateMany({}, { isSelected: false });

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

// NEW: Delete Quote
exports.deleteQuote = async (req, res) => {
    try {
        const quote = await Quote.findByIdAndDelete(req.params.id);
        if (!quote) return res.status(404).json({ msg: 'Quote not found.' });
        res.json({ msg: 'Quote successfully deleted.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error deleting quote.' });
    }
};

exports.getAllQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find().sort({ isSelected: -1, lastUsed: -1 });
        res.json(quotes);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching quotes.' });
    }
};
// --- END QUOTE MANAGEMENT ---


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