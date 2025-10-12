const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes in this file require both authentication and admin role.
router.use(auth, requireAdmin);

// Core Content Management
router.post('/years', adminController.createYear);
router.post('/subjects', adminController.createSubject);
router.post('/resources', adminController.addResource); // Add note, syllabus, video

// Announcements and Holidays
router.post('/announcements', adminController.createAnnouncement);
router.post('/holidays', adminController.createHoliday);

// User Management (optional, but good for a full dashboard)
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);

// To update/delete content, you would add PUT/DELETE routes here (e.g., router.put('/subjects/:id', ...))

module.exports = router;