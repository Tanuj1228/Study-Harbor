// frontend/src/pages/AnnouncementDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { ArrowLeft, Bell, Calendar as EventIcon, FileText } from 'lucide-react';

const AnnouncementDetail = () => {
    const { id } = useParams();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                // The backend needs a GET /api/announcements/:id route (we will add this)
                const res = await api.get(`/announcements/${id}`);
                setAnnouncement(res.data);
            } catch (err) {
                setError('Failed to load announcement details. It may have expired or been removed.');
                console.error("Failed to fetch announcement detail:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <p className="text-center py-10 text-indigo-600">Loading event details...</p>;
    if (error || !announcement) return <p className="text-center py-10 text-red-600">{error || 'Announcement not found.'}</p>;

    const Icon = announcement.type === 'exam' ? FileText : EventIcon;
    const isEvent = announcement.type === 'event';
    const hasRegistration = !!announcement.registrationLink;
    
    return (
        <div className="py-8 max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-2xl p-8"
            >
                <button 
                    onClick={() => window.history.back()} 
                    className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Notices
                </button>

                <div className="flex items-center space-x-4 border-b pb-4 mb-6">
                    <Icon className="w-8 h-8 text-indigo-700 flex-shrink-0" />
                    <h1 className="text-3xl font-extrabold text-gray-900">{announcement.title}</h1>
                </div>

                <div className="text-sm text-gray-600 mb-6 space-y-2">
                    <p><strong>Category:</strong> <span className="capitalize">{announcement.type}</span></p>
                    {announcement.dateOfEvent && (
                        <p><strong>Relevant Date:</strong> {new Date(announcement.dateOfEvent).toLocaleDateString()}</p>
                    )}
                    <p><strong>Posted On:</strong> {new Date(announcement.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="prose max-w-none mb-8">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-1 mb-3">Details</h2>
                    <p className="whitespace-pre-wrap">{announcement.content}</p>
                </div>

                {/* Registration Button (The core feature) */}
                {isEvent && hasRegistration && (
                    <motion.a
                        href={announcement.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-6 w-full md:w-auto inline-flex items-center justify-center py-3 px-8 bg-red-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-red-700 transition-colors"
                    >
                        <EventIcon className="w-5 h-5 mr-2" /> Register Now
                    </motion.a>
                )}
            </motion.div>
        </div>
    );
};

export default AnnouncementDetail;