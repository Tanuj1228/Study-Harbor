const Year = require('../models/Year');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Holiday = require('../models/Holiday');
const User = require('../models/User');
const Quote = require('../models/Quote'); // <-- CORRECT IMPORT

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
            // This correctly spreads all fields, including description and registrationLink
            ...req.body,
            uploadedBy: req.user.userId,
            year: subject.yearId.yearNumber, // Populate year number
            // The tags string from the frontend is converted to an array here
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


// --- NEW QUOTE MANAGEMENT FUNCTIONS ---

// Create a new quote
exports.createQuote = async (req, res) => {
    try {
        const quote = new Quote(req.body);
        await quote.save();
        res.status(201).json(quote);
    } catch (err) {
        res.status(400).json({ msg: 'Error creating quote', error: err.message });
    }
};

// Admin forces a specific quote to be "Quote of the Day"
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

// FIX: ADDED MISSING FUNCTION for the Admin Dashboard List
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