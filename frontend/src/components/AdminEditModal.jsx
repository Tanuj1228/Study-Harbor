// frontend/src/components/AdminEditModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Edit } from 'lucide-react';
import api from '../utils/api';

const AdminEditModal = ({ isOpen, onClose, item, type, onUpdateSuccess, years, subjects }) => {
    // State to hold the data being edited (initialized from props)
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Set initial form data when item changes or modal opens
    useEffect(() => {
        if (item) {
            // Deep copy the item to work with mutable state
            let initialData = { ...item };

            // Special handling for tags (array to comma-separated string) for resource editing
            if (type === 'resources' && Array.isArray(initialData.tags)) {
                initialData.tags = initialData.tags.join(', ');
            }
            
            // Special handling for date strings (ensuring YYYY-MM-DD format for input type="date")
            if (initialData.dateOfEvent && typeof initialData.dateOfEvent === 'string') {
                 initialData.dateOfEvent = initialData.dateOfEvent.split('T')[0];
            }
            if (initialData.date && typeof initialData.date === 'string') {
                 initialData.date = initialData.date.split('T')[0]; // For Holidays
            }

            setFormData(initialData);
        }
    }, [item, type]);

    // Handle input changes, including checkbox logic
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission (Update logic)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = { ...formData };

            // Special handling for tags: convert string back to array before sending
            if (type === 'resources' && typeof payload.tags === 'string') {
                payload.tags = payload.tags.split(',').map(tag => tag.trim()).filter(Boolean);
            }
            
            // Clean up unnecessary MongoDB fields before PUT request
            delete payload._id;
            delete payload.createdAt;
            delete payload.lastUsed;
            delete payload.uploadedBy;

            // FIX: Corrected API PUT request URL. Type is already the plural endpoint name (e.g., 'subjects').
            await api.put(`/admin/${type}/${item._id}`, payload); 
            
            // Notify parent component (Dashboard) of success
            onUpdateSuccess(type, payload); 
            onClose();

        } catch (err) {
            setError(err.response?.data?.msg || `Failed to update ${type}. Check inputs.`);
            console.error(`Error updating ${type}:`, err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to render the specific fields for each content type
    const renderFields = () => {
        if (!formData || !type) return null;

        switch (type) {
            case 'subjects':
                return (
                    <>
                        <h4 className="text-lg font-bold text-indigo-700">Edit Subject Details</h4>
                        <select required name="yearId" value={formData.yearId || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading}>
                            <option value="">Select Year *</option>
                            {/* Assumes years is an array of { _id, displayName } */}
                            {years.map(y => (<option key={y._id} value={y._id}>{y.displayName}</option>))}
                        </select>
                        <input type="text" required placeholder="Subject Code" name="code" value={formData.code || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading} />
                        <input type="text" required placeholder="Subject Title" name="title" value={formData.title || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading} />
                        <textarea placeholder="Description" name="description" value={formData.description || ''} onChange={handleChange} className="w-full p-3 border rounded-lg resize-none" disabled={loading} rows="3" />
                    </>
                );
            
            case 'announcements':
                return (
                    <>
                        <h4 className="text-lg font-bold text-indigo-700">Edit Announcement</h4>
                        <input type="text" required placeholder="Title" name="title" value={formData.title || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading} />
                        
                        <select required name="type" value={formData.type || 'general'} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading}>
                            <option value="exam">Exam/Academic Alert</option>
                            <option value="event">Event/Extracurricular</option>
                            <option value="general">General Information</option>
                        </select>

                        <input type="date" name="dateOfEvent" value={formData.dateOfEvent || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading} />
                        
                        {formData.type === 'event' && (
                             <input type="url" name="registrationLink" value={formData.registrationLink || ''} onChange={handleChange} className="w-full p-3 border rounded-lg border-indigo-300" placeholder="Registration Link" disabled={loading} />
                        )}

                        <textarea required placeholder="Content" name="content" value={formData.content || ''} onChange={handleChange} className="w-full p-3 border rounded-lg resize-none" disabled={loading} rows="4" />
                        
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" id="pinned" name="pinned" checked={formData.pinned || false} onChange={handleChange} className="w-5 h-5 text-red-600 rounded" disabled={loading} />
                            <label htmlFor="pinned" className="font-medium text-gray-700">Pin to Top</label>
                        </div>
                    </>
                );

            case 'holidays':
                return (
                    <>
                        <h4 className="text-lg font-bold text-indigo-700">Edit Holiday</h4>
                        <input type="date" required name="date" value={formData.date || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading} />
                        <input type="text" required placeholder="Holiday Title" name="title" value={formData.title || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading} />
                        <textarea placeholder="Description" name="description" value={formData.description || ''} onChange={handleChange} className="w-full p-3 border rounded-lg resize-none" disabled={loading} rows="3" />
                    </>
                );
            
            case 'resources':
                return (
                    <>
                        <h4 className="text-lg font-bold text-indigo-700">Edit Resource (Link/Note)</h4>
                        <select required name="subjectId" value={formData.subjectId || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading}>
                            <option value="">Select Subject *</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.title}</option>)}
                        </select>
                        <input type="text" required placeholder="Resource Title" name="title" value={formData.title || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading} />
                        <textarea placeholder="Description" name="description" value={formData.description || ''} onChange={handleChange} className="w-full p-3 border rounded-lg resize-none" disabled={loading} rows="3" />
                        <input type="url" required placeholder="Google Drive Share URL / Embed Link" name="driveWebViewLink" value={formData.driveWebViewLink || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" disabled={loading} />
                        <input 
                            type="text" 
                            placeholder="Tags (comma-separated)" 
                            name="tags" 
                            value={(Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags) || ''} 
                            onChange={handleChange} 
                            className="w-full p-3 border rounded-lg" 
                            disabled={loading} 
                        />
                    </>
                );

            default:
                return <p className="text-red-500">Error: Unknown item type for editing.</p>;
        }
    };

    if (!isOpen || !item) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-5 border-b bg-indigo-600 text-white rounded-t-xl">
                        <h3 className="text-xl font-bold flex items-center space-x-2">
                            <Edit className="w-5 h-5" />
                            <span>Edit {type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </h3>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                                {error}
                            </div>
                        )}
                        
                        {renderFields()}

                        {/* Footer / Submit Button */}
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className={`w-full py-3 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            <Save className="w-5 h-5" />
                            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminEditModal;