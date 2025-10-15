// frontend/src/pages/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { BookOpen, Calendar, Plus, FileText, Users, Bell, Globe } from 'lucide-react'; 

const AdminDashboard = () => {
    const [years, setYears] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [quoteForm, setQuoteForm] = useState({ quote: '', author: '' });

    const [status, setStatus] = useState({ type: null, message: '' });
    const [activeTab, setActiveTab] = useState('resources');
    
    // Form States
    // FIX/UPDATE: resourceForm includes 'description' and the new 'registrationLink'
    const [resourceForm, setResourceForm] = useState({ 
        subjectId: '', title: '', type: 'note', driveWebViewLink: '', tags: '', description: '', registrationLink: '' 
    }); 
    
    const [subjectForm, setSubjectForm] = useState({ yearId: '', code: '', title: '', description: '' });
    const [holidayForm, setHolidayForm] = useState({ date: '', title: '' });
    
    // CRITICAL UPDATE: Announcement Form State includes dateOfEvent AND registrationLink
    const [announcementForm, setAnnouncementForm] = useState({ 
        title: '', 
        content: '', 
        type: 'exam', 
        pinned: false,
        dateOfEvent: '',
        registrationLink: ''
    }); 


    useEffect(() => {
        // Fetch years, subjects, and current quotes to populate forms
        const fetchData = async () => {
            try {
                // Fetch calls for prerequisite data and quotes
                const [yearsRes, subjectsRes, quotesRes] = await Promise.all([
                    api.get('/years'),
                    api.get('/subjects'),
                    api.get('/admin/quotes') // ASSUMPTION: Admin route to get all quotes
                ]);
                
                setYears(yearsRes.data);
                setSubjects(subjectsRes.data);
                setQuotes(quotesRes.data); // Set all quotes for the management tab
                
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
    
    // --- Handlers ---

    // --- Quote Management Handlers ---
    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/quotes', quoteForm); // FIX: Added /admin prefix
            showStatus('success', `Quote added successfully!`);
            setQuoteForm({ quote: '', author: '' });
            // Re-fetch all quotes
            const quotesRes = await api.get('/admin/quotes'); 
            setQuotes(quotesRes.data);
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add quote.');
        }
    };

    const handleSetQuote = async (quoteId) => {
        try {
            await api.put(`/admin/quotes/${quoteId}/set`); // FIX: Added /admin prefix
            showStatus('success', 'Quote successfully set for the day!');
            // Re-fetch all quotes to update the 'isSelected' flag
            const quotesRes = await api.get('/admin/quotes'); 
            setQuotes(quotesRes.data);
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to set quote.');
        }
    };
    // --- End Quote Handlers ---


    // --- Announcement Handler ---
    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/announcements', announcementForm);
            showStatus('success', `Announcement "${announcementForm.title}" added successfully!`);
            setAnnouncementForm({ title: '', content: '', type: 'exam', pinned: false, dateOfEvent: '', registrationLink: '' }); 
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add announcement. Check inputs.');
        }
    };


    // --- Resource Handler ---
    const handleResourceSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/resources', resourceForm);
            showStatus('success', `Resource "${resourceForm.title}" added successfully!`);
            setResourceForm({ subjectId: '', title: '', type: 'note', driveWebViewLink: '', tags: '', description: '', registrationLink: '' }); 
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add resource. Check inputs.');
        }
    };

    // --- Subject Handler ---
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
        // Form: Quote Management
        if (activeTab === 'quotes') {
            return (
                <div className="space-y-6">
                    <form onSubmit={handleQuoteSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="text-xl font-semibold text-indigo-700 mb-3">Add New Quote</h4>
                        <textarea required placeholder="Quote Text" name="quote" value={quoteForm.quote} onChange={(e) => handleChange(e, quoteForm, setQuoteForm)} rows="3" className="w-full p-3 border rounded-lg resize-none" />
                        <input type="text" required placeholder="Author" name="author" value={quoteForm.author} onChange={(e) => handleChange(e, quoteForm, setQuoteForm)} className="w-full p-3 border rounded-lg" />
                        <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-indigo-500 text-white font-bold rounded-lg"><Plus className="w-5 h-5 inline mr-2" /> Save Quote</motion.button>
                    </form>

                    <h4 className="text-xl font-semibold border-b pb-2">Manage Quotes ({quotes.length})</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {quotes.map(q => (
                            <div key={q._id} className={`p-3 rounded-lg flex justify-between items-center ${q.isSelected ? 'bg-green-100 border border-green-500' : 'bg-white border'}`}>
                                <div>
                                    <p className="font-medium">"{q.quote.substring(0, 50)}..."</p>
                                    <p className="text-xs text-gray-500">- {q.author}</p>
                                </div>
                                <button 
                                    onClick={() => handleSetQuote(q._id)} 
                                    disabled={q.isSelected}
                                    className={`text-sm py-1 px-3 rounded-full transition-colors ${q.isSelected ? 'bg-green-500 text-white cursor-default' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    {q.isSelected ? 'CURRENTLY SET' : 'Set as Today'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Form: Add Announcement (Existing code)
        if (activeTab === 'announcements') { 
             return (
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    <h4 className="text-xl font-semibold mb-3">Create New Announcement 📢</h4>
                    
                    {/* Title */}
                    <input type="text" required placeholder="Announcement Title" name="title" value={announcementForm.title} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} className="w-full p-3 border rounded-lg" />
                    
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
                    
                    {/* Date Input */}
                    <input 
                        type="date" 
                        name="dateOfEvent" 
                        value={announcementForm.dateOfEvent} 
                        onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} 
                        className="w-full p-3 border rounded-lg" 
                        placeholder="Exam/Event Date (Optional)"
                    />
                    
                    {/* NEW INPUT: Registration Link (Conditional for 'event' type) */}
                    {announcementForm.type === 'event' && (
                         <input 
                            type="url" 
                            name="registrationLink" 
                            value={announcementForm.registrationLink} 
                            onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} 
                            className="w-full p-3 border border-indigo-300 rounded-lg" 
                            placeholder="Registration/Sign-up Link (Required for Events)"
                        />
                    )}

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
                    {/* FIX: Corrected all handleChange calls to use setSubjectForm */}
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
                
                {/* ADDED DESCRIPTION TEXTAREA */}
                <textarea 
                    placeholder="Brief description or context for the resource (Optional)" 
                    name="description" 
                    value={resourceForm.description} 
                    onChange={(e) => handleChange(e, resourceForm, setResourceForm)} 
                    className="w-full p-3 border rounded-lg resize-none"
                    rows="3"
                />

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
                <button onClick={() => setActiveTab('quotes')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'quotes' ? 'border-b-4 border-indigo-500 text-indigo-500' : 'text-gray-500'}`}><Globe className="w-5 h-5 inline mr-1" /> Quotes</button> {/* NEW QUOTE TAB */}
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
        </div>
    );
};

export default AdminDashboard;