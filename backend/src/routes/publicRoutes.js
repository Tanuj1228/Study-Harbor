const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// --- Public Access Routes ---

// Core Structure
router.get('/years', publicController.getYears);
router.get('/years/:yearId/subjects', publicController.getSubjectsByYear);

// NEW ROUTE: Get single subject details by ID (Needed for SubjectPage title)
router.get('/subjects/:subjectId', publicController.getSubjectById); 

router.get('/subjects/:subjectId/resources', publicController.getResourcesBySubject);

// Information
router.get('/announcements', publicController.getAnnouncements);
router.get('/holidays', publicController.getHolidays);

// Search
router.get('/search/resources', publicController.searchResources);

// Route for Admin Dashboard dropdowns
router.get('/subjects', publicController.getAllSubjects); 

module.exports = router;