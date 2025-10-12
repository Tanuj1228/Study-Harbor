// frontend/src/pages/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
// ADD Bell icon for Announcements tab
import { BookOpen, Calendar, Plus, FileText, Users, Bell } from 'lucide-react'; 

const AdminDashboard = () => {
    const [years, setYears] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [status, setStatus] = useState({ type: null, message: '' });
    const [activeTab, setActiveTab] = useState('resources');
    
    // Form States
    const [resourceForm, setResourceForm] = useState({ subjectId: '', title: '', type: 'note', driveWebViewLink: '', tags: '' });
    const [subjectForm, setSubjectForm] = useState({ yearId: '', code: '', title: '', description: '' });
    const [holidayForm, setHolidayForm] = useState({ date: '', title: '' });
    
    // UPDATED: Announcement Form State includes dateOfEvent
    const [announcementForm, setAnnouncementForm] = useState({ 
        title: '', 
        content: '', 
        type: 'exam', 
        pinned: false,
        dateOfEvent: '' // <-- NEW FIELD
    }); 


    useEffect(() => {
        // Fetch years and subjects to populate form selects
        const fetchData = async () => {
            try {
                // 1. Fetch Years and ALL Subjects simultaneously 
                const [yearsRes, subjectsRes] = await Promise.all([
                    api.get('/years'),
                    api.get('/subjects') 
                ]);
                
                // 2. Set state directly
                setYears(yearsRes.data);
                setSubjects(subjectsRes.data);
                
            } catch (err) {
                const msg = err.response?.data?.msg || 'Check backend server and MongoDB connection.';
                console.error("Failed to fetch prerequisite data:", err);
                setStatus({ type: 'error', message: `Failed to load prerequisite data: ${msg}` });
            }
        };
        fetchData();
    }, []); // Run only once on mount

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: null, message: '' }), 5000);
    };

    const handleChange = (e, formState, setFormState) => {
        const { name, value, type, checked } = e.target;
        setFormState({ 
            ...formState, 
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // --- Announcement Handler ---
    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            // The post data now includes the dateOfEvent field
            await api.post('/admin/announcements', announcementForm);
            showStatus('success', `Announcement "${announcementForm.title}" added successfully!`);
            // Reset form state, including the new field
            setAnnouncementForm({ title: '', content: '', type: 'exam', pinned: false, dateOfEvent: '' }); 
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add announcement. Check inputs.');
        }
    };


    // --- Other Handlers (Existing, kept for completeness) ---
    const handleResourceSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/resources', resourceForm);
            showStatus('success', `Resource "${resourceForm.title}" added successfully!`);
            setResourceForm({ subjectId: '', title: '', type: 'note', driveWebViewLink: '', tags: '' });
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add resource. Check inputs.');
        }
    };

    const handleSubjectSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/subjects', subjectForm);
            showStatus('success', `Subject "${subjectForm.title}" added successfully!`);
            setSubjectForm({ yearId: '', code: '', title: '', description: '' });
            
            const subjectsRes = await api.get('/subjects');
            setSubjects(subjectsRes.data);

        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add subject. Check inputs.');
        }
    };

    const handleHolidaySubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/holidays', holidayForm);
            showStatus('success', `Holiday "${holidayForm.title}" added successfully!`);
            setHolidayForm({ date: '', title: '' });
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add holiday. Check date format.');
        }
    };

    // --- Render Form based on Tab ---
    const renderForm = () => {
        // Form: Add Announcement
        if (activeTab === 'announcements') { 
             return (
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    <h4 className="text-xl font-semibold mb-3">Create New Announcement 📢</h4>
                    
                    {/* Title */}
                    <input type="text" required placeholder="Announcement Title (e.g., Midterm Schedule Released)" name="title" value={announcementForm.title} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} className="w-full p-3 border rounded-lg" />
                    
                    {/* Type Selector */}
                    <select
                        required
                        name="type"
                        value={announcementForm.type}
                        onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)}
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="exam">Exam/Academic Alert</option>
                        <option value="event">Event/Extracurricular</option>
                        <option value="general">General Information</option>
                    </select>
                    
                    {/* NEW: Date of Event/Exam Input */}
                    <input 
                        type="date" 
                        name="dateOfEvent" 
                        value={announcementForm.dateOfEvent} 
                        onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} 
                        className="w-full p-3 border rounded-lg" 
                        placeholder="Exam/Event Date (Optional)"
                    />

                    {/* Content */}
                    <textarea required placeholder="Full Announcement Details..." name="content" value={announcementForm.content} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} rows="4" className="w-full p-3 border rounded-lg resize-none" />
                    
                    {/* Pinned Checkbox */}
                    <div className="flex items-center space-x-3">
                         <input type="checkbox" id="pinned" name="pinned" checked={announcementForm.pinned} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} className="w-5 h-5 text-red-600 rounded" />
                         <label htmlFor="pinned" className="font-medium text-gray-700">Pin to Top (High Priority)</label>
                    </div>

                    <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg"><Bell className="w-5 h-5 inline mr-2" /> Publish Announcement</motion.button>
                </form>
            );
        }

        // Form: Add Subject/Years (Existing code)
        if (activeTab === 'subjects') {
            return (
                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                    <h4 className="text-xl font-semibold mb-3">Add New Subject</h4>
                    <select
                        required
                        name="yearId" 
                        value={subjectForm.yearId}
                        onChange={(e) => handleChange(e, subjectForm, setSubjectForm)}
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="">Select Year *</option>
                        {years.map(y => (
                            <option key={y._id} value={y._id}>
                                {y.displayName}
                            </option>
                        ))}
                    </select>
                    <input type="text" required placeholder="Subject Code (e.g., CS101)" name="code" value={subjectForm.code} onChange={(e) => handleChange(e, subjectForm, setSubjectForm)} className="w-full p-3 border rounded-lg" />
                    <input type="text" required placeholder="Subject Title" name="title" value={subjectForm.title} onChange={(e) => handleChange(e, subjectForm, setSubjectForm)} className="w-full p-3 border rounded-lg" />
                    <textarea placeholder="Description" name="description" value={subjectForm.description} onChange={(e) => handleChange(e, subjectForm, setSubjectForm)} className="w-full p-3 border rounded-lg resize-none" />
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg"><Plus className="w-5 h-5 inline mr-2" /> Add Subject</motion.button>
                </form>
            );
        }

        // Form: Add Holiday (Existing code)
        if (activeTab === 'holidays') {
            return (
                <form onSubmit={handleHolidaySubmit} className="space-y-4">
                    <h4 className="text-xl font-semibold mb-3">Add New Holiday</h4>
                    <input type="date" required name="date" value={holidayForm.date} onChange={(e) => handleChange(e, holidayForm, setHolidayForm)} className="w-full p-3 border rounded-lg" />
                    <input type="text" required placeholder="Holiday Title (e.g., Diwali Break)" name="title" value={holidayForm.title} onChange={(e) => handleChange(e, holidayForm, setHolidayForm)} className="w-full p-3 border rounded-lg" />
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-red-500 text-white font-bold rounded-lg"><Calendar className="w-5 h-5 inline mr-2" /> Add Holiday</motion.button>
                </form>
            );
        }

        // Default: Resources Tab (Existing code)
        return (
            <form onSubmit={handleResourceSubmit} className="space-y-4">
                <h4 className="text-xl font-semibold mb-3">Add New Resource (Manual Drive Link)</h4>
                <select
                    required
                    name="subjectId"
                    value={resourceForm.subjectId}
                    onChange={(e) => handleChange(e, resourceForm, setResourceForm)}
                    className="w-full p-3 border rounded-lg"
                >
                    <option value="">Select Subject *</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.title}</option>)}
                </select>
                <select
                    required
                    name="type"
                    value={resourceForm.type}
                    onChange={(e) => handleChange(e, resourceForm, setResourceForm)}
                    className="w-full p-3 border rounded-lg"
                >
                    <option value="note">Note</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="video">Video Link</option>
                    <option value="reference">Other Reference</option>
                </select>
                <input type="text" required placeholder="Resource Title" name="title" value={resourceForm.title} onChange={(e) => handleChange(e, resourceForm, setResourceForm)} className="w-full p-3 border rounded-lg" />
                <input type="url" required placeholder="Google Drive Share URL / Embed Link *" name="driveWebViewLink" value={resourceForm.driveWebViewLink} onChange={(e) => handleChange(e, resourceForm, setResourceForm)} className="w-full p-3 border rounded-lg" />
                <input type="text" placeholder="Tags (comma-separated)" name="tags" value={resourceForm.tags} onChange={(e) => handleChange(e, resourceForm, setResourceForm)} className="w-full p-3 border rounded-lg" />
                <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg"><FileText className="w-5 h-5 inline mr-2" /> Add Resource</motion.button>
            </form>
        );
    };

    return (
        <div className="py-8">
            <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-extrabold text-red-600 mb-8 flex items-center space-x-3 border-b pb-4"
            >
                <Users className="w-8 h-8" />
                <span>Admin Dashboard</span>
            </motion.h1>

            {/* Tabs Navigation */}
            <div className="flex space-x-2 border-b mb-6">
                <button onClick={() => setActiveTab('resources')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'resources' ? 'border-b-4 border-green-600 text-green-600' : 'text-gray-500'}`}><FileText className="w-5 h-5 inline mr-1" /> Add Resources</button>
                <button onClick={() => setActiveTab('subjects')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'subjects' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}><BookOpen className="w-5 h-5 inline mr-1" /> Add Subjects/Years</button>
                <button onClick={() => setActiveTab('holidays')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'holidays' ? 'border-b-4 border-red-600 text-red-600' : 'text-gray-500'}`}><Calendar className="w-5 h-5 inline mr-1" /> Add Holidays</button>
                <button onClick={() => setActiveTab('announcements')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'announcements' ? 'border-b-4 border-pink-600 text-pink-600' : 'text-gray-500'}`}><Bell className="w-5 h-5 inline mr-1" /> Announcements</button> {/* NEW TAB */}
            </div>

            {status.message && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={`p-4 mb-6 rounded-lg font-semibold ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                    {status.message}
                </motion.div>
            )}

            <div className="max-w-xl bg-white p-8 rounded-xl shadow-lg border">
                {renderForm()}
            </div>

            {/* Placeholder for Content Management (TODO: Annoucements/Users) - Removed old placeholder */}
        </div>
    );
};

export default AdminDashboard;