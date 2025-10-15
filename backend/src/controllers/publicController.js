const Year = require('../models/Year');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Holiday = require('../models/Holiday');

// --- NEW FUNCTION: Get single announcement details ---
exports.getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ msg: 'Announcement not found.' });
        }
        res.json(announcement);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching announcement details.' });
    }
};

// --- NEW FUNCTION: Get single subject details ---
exports.getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.subjectId).select('title description');
        if (!subject) {
            return res.status(404).json({ msg: 'Subject not found.' });
        }
        res.json(subject);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching subject details.' });
    }
};

// --- NEW FUNCTION: Fetch all subjects for the admin dashboard dropdowns ---
exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ title: 1 });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching all subjects.' });
    }
};
// --- PUBLIC API ENDPOINTS ---

// 1. Core Structure
exports.getYears = async (req, res) => {
    try {
        const years = await Year.find().sort({ yearNumber: 1 });
        res.json(years);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching years.' });
    }
};

exports.getSubjectsByYear = async (req, res) => {
    try {
        const subjects = await Subject.find({ yearId: req.params.yearId }).sort({ code: 1 });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching subjects.' });
    }
};

exports.getResourcesBySubject = async (req, res) => {
    // Allows filtering by resource type: ?type=note or ?type=video
    const { type } = req.query;
    const filter = { subjectId: req.params.subjectId };

    if (type) {
        filter.type = type;
    }

    try {
        const resources = await Resource.find(filter).sort({ title: 1 });
        res.json(resources);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching resources.' });
    }
};

// 2. Announcements
exports.getAnnouncements = async (req, res) => {
    // 1. Get today's date in YYYY-MM-DD format for reliable string comparison
    const today = new Date().toISOString().split('T')[0];
    
    // 2. Define the filter to exclude expired announcements
    const filter = {
        $or: [
            // Condition 1: Include announcements that DON'T have a specific event date (e.g., General Notices).
            { dateOfEvent: { $exists: false } }, 
            { dateOfEvent: { $eq: '' } }, 
            
            // Condition 2: Include announcements where the dateOfEvent is today or in the future.
            { dateOfEvent: { $gte: today } } 
        ]
    };

    try {
        // Use the filter in the find query
        const announcements = await Announcement.find(filter).sort({ pinned: -1, createdAt: -1 }); 
        res.json(announcements);
    } catch (err) {
        console.error("Error fetching announcements:", err);
        res.status(500).json({ msg: 'Server error fetching announcements.' });
    }
};

// 3. Holidays
exports.getHolidays = async (req, res) => {
    // Now returns ALL holidays (past and future)
    try {
        // Removed the filter: { date: { $gte: new Date() } }
        const holidays = await Holiday.find().sort({ date: -1 }); // Sort by date descending (latest first)
        res.json(holidays);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching holidays.' });
    }
};

// 4. Search Functionality
exports.searchResources = async (req, res) => {
    const { q } = req.query; // Search query

    if (!q) {
        return res.status(400).json({ msg: 'Search query (q) is required.' });
    }

    try {
        // Use the text index created on the Resource model (title, tags)
        const resources = await Resource.find({ $text: { $search: q } })
            .populate({
                path: 'subjectId',
                select: 'title code'
            })
            .limit(50); // Limit results for performance

        res.json(resources);
    } catch (err) {
        res.status(500).json({ msg: 'Server error during search.' });
    }
};