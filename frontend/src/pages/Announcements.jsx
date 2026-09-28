// frontend/src/pages/Announcements.jsx
import React, { useState, useEffect, useMemo } from 'react'; // ADDED useMemo
import { motion } from 'framer-motion';
// CRITICAL: Import useNavigate for click navigation
import { useNavigate } from 'react-router-dom'; 
import api from '../utils/api';
// Using FileText for Exams and EventIcon for Events/General
import { Bell, Pin, FileText, Calendar as EventIcon, Search } from 'lucide-react'; // ADDED Search

// CRITICAL: AnnouncementCard must accept navigate and use it
const AnnouncementCard = ({ announcement, delay }) => {
    // Access navigation logic
    const navigate = useNavigate();
    
    const isEvent = announcement.type === 'event';
    const isPinned = announcement.pinned;
    
    // Determine card styling based on type and pinned status
    const borderColor = isEvent ? 'border-indigo-500' : isPinned ? 'border-red-500' : 'border-gray-300';
    
    // Determine cursor and click behavior
    const isClickable = isEvent; // Only Events are detailed pages, Exams/General can just show content

    // Handle click to navigate to the detail page
    const handleClick = () => {
        // If it's an event, go to the detail page (e.g., /announcements/123)
        // You can also make all announcements clickable if you want detail for all types
        if (isClickable) { 
            navigate(`/announcements/${announcement._id}`);
        }
    };


    return (
        <motion.div
            onClick={handleClick} // Add the click handler
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay }}
            // Add hover/cursor styling for clickable events
            className={`p-6 bg-white rounded-xl shadow-lg border-l-4 
                        ${borderColor} 
                        ${isClickable ? 'cursor-pointer hover:shadow-xl' : ''}`
            }
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
            
            {/* Display only a snippet of the content on the list page */}
            <p className="text-gray-700 mb-4 line-clamp-2">
                {announcement.content}
            </p>
            
            {/* Bottom details */}
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
        </motion.div>
    );
};

const Announcements = () => {
    // State to hold ALL announcements fetched from the API
    const [allAnnouncements, setAllAnnouncements] = useState([]); 
    const [loading, setLoading] = useState(true);
    // NEW STATE: Holds the real-time search query
    const [searchQuery, setSearchQuery] = useState(''); 


    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('/announcements');
                setAllAnnouncements(res.data);
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    // NEW LOGIC: Filter announcements based on search query
    const filteredAnnouncements = useMemo(() => {
        if (!searchQuery) {
            return allAnnouncements;
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        
        return allAnnouncements.filter(ann => 
            ann.title.toLowerCase().includes(lowercasedQuery) ||
            ann.content.toLowerCase().includes(lowercasedQuery)
        );
    }, [allAnnouncements, searchQuery]); // Re-calculate when data or query changes

    // Filter announcements into three sections for display
    const examAnnouncements = filteredAnnouncements.filter(ann => ann.type === 'exam');
    const eventAnnouncements = filteredAnnouncements.filter(ann => ann.type === 'event');
    const generalAnnouncements = filteredAnnouncements.filter(ann => ann.type === 'general');

    const renderSection = (title, Icon, list, emptyMessage) => (
        <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center space-x-3">
                <Icon className={`w-7 h-7 ${title.includes('Exam') ? 'text-red-600' : 'text-indigo-600'}`} />
                <span>{title}</span>
            </h2>
            {list.length === 0 ? (
                <p className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg border border-dashed">
                    {searchQuery ? `No results found matching "${searchQuery}".` : emptyMessage}
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
            
            {/* NEW: Real-Time Search Input */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow-lg border">
                    <Search className="w-5 h-5 text-gray-400 ml-2" />
                    <input
                        type="text"
                        placeholder="Search announcements by title or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} // <-- Triggers real-time filtering
                        className="flex-grow p-2 border-none focus:ring-0 focus:outline-none text-gray-700"
                    />
                </div>
            </motion.div>


            {loading && <p className="text-center text-indigo-600">Loading announcements...</p>}

            {!loading && (filteredAnnouncements.length > 0 || searchQuery === '') && (
                <>
                    {renderSection('Exam & Academic Announcements', FileText, examAnnouncements, 'No current exam schedules or academic alerts.')}
                    {renderSection('Event & Extracurricular Notices', EventIcon, eventAnnouncements, 'No upcoming event announcements.')}
                    {generalAnnouncements.length > 0 && renderSection('General Notices', Bell, generalAnnouncements, '')}
                </>
            )}
            
            {!loading && allAnnouncements.length > 0 && filteredAnnouncements.length === 0 && searchQuery !== '' && (
                <p className="text-center text-gray-500 p-10 bg-gray-50 rounded-lg">
                    No active announcements found matching "{searchQuery}".
                </p>
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