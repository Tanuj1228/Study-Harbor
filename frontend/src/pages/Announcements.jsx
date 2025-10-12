// frontend/src/pages/Announcements.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Bell, Pin } from 'lucide-react';

const AnnouncementCard = ({ announcement, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        className={`p-6 bg-white rounded-xl shadow-lg border-l-4 ${announcement.pinned ? 'border-red-500' : 'border-indigo-400'}`}
    >
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
            {announcement.pinned && (
                <div className="flex items-center text-sm text-red-600 font-semibold bg-red-100 px-3 py-1 rounded-full">
                    <Pin className="w-4 h-4 mr-1" /> Pinned
                </div>
            )}
        </div>
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{announcement.content}</p>
        <p className="text-xs text-gray-500">
            Posted: {new Date(announcement.createdAt).toLocaleDateString()}
        </p>
    </motion.div>
);

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('/announcements');
                setAnnouncements(res.data);
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-extrabold text-indigo-700 mb-8 flex items-center space-x-3 border-b pb-4"
            >
                <Bell className="w-8 h-8" />
                <span>Campus Announcements</span>
            </motion.h1>

            {loading && <p className="text-center text-indigo-600">Loading announcements...</p>}

            {!loading && announcements.length === 0 && (
                <p className="text-center text-gray-500 p-10 bg-gray-50 rounded-lg">
                    No active announcements found.
                </p>
            )}

            <div className="space-y-6">
                {announcements.map((ann, index) => (
                    <AnnouncementCard key={ann._id} announcement={ann} delay={index * 0.1} />
                ))}
            </div>
        </div>
    );
};

export default Announcements;