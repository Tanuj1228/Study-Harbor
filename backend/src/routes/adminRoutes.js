const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes in this file require both authentication and admin role.
router.use(auth, requireAdmin);

// Core Content Management (CREATE)
router.post('/years', adminController.createYear);
router.post('/subjects', adminController.createSubject);
router.post('/resources', adminController.addResource);

// Core Content Management (DELETE)
router.delete('/subjects/:id', adminController.deleteSubject); 
router.delete('/resources/:id', adminController.deleteResource); // <-- RESOURCE DELETE ROUTE

// Announcements and Holidays (CREATE)
router.post('/announcements', adminController.createAnnouncement);
router.post('/holidays', adminController.createHoliday);

// Announcements and Holidays (DELETE)
router.delete('/announcements/:id', adminController.deleteAnnouncement);
router.delete('/holidays/:id', adminController.deleteHoliday); // <-- HOLIDAY DELETE ROUTE

// QUOTE MANAGEMENT
router.post('/quotes', adminController.createQuote);
router.put('/quotes/:quoteId/set', adminController.setQuote);
router.get('/quotes', adminController.getAllQuotes);
router.delete('/quotes/:id', adminController.deleteQuote);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);

module.exports = router;