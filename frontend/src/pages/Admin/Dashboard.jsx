// frontend/src/pages/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
// Ensure Trash2 is imported here
import { BookOpen, Calendar, Plus, FileText, Users, Bell, Globe, Trash2 } from 'lucide-react'; 

const AdminDashboard = () => {
    // --- STATE ---
    const [years, setYears] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [resourcesList, setResourcesList] = useState([]); // State for resources list
    const [holidaysList, setHolidaysList] = useState([]); // State for holidays list
    
    const [status, setStatus] = useState({ type: null, message: '' });
    const [activeTab, setActiveTab] = useState('resources');
    
    // Form States
    const [quoteForm, setQuoteForm] = useState({ quote: '', author: '' });
    const [resourceForm, setResourceForm] = useState({ 
        subjectId: '', title: '', type: 'note', driveWebViewLink: '', tags: '', description: '', registrationLink: '' 
    }); 
    const [subjectForm, setSubjectForm] = useState({ yearId: '', code: '', title: '', description: '' });
    const [holidayForm, setHolidayForm] = useState({ date: '', title: '' });
    const [announcementForm, setAnnouncementForm] = useState({ 
        title: '', content: '', type: 'exam', pinned: false, dateOfEvent: '', registrationLink: ''
    }); 


    // --- DATA FETCHING FUNCTIONS ---
    const fetchResources = async () => {
        try {
            const res = await api.get('/admin/resources'); 
            setResourcesList(res.data);
        } catch (err) {
            console.error("Failed to fetch resources list:", err);
        }
    };

    const fetchHolidaysList = async () => {
        try {
            const holRes = await api.get('/holidays'); 
            setHolidaysList(holRes.data);
        } catch (err) {
            console.error("Failed to fetch holidays list:", err);
        }
    };
    
    const fetchQuotes = async () => { 
        try {
            const quotesRes = await api.get('/admin/quotes'); 
            setQuotes(quotesRes.data);
        } catch (err) {
            console.error("Failed to fetch quotes:", err);
        }
    };

    const fetchSubjects = async () => { 
        try {
            const subjectsRes = await api.get('/subjects');
            setSubjects(subjectsRes.data);
        } catch (err) {
            console.error("Failed to fetch subjects:", err);
        }
    };
    
    const fetchAnnouncements = async () => { 
        try {
            const annRes = await api.get('/announcements');
            setAnnouncements(annRes.data);
        } catch (err) {
            console.error("Failed to fetch announcements list:", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [yearsRes] = await Promise.all([api.get('/years')]);
                setYears(yearsRes.data);
                
                await fetchSubjects();
                await fetchQuotes();
                await fetchAnnouncements();
                await fetchHolidaysList(); 
                await fetchResources();
                
            } catch (err) {
                const msg = err.response?.data?.msg || 'Check backend connection.';
                console.error("Failed to fetch prerequisite data:", err);
                setStatus({ type: 'error', message: `Failed to load prerequisite data: ${msg}` });
            }
        };
        fetchData();
    }, []); 

    // --- HELPER FUNCTIONS ---
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
    
    // --- DELETE HANDLERS ---
    
    const handleDeleteQuote = async (id, quoteText) => {
        if (window.confirm(`Are you sure you want to delete the quote: "${quoteText.substring(0, 30)}..."?`)) {
             try {
                await api.delete(`/admin/quotes/${id}`); 
                showStatus('success', 'Quote deleted.');
                setQuotes(quotes.filter(q => q._id !== id));
            } catch (err) {
                showStatus('error', err.response?.data?.msg || 'Failed to delete quote.');
            }
        }
    };
    
    const handleDeleteSubject = async (id, subjectTitle) => {
        if (window.confirm(`WARNING: This will delete all resources linked to "${subjectTitle}". Proceed?`)) {
             try {
                await api.delete(`/admin/subjects/${id}`); 
                showStatus('success', `Subject "${subjectTitle}" and all resources deleted.`);
                await fetchSubjects(); 
                await fetchResources();
            } catch (err) {
                showStatus('error', err.response?.data?.msg || 'Failed to delete subject.');
            }
        }
    };
    
    const handleDeleteResource = async (id, resourceTitle) => {
        if (window.confirm(`Are you sure you want to delete the resource: "${resourceTitle}"?`)) {
             try {
                await api.delete(`/admin/resources/${id}`); 
                showStatus('success', `Resource "${resourceTitle}" deleted.`);
                await fetchResources(); // Refresh resource list
            } catch (err) {
                showStatus('error', err.response?.data?.msg || 'Failed to delete resource.');
            }
        }
    };
    
    const handleDeleteAnnouncement = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete the announcement: "${title}"?`)) {
             try {
                await api.delete(`/admin/announcements/${id}`); 
                showStatus('success', 'Announcement deleted.');
                await fetchAnnouncements(); 
            } catch (err) {
                showStatus('error', err.response?.data?.msg || 'Failed to delete announcement.');
            }
        }
    };
    
    const handleDeleteHoliday = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete the holiday: "${title}"?`)) {
             try {
                await api.delete(`/admin/holidays/${id}`); 
                showStatus('success', 'Holiday deleted.');
                await fetchHolidaysList(); // Refresh the list
            } catch (err) {
                showStatus('error', err.response?.data?.msg || 'Failed to delete holiday.');
            }
        }
    };
    // --- END DELETE HANDLERS ---

    // --- SUBMISSION HANDLERS ---
    
    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/quotes', quoteForm); 
            showStatus('success', `Quote added successfully!`);
            setQuoteForm({ quote: '', author: '' });
            await fetchQuotes();
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add quote.');
        }
    };

    const handleSetQuote = async (quoteId) => {
        try {
            await api.put(`/admin/quotes/${quoteId}/set`);
            showStatus('success', 'Quote successfully set for the day!');
            await fetchQuotes(); 
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to set quote.');
        }
    };
    
    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/announcements', announcementForm);
            showStatus('success', `Announcement "${announcementForm.title}" added successfully!`);
            setAnnouncementForm({ title: '', content: '', type: 'exam', pinned: false, dateOfEvent: '', registrationLink: '' }); 
            await fetchAnnouncements();
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add announcement. Check inputs.');
        }
    };

    const handleResourceSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/resources', resourceForm);
            showStatus('success', `Resource "${resourceForm.title}" added successfully!`);
            setResourceForm({ subjectId: '', title: '', type: 'note', driveWebViewLink: '', tags: '', description: '', registrationLink: '' }); 
            await fetchResources();
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
            
            await fetchSubjects();
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
            await fetchHolidaysList();
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add holiday. Check date format.');
        }
    };
    // --- END SUBMISSION HANDLERS ---


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
                                <div className="flex-grow pr-4">
                                    <p className="font-medium">"{q.quote.substring(0, 50)}..."</p>
                                    <p className="text-xs text-gray-500">- {q.author}</p>
                                </div>
                                <div className="flex space-x-2 items-center flex-shrink-0">
                                    <button 
                                        onClick={() => handleDeleteQuote(q._id, q.quote)} 
                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleSetQuote(q._id)} 
                                        disabled={q.isSelected}
                                        className={`text-sm py-1 px-3 rounded-full transition-colors ${q.isSelected ? 'bg-green-500 text-white cursor-default' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    >
                                        {q.isSelected ? 'CURRENTLY SET' : 'Set as Today'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Form: Add Announcement (WITH DELETE LIST)
        if (activeTab === 'announcements') { 
             return (
                <div className="space-y-6">
                    <form onSubmit={handleAnnouncementSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="text-xl font-semibold mb-3">Create New Announcement 📢</h4>
                        {/* ... (announcement form fields are correct) ... */}
                        <input type="text" required placeholder="Announcement Title" name="title" value={announcementForm.title} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} className="w-full p-3 border rounded-lg" />
                        <select required name="type" value={announcementForm.type} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} className="w-full p-3 border rounded-lg">
                            <option value="exam">Exam/Academic Alert</option>
                            <option value="event">Event/Extracurricular</option>
                            <option value="general">General Information</option>
                        </select>
                        <input type="date" name="dateOfEvent" value={announcementForm.dateOfEvent} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} className="w-full p-3 border rounded-lg" placeholder="Exam/Event Date (Optional)" />
                        {announcementForm.type === 'event' && (
                             <input type="url" name="registrationLink" value={announcementForm.registrationLink} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} className="w-full p-3 border border-indigo-300 rounded-lg" placeholder="Registration/Sign-up Link (Required for Events)" />
                        )}
                        <textarea required placeholder="Full Announcement Details..." name="content" value={announcementForm.content} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} rows="4" className="w-full p-3 border rounded-lg resize-none" />
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" id="pinned" name="pinned" checked={announcementForm.pinned} onChange={(e) => handleChange(e, announcementForm, setAnnouncementForm)} className="w-5 h-5 text-red-600 rounded" />
                            <label htmlFor="pinned" className="font-medium text-gray-700">Pin to Top (High Priority)</label>
                        </div>
                        <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg"><Bell className="w-5 h-5 inline mr-2" /> Publish Announcement</motion.button>
                    </form>
                    
                    {/* Annoucement List for Deletion */}
                    <h4 className="text-xl font-semibold border-b pb-2">Manage Announcements ({announcements.length})</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {announcements.map(ann => (
                            <div key={ann._id} className="p-3 bg-white border rounded-lg flex justify-between items-center">
                                <div className="flex-grow pr-4">
                                    <p className="font-medium">{ann.title} <span className="text-xs text-red-600">({ann.type.toUpperCase()})</span></p>
                                    <p className="text-xs text-gray-500">
                                        Date: {ann.dateOfEvent ? new Date(ann.dateOfEvent).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteAnnouncement(ann._id, ann.title)} 
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Form: Add Subject/Years (UPDATED with Delete List)
        if (activeTab === 'subjects') {
            return (
                <div className="space-y-6">
                    <form onSubmit={handleSubjectSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="text-xl font-semibold mb-3">Add New Subject</h4>
                        <select required name="yearId" value={subjectForm.yearId} onChange={(e) => handleChange(e, subjectForm, setSubjectForm)} className="w-full p-3 border rounded-lg">
                            <option value="">Select Year *</option>
                            {years.map(y => (<option key={y._id} value={y._id}>{y.displayName}</option>))}
                        </select>
                        <input type="text" required placeholder="Subject Code (e.g., CS101)" name="code" value={subjectForm.code} onChange={(e) => handleChange(e, subjectForm, setSubjectForm)} className="w-full p-3 border rounded-lg" />
                        <input type="text" required placeholder="Subject Title" name="title" value={subjectForm.title} onChange={(e) => handleChange(e, subjectForm, setSubjectForm)} className="w-full p-3 border rounded-lg" />
                        <textarea placeholder="Description" name="description" value={subjectForm.description} onChange={(e) => handleChange(e, subjectForm, setSubjectForm)} className="w-full p-3 border rounded-lg resize-none" />
                        <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg"><Plus className="w-5 h-5 inline mr-2" /> Add Subject</motion.button>
                    </form>

                    {/* Subject List for Deletion */}
                    <h4 className="text-xl font-semibold border-b pb-2">Manage Subjects ({subjects.length})</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {subjects.map(s => (
                            <div key={s._id} className="p-3 bg-white border rounded-lg flex justify-between items-center">
                                <div className="flex-grow pr-4">
                                    <p className="font-medium">{s.title} ({s.code})</p>
                                    <p className="text-xs text-gray-500">Year: {years.find(y => y._id === s.yearId)?.displayName}</p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteSubject(s._id, s.title)} 
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Form: Add Holiday (FIXED: NOW WITH DELETE LIST)
        if (activeTab === 'holidays') {
            return (
                <div className="space-y-6">
                    <form onSubmit={handleHolidaySubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="text-xl font-semibold mb-3">Add New Holiday</h4>
                        <input type="date" required name="date" value={holidayForm.date} onChange={(e) => handleChange(e, holidayForm, setHolidayForm)} className="w-full p-3 border rounded-lg" />
                        <input type="text" required placeholder="Holiday Title (e.g., Diwali Break)" name="title" value={holidayForm.title} onChange={(e) => handleChange(e, holidayForm, setHolidayForm)} className="w-full p-3 border rounded-lg" />
                        <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-red-500 text-white font-bold rounded-lg"><Calendar className="w-5 h-5 inline mr-2" /> Add Holiday</motion.button>
                    </form>
                    
                    {/* HOLIDAY LIST FOR DELETION */}
                    <h4 className="text-xl font-semibold border-b pb-2">Manage Holidays ({holidaysList.length})</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {holidaysList.map(h => (
                            <div key={h._id} className="p-3 bg-white border rounded-lg flex justify-between items-center">
                                <div className="flex-grow pr-4">
                                    <p className="font-medium">{h.title}</p>
                                    <p className="text-xs text-gray-500">Date: {new Date(h.date).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteHoliday(h._id, h.title)} 
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Default: Resources Tab (FIXED: IMPLEMENTED DELETE LIST)
        if (activeTab === 'resources') {
            return (
                <div className="space-y-6">
                    <form onSubmit={handleResourceSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="text-xl font-semibold mb-3">Add New Resource (Manual Drive Link)</h4>
                        <select required name="subjectId" value={resourceForm.subjectId} onChange={(e) => handleChange(e, resourceForm, setResourceForm)} className="w-full p-3 border rounded-lg">
                            <option value="">Select Subject *</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.title}</option>)}
                        </select>
                        <select required name="type" value={resourceForm.type} onChange={(e) => handleChange(e, resourceForm, setResourceForm)} className="w-full p-3 border rounded-lg">
                            <option value="note">Note</option>
                            <option value="syllabus">Syllabus</option>
                            <option value="video">Video Link</option>
                            <option value="reference">Other Reference</option>
                        </select>
                        <input type="text" required placeholder="Resource Title" name="title" value={resourceForm.title} onChange={(e) => handleChange(e, resourceForm, setResourceForm)} className="w-full p-3 border rounded-lg" />
                        <textarea placeholder="Brief description or context for the resource (Optional)" name="description" value={resourceForm.description} onChange={(e) => handleChange(e, resourceForm, setResourceForm)} className="w-full p-3 border rounded-lg resize-none" rows="3" />
                        <input type="url" required placeholder="Google Drive Share URL / Embed Link *" name="driveWebViewLink" value={resourceForm.driveWebViewLink} onChange={(e) => handleChange(e, resourceForm, setResourceForm)} className="w-full p-3 border rounded-lg" />
                        <input type="text" placeholder="Tags (comma-separated)" name="tags" value={resourceForm.tags} onChange={(e) => handleChange(e, resourceForm, setResourceForm)} className="w-full p-3 border rounded-lg" />
                        <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg"><FileText className="w-5 h-5 inline mr-2" /> Add Resource</motion.button>
                    </form>

                    {/* RESOURCE LIST FOR DELETION */}
                    <h4 className="text-xl font-semibold border-b pb-2">Manage Resources ({resourcesList.length})</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {resourcesList.map(r => (
                            <div key={r._id} className="p-3 bg-white border rounded-lg flex justify-between items-center">
                                <div className="flex-grow pr-4">
                                    <p className="font-medium">{r.title} <span className="text-xs text-gray-500">({r.type.toUpperCase()})</span></p>
                                    <p className="text-xs text-gray-500">Subject: {subjects.find(s => s._id === r.subjectId)?.code || 'N/A'}</p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteResource(r._id, r.title)} 
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        
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