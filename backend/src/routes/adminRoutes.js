const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes in this file require both authentication and admin role.
router.use(auth, requireAdmin);

// 1. SUBJECTS (CRUD + GET List)
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:id', adminController.updateSubject); 
router.delete('/subjects/:id', adminController.deleteSubject); 
// FIX: Added GET route for subjects list for management tab
router.get('/subjects', adminController.getAllSubjectsAdmin); 

// 2. RESOURCES (CRUD)
router.post('/resources', adminController.addResource);
router.put('/resources/:id', adminController.updateResource); 
router.delete('/resources/:id', adminController.deleteResource);
router.get('/subjects/:subjectId/resources', adminController.getResourcesBySubjectAdmin); 

// 3. ANNOUNCEMENTS (CRUD + GET List)
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement); 
router.delete('/announcements/:id', adminController.deleteAnnouncement); 
// FIX: Added GET route for announcements list for management tab
router.get('/announcements', adminController.getAllAnnouncementsAdmin); 

// 4. HOLIDAYS (CRUD + GET List)
router.post('/holidays', adminController.createHoliday);
router.put('/holidays/:id', adminController.updateHoliday); 
router.delete('/holidays/:id', adminController.deleteHoliday); 
// FIX: Added GET route for holidays list for management tab
router.get('/holidays', adminController.getAllHolidaysAdmin); 


// QUOTE MANAGEMENT (Creation, Set, GET List)
router.post('/quotes', adminController.createQuote);
router.put('/quotes/:quoteId/set', adminController.setQuote);
router.get('/quotes', adminController.getAllQuotes); 

// USER MANAGEMENT 
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);

// Year Creation (Existing)
router.post('/years', adminController.createYear); 

module.exports = router;