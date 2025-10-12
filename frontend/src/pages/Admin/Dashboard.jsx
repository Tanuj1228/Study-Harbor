// frontend/src/pages/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { BookOpen, Calendar, Plus, FileText, User, Users } from 'lucide-react';

const AdminDashboard = () => {
    const [years, setYears] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [status, setStatus] = useState({ type: null, message: '' });
    const [activeTab, setActiveTab] = useState('resources');
    
    // Form States
    const [resourceForm, setResourceForm] = useState({ subjectId: '', title: '', type: 'note', driveWebViewLink: '', tags: '' });
    const [subjectForm, setSubjectForm] = useState({ yearId: '', code: '', title: '', description: '' });
    const [holidayForm, setHolidayForm] = useState({ date: '', title: '' });


    useEffect(() => {
        // Fetch years and subjects to populate form selects
        const fetchData = async () => {
            try {
                const [yearsRes, subjectsRes] = await Promise.all([
                    api.get('/years'),
                    api.get('/subjects') // NOTE: We don't have a GET /api/subjects yet, assuming the old GET /years will do for now.
                ]);
                setYears(yearsRes.data);
                
                // Temporary simplified subject fetch (get all subjects from all years)
                // This is a known simplification; a specific /api/subjects endpoint is needed for scale
                let allSubjects = [];
                for (const year of yearsRes.data) {
                    const subjects = await api.get(`/years/${year._id}/subjects`);
                    allSubjects = [...allSubjects, ...subjects.data];
                }
                setSubjects(allSubjects);

            } catch (err) {
                console.error("Failed to fetch data for Admin:", err);
                setStatus({ type: 'error', message: 'Failed to load prerequisite data (Years/Subjects).' });
            }
        };
        fetchData();
    }, []);

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: null, message: '' }), 5000);
    };

    // --- Handlers ---
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
            // Re-fetch subjects list
            // NOTE: A more complex fetch is needed here for a full solution.
        } catch (err) {
            showStatus('error', err.response?.data?.msg || 'Failed to add subject. Check yearId.');
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
        if (activeTab === 'subjects') {
            return (
                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                    <h4 className="text-xl font-semibold mb-3">Add New Subject</h4>
                    <select
                        required
                        value={subjectForm.yearId}
                        onChange={(e) => setSubjectForm({ ...subjectForm, yearId: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="">Select Year *</option>
                        {years.map(y => <option key={y._id} value={y._id}>{y.displayName}</option>)}
                    </select>
                    <input type="text" required placeholder="Subject Code (e.g., CS101)" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} className="w-full p-3 border rounded-lg" />
                    <input type="text" required placeholder="Subject Title" value={subjectForm.title} onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })} className="w-full p-3 border rounded-lg" />
                    <textarea placeholder="Description" value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} className="w-full p-3 border rounded-lg resize-none" />
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg"><Plus className="w-5 h-5 inline mr-2" /> Add Subject</motion.button>
                </form>
            );
        }

        if (activeTab === 'holidays') {
            return (
                <form onSubmit={handleHolidaySubmit} className="space-y-4">
                    <h4 className="text-xl font-semibold mb-3">Add New Holiday</h4>
                    <input type="date" required value={holidayForm.date} onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })} className="w-full p-3 border rounded-lg" />
                    <input type="text" required placeholder="Holiday Title (e.g., Diwali Break)" value={holidayForm.title} onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })} className="w-full p-3 border rounded-lg" />
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full py-3 bg-red-500 text-white font-bold rounded-lg"><Calendar className="w-5 h-5 inline mr-2" /> Add Holiday</motion.button>
                </form>
            );
        }

        // Default: Resources Tab
        return (
            <form onSubmit={handleResourceSubmit} className="space-y-4">
                <h4 className="text-xl font-semibold mb-3">Add New Resource (Manual Drive Link)</h4>
                <select
                    required
                    value={resourceForm.subjectId}
                    onChange={(e) => setResourceForm({ ...resourceForm, subjectId: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                >
                    <option value="">Select Subject *</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.title}</option>)}
                </select>
                <select
                    required
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                >
                    <option value="note">Note</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="video">Video Link</option>
                    <option value="reference">Other Reference</option>
                </select>
                <input type="text" required placeholder="Resource Title" value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full p-3 border rounded-lg" />
                <input type="url" required placeholder="Google Drive Share URL / Embed Link *" value={resourceForm.driveWebViewLink} onChange={(e) => setResourceForm({ ...resourceForm, driveWebViewLink: e.target.value })} className="w-full p-3 border rounded-lg" />
                <input type="text" placeholder="Tags (comma-separated)" value={resourceForm.tags} onChange={(e) => setResourceForm({ ...resourceForm, tags: e.target.value })} className="w-full p-3 border rounded-lg" />
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

            <div className="flex space-x-2 border-b mb-6">
                <button onClick={() => setActiveTab('resources')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'resources' ? 'border-b-4 border-green-600 text-green-600' : 'text-gray-500'}`}><FileText className="w-5 h-5 inline mr-1" /> Add Resources</button>
                <button onClick={() => setActiveTab('subjects')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'subjects' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}><BookOpen className="w-5 h-5 inline mr-1" /> Add Subjects/Years</button>
                <button onClick={() => setActiveTab('holidays')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'holidays' ? 'border-b-4 border-red-600 text-red-600' : 'text-gray-500'}`}><Calendar className="w-5 h-5 inline mr-1" /> Add Holidays</button>
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

            {/* Placeholder for Content Management (TODO: Annoucements/Users) */}
            <div className="mt-10 p-6 bg-yellow-50/50 border border-yellow-200 rounded-xl">
                <h3 className="font-bold text-lg text-yellow-800">Next Admin Steps:</h3>
                <p className="text-sm text-yellow-700">Implement form for **Announcements** (pinning/unpinning) and a simple list view for **User Management** (promote/demote role, view feedback).</p>
            </div>
        </div>
    );
};

export default AdminDashboard;