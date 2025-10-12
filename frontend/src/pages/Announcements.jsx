// frontend/src/pages/Announcements.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
// Using FileText for Exams and EventIcon for Events/General
import { Bell, Pin, FileText, Calendar as EventIcon } from 'lucide-react'; 

const AnnouncementCard = ({ announcement, delay }) => {
    const isExam = announcement.type === 'exam';
    const isPinned = announcement.pinned;
    
    // Determine card styling based on type and pinned status
    const borderColor = isExam ? 'border-red-500' : isPinned ? 'border-pink-500' : 'border-indigo-400';
    // cardIcon is not used in the render function, but FileText and EventIcon are passed to renderSection

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`p-6 bg-white rounded-xl shadow-lg border-l-4 ${borderColor}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Bell className="w-5 h-5 text-gray-500" /></motion.div>
                    <span>{announcement.title}</span>
                </h3>
                {isPinned && (
                    <div className="flex items-center text-sm text-red-600 font-semibold bg-red-100 px-3 py-1 rounded-full">
                        <Pin className="w-4 h-4 mr-1" /> Pinned
                    </div>
                )}
            </div>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{announcement.content}</p>
            
            {/* UPDATED: Display Date of Event/Exam */}
            <p className="text-xs text-gray-500 flex justify-between">
                <span>
                    Category: <span className="font-medium text-gray-700 capitalize">{announcement.type}</span>
                    
                    {/* Display the dateOfEvent if it exists */}
                    {announcement.dateOfEvent && (
                        <span className="ml-4 font-medium text-indigo-600">
                            | Date: {new Date(announcement.dateOfEvent).toLocaleDateString()} 
                        </span>
                    )}
                </span>
                <span>Posted: {new Date(announcement.createdAt).toLocaleDateString()}</span>
            </p>
            {/* END UPDATED SECTION */}
        </motion.div>
    );
};

const Announcements = () => {
    const [allAnnouncements, setAllAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('/announcements');
                // The backend controller should already sort by pinned status first, then by date
                setAllAnnouncements(res.data);
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    // Filter announcements into three sections
    const examAnnouncements = allAnnouncements.filter(ann => ann.type === 'exam');
    const eventAnnouncements = allAnnouncements.filter(ann => ann.type === 'event');
    const generalAnnouncements = allAnnouncements.filter(ann => ann.type === 'general');

    const renderSection = (title, Icon, list, emptyMessage) => (
        <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center space-x-3">
                <Icon className={`w-7 h-7 ${title.includes('Exam') ? 'text-red-600' : 'text-indigo-600'}`} />
                <span>{title}</span>
            </h2>
            {list.length === 0 ? (
                <p className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg border border-dashed">
                    {emptyMessage}
                </p>
            ) : (
                <div className="space-y-6">
                    {list.map((ann, index) => (
                        <AnnouncementCard key={ann._id} announcement={ann} delay={index * 0.05} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-extrabold text-indigo-700 mb-8 flex items-center space-x-3 border-b pb-4"
            >
                <Bell className="w-8 h-8" />
                <span>Campus Alerts & Notices</span>
            </motion.h1>

            {loading && <p className="text-center text-indigo-600">Loading announcements...</p>}

            {!loading && allAnnouncements.length > 0 && (
                <>
                    {renderSection('Exam & Academic Announcements', FileText, examAnnouncements, 'No current exam schedules or academic alerts.')}
                    {renderSection('Event & Extracurricular Notices', EventIcon, eventAnnouncements, 'No upcoming event announcements.')}
                    {/* General notices display only if there are any */}
                    {generalAnnouncements.length > 0 && renderSection('General Notices', Bell, generalAnnouncements, '')}
                </>
            )}
            
            {!loading && allAnnouncements.length === 0 && (
                <p className="text-center text-gray-500 p-10 bg-gray-50 rounded-lg">
                    No active announcements found.
                </p>
            )}
        </div>
    );
};

export default Announcements;