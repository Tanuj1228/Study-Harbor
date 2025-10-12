const Year = require('../models/Year');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Holiday = require('../models/Holiday');

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
    try {
        // Show pinned first, then chronological
        const announcements = await Announcement.find().sort({ pinned: -1, createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ msg: 'Server error fetching announcements.' });
    }
};

// 3. Holidays
exports.getHolidays = async (req, res) => {
    // Allows filtering by month or year if needed, but for MVP, return all future holidays
    try {
        const holidays = await Holiday.find({ date: { $gte: new Date() } }).sort({ date: 1 });
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