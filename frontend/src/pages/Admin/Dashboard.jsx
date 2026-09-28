// frontend/src/pages/Admin/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
// RESTORED IMPORT: AdminEditModal must be present for the Edit button to work
import AdminEditModal from '../../components/AdminEditModal.jsx'; 
import { BookOpen, Calendar, Plus, FileText, Users, Bell, Globe, Edit, Trash2, List, Search } from 'lucide-react'; 

const AdminDashboard = () => {
    const [years, setYears] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [announcementsList, setAnnouncementsList] = useState([]); 
    const [holidaysList, setHolidaysList] = useState([]); 

    // NEW STATE: Resource Management View
    const [selectedSubjectId, setSelectedSubjectId] = useState(''); 
    const [manageResourcesList, setManageResourcesList] = useState([]); 
    const [isResourceLoading, setIsResourceLoading] = useState(false);
    
    // Search Query for management tab
    const [managementSearchQuery, setManagementSearchQuery] = useState(''); 

    const [quoteForm, setQuoteForm] = useState({ quote: '', author: '' });

    const [status, setStatus] = useState({ type: null, message: '' });
    const [activeTab, setActiveTab] = useState('manage'); // Start on the Manage tab
    
    // RESTORED STATE: Edit Modal Management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editType, setEditType] = useState(null);

    // Form States (All correct)
    const [resourceForm, setResourceForm] = useState({ subjectId: '', title: '', type: 'note', driveWebViewLink: '', tags: '', description: '', registrationLink: '' }); 
    const [subjectForm, setSubjectForm] = useState({ yearId: '', code: '', title: '', description: '' });
    const [holidayForm, setHolidayForm] = useState({ date: '', title: '' });
    const [announcementForm, setAnnouncementForm] = useState({ 
        title: '', content: '', type: 'exam', pinned: false, dateOfEvent: '', registrationLink: ''
    }); 


    // --- Core Data Fetcher ---
    const refreshAllData = async () => {
        try {
            const [yearsRes, subjectsRes, quotesRes, annRes, holRes] = await Promise.all([
                api.get('/years').catch(err => { console.error("Fetch Error: Years", err); return { data: [] }; }), 
                api.get('/admin/subjects').catch(err => { console.error("Fetch Error: Subjects", err); return { data: [] }; }), 
                api.get('/admin/quotes').catch(err => { console.error("Fetch Error: Quotes", err); return { data: [] }; }),     
                api.get('/admin/announcements').catch(err => { return { data: [] }; }), 
                api.get('/admin/holidays').catch(err => { return { data: [] }; }), 
            ]);
            
            setYears(yearsRes.data || []);
            setSubjects(subjectsRes.data || []);
            setQuotes(quotesRes.data || []);
            setAnnouncementsList(annRes.data || []);
            setHolidaysList(holRes.data || []);
            
            console.log("✅ Data Fetch Success:", {
                Subjects: subjectsRes.data ? subjectsRes.data.length : 0,
                Announcements: annRes.data ? annRes.data.length : 0,
                Quotes: quotesRes.data ? quotesRes.data.length : 0
            });
            
        } catch (err) {
            const msg = err.response?.data?.msg || 'Critical network error occurred during fetch.';
            console.error("❌ Overall Data Fetch Failed:", err.message);
            setStatus({ type: 'error', message: `Critical failure loading data: ${msg}` });
        }
    };
    
    useEffect(() => {
        refreshAllData();
    }, []); 

    // NEW EFFECT: Fetch resources when a subject is selected for management
    useEffect(() => {
        if (selectedSubjectId) {
            const fetchResources = async () => {
                setIsResourceLoading(true);
                try {
                    // Use the new secure admin route to fetch resources by subject
                    const res = await api.get(`/admin/subjects/${selectedSubjectId}/resources`);
                    setManageResourcesList(res.data);
                } catch (err) {
                    console.error("Failed to fetch subject resources for admin:", err);
                    setStatus({ type: 'error', message: 'Failed to load resources for selected subject.' });
                    setManageResourcesList([]);
                } finally {
                    setIsResourceLoading(false);
                }
            };
            fetchResources();
        } else {
            setManageResourcesList([]);
        }
    }, [selectedSubjectId]);


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
    
    // RESTORED: Handler to open the edit modal
    const openEditModal = (item, type) => {
        setItemToEdit(item);
        setEditType(type);
        setIsModalOpen(true); // <--- Opens the modal
    };

    // RESTORED: Handler to update data after modal close
    const handleUpdateSuccess = (type, updatedPayload) => {
        showStatus('success', `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
        refreshAllData(); 
        setIsModalOpen(false);
        // If a resource was updated, clear subject to refresh resource list
        if (type === 'resources') {
            setSelectedSubjectId('');
        }
    };

    // Deletion Handler (Generic - KEPT THIS)
    const handleDelete = async (endpoint, id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone and may delete linked content.`)) {
            return;
        }
        try {
            await api.delete(`/admin/${endpoint}/${id}`);
            showStatus('success', `${name} deleted successfully!`);
            
            // If deleting a resource, refresh the list by clearing the selector
            if (endpoint === 'resources') {
                setSelectedSubjectId(''); 
            } else {
                refreshAllData(); // Refresh main lists for subjects/announcements/holidays
            }

        } catch (err) {
            showStatus('error', `Failed to delete ${name}. Ensure all related items (e.g., resources under a subject) are removed first.`);
        }
    };
    
    // --- Submission Handlers (All correct) ---
    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/quotes', quoteForm);
            showStatus('success', `Quote added successfully!`);
            setQuoteForm({ quote: '', author: '' });
            refreshAllData();
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add quote.');
        }
    };

    const handleSetQuote = async (quoteId) => {
        try {
            await api.put(`/admin/quotes/${quoteId}/set`);
            showStatus('success', 'Quote successfully set for the day!');
            refreshAllData();
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
            refreshAllData();
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
            refreshAllData();
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
            refreshAllData(); 
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
            refreshAllData();
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add holiday. Check date format.');
        }
    };


    // NEW LOGIC: Filter Lists based on search query
    const filteredManagementLists = useMemo(() => {
        if (!managementSearchQuery) {
            return { subjects, announcementsList, holidaysList };
        }

        const query = managementSearchQuery.toLowerCase();
        
        const filter = (list) => list.filter(item => 
            item.title.toLowerCase().includes(query) ||
            (item.code && item.code.toLowerCase().includes(query)) ||
            (item.quote && item.quote.toLowerCase().includes(query))
        );

        return {
            subjects: filter(subjects),
            announcementsList: filter(announcementsList),
            holidaysList: filter(holidaysList),
        };
    }, [managementSearchQuery, subjects, announcementsList, holidaysList]);


    // --- Render Management List Component ---
    const ManagementList = ({ items, endpoint, titleKey, actionKey }) => {
        const type = endpoint;
        return (
            <div className="space-y-3 max-h-96 overflow-y-auto border p-3 rounded-lg bg-white shadow-inner">
                <h4 className="text-lg font-bold text-gray-700 border-b pb-2">{actionKey} ({items.length})</h4>
                {items.length === 0 && <p className="text-gray-500 text-sm">No items added yet.</p>}
                {items.map(item => (
                    <motion.div 
                        key={item._id} 
                        className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span className="font-medium text-sm w-3/4 truncate">{item[titleKey]}</span>
                        <div className="flex space-x-2">
                            {/* RESTORED: Edit Button onClick is now functional */}
                            <button 
                                onClick={() => openEditModal(item, type)} 
                                className="p-1 text-indigo-500 hover:text-indigo-700 transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            {/* Delete Button */}
                            <button 
                                onClick={() => handleDelete(endpoint, item._id, item[titleKey])} 
                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    // --- Render Form based on Tab ---
    const renderForm = () => {
        
        // Tab: Manage Content 
        if (activeTab === 'manage') {
            return (
                <div className="space-y-8">
                    <h4 className="text-xl font-semibold mb-3 text-indigo-700">Manage Existing Content</h4>

                    {/* NEW SECTION: Manage Resources by Subject (PRIMARY FOCUS) */}
                    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                         <h5 className="font-bold text-base text-gray-700 border-b pb-2">Delete Resource by Subject</h5>
                         <select
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                        >
                            <option value="">-- Select Subject to Manage Resources --</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.title}</option>)}
                        </select>
                        
                        {/* Resource List for Selected Subject */}
                        {isResourceLoading && <p className="text-center text-indigo-500 text-sm">Loading resources...</p>}
                        
                        {!isResourceLoading && selectedSubjectId && (
                            <ManagementList 
                                items={manageResourcesList} 
                                endpoint="resources" // Use 'resources' endpoint for deletion
                                titleKey="title" 
                                actionKey={`Resources for ${subjects.find(s => s._id === selectedSubjectId)?.code}`}
                            />
                        )}
                        
                        {!isResourceLoading && selectedSubjectId && manageResourcesList.length === 0 && (
                            <p className="text-gray-500 text-sm p-2">No resources found for this subject.</p>
                        )}
                    </div>
                    {/* END NEW SECTION */}
                    
                    {/* Search Bar for Management */}
                    <div className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow-inner border">
                        <Search className="w-5 h-5 text-gray-400 ml-2" />
                        <input
                            type="text"
                            placeholder="Search Subjects, Announcements, or Holidays..."
                            value={managementSearchQuery}
                            onChange={(e) => setManagementSearchQuery(e.target.value)} // Real-time update
                            className="flex-grow p-2 border-none focus:ring-0 focus:outline-none text-gray-700"
                        />
                    </div>
                    
                    {/* Subjects List (Filtered) */}
                    <ManagementList 
                        items={filteredManagementLists.subjects} 
                        endpoint="subjects" 
                        titleKey="title" 
                        actionKey="Subjects (Edit/Delete)"
                    />
                    {/* Announcements List (Filtered) */}
                    <ManagementList 
                        items={filteredManagementLists.announcementsList} 
                        endpoint="announcements" 
                        titleKey="title" 
                        actionKey="Announcements (Edit/Delete)"
                    />
                    {/* Holidays List (Filtered) */}
                    <ManagementList 
                        items={filteredManagementLists.holidaysList} 
                        endpoint="holidays" 
                        titleKey="title" 
                        actionKey="Holidays (Edit/Delete)"
                    />
                </div>
            );
        }

        // Tab: Quote Management
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

        // Tab: Add Announcement (Existing code)
        if (activeTab === 'announcements') { 
             return (
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    <h4 className="text-xl font-semibold mb-3">Create New Announcement 📢</h4>
                    
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
            );
        }

        // Tab: Add Subject/Years (Existing code)
        if (activeTab === 'subjects') {
            return (
                <form onSubmit={handleSubjectSubmit} className="space-y-4">
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
            );
        }

        // Tab: Add Holiday (Existing code)
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
        <>
            <AdminEditModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={itemToEdit}
                type={editType}
                onUpdateSuccess={handleUpdateSuccess}
                years={years} 
                subjects={subjects} 
            />

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
                    <button onClick={() => setActiveTab('announcements')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'announcements' ? 'border-b-4 border-pink-600 text-pink-600' : 'text-gray-500'}`}><Bell className="w-5 h-5 inline mr-1" /> Announcements</button>
                    <button onClick={() => setActiveTab('quotes')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'quotes' ? 'border-b-4 border-indigo-500 text-indigo-500' : 'text-gray-500'}`}><Globe className="w-5 h-5 inline mr-1" /> Quotes</button>
                    <button onClick={() => setActiveTab('manage')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'manage' ? 'border-b-4 border-yellow-600 text-yellow-600' : 'text-gray-500'}`}><List className="w-5 h-5 inline mr-1" /> Manage Content</button>
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

                {/* FIX: Use one container logic to display either the form or the management lists */}
                <div className={`${activeTab !== 'manage' ? 'max-w-xl' : 'max-w-full'} bg-white p-8 rounded-xl shadow-lg border`}>
                    {renderForm()}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;