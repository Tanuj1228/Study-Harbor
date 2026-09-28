// frontend/src/pages/SubjectPage.jsx
import React, { useState, useEffect, useMemo } from 'react'; // ADDED useMemo
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Video, BookOpen, Download, Link2, Search } from 'lucide-react'; // ADDED Search
import api from '../utils/api';
import PDFPreviewModal from '../components/PDFPreviewModal';

const tabs = [
    { key: 'video', label: 'Reference Videos', icon: Video },
    { key: 'note', label: 'Notes', icon: FileText },
    { key: 'syllabus', label: 'Syllabus', icon: BookOpen },
];

// Helper to determine icon based on resource type
const getResourceIcon = (type) => {
    switch(type) {
        case 'note': return FileText;
        case 'syllabus': return BookOpen;
        case 'video': return Video;
        default: return Link2;
    }
};

// Resource List Item Component (Code remains correct)
const ResourceListItem = ({ resource, onPreview }) => {
    const Icon = getResourceIcon(resource.type);

    // If it's a note or syllabus, open the preview modal
    const handleAction = (e) => {
        e.preventDefault();
        if (resource.type === 'note' || resource.type === 'syllabus') {
            onPreview(resource);
        } else {
            // For videos/reference, open the link directly
            window.open(resource.driveWebViewLink, '_blank');
        }
    };

    return (
        <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-colors border-l-4 border-indigo-400"
        >
            <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-gray-800">{resource.title}</h4>
                    <p className="text-sm text-gray-500">{resource.description || 'No description'}</p>
                </div>
            </div>
            
            <button 
                onClick={handleAction}
                className="flex items-center text-sm font-medium text-white bg-indigo-600 py-2 px-4 rounded-full hover:bg-indigo-700 transition-colors shadow-md"
            >
                {resource.type === 'note' || resource.type === 'syllabus' ? 'Review' : 'Watch'}
            </button>
        </motion.div>
    );
};


const SubjectPage = () => {
    const { subjectId } = useParams();
    const [subject, setSubject] = useState(null);
    const [activeTab, setActiveTab] = useState('note');
    // Stores all fetched resources categorized by tab key
    const [allResources, setAllResources] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [previewResource, setPreviewResource] = useState(null); 
    // NEW STATE: Real-time search query
    const [searchQuery, setSearchQuery] = useState(''); 


    useEffect(() => {
        const fetchSubjectData = async () => {
            setLoading(true);
            try {
                // Fetch Subject Details
                const subjectDetailRes = api.get(`/subjects/${subjectId}`); 
                
                // Fetch All Resources Concurrently for all tabs
                const resourcePromises = tabs.map(tab => 
                    api.get(`/subjects/${subjectId}/resources?type=${tab.key}`)
                );

                const [subjectRes, ...resourceResponses] = await Promise.all([
                    subjectDetailRes,
                    ...resourcePromises 
                ]);
                
                setSubject(subjectRes.data);
                
                // Process Resource Responses into the allResources state
                const newResources = resourceResponses.reduce((acc, res, index) => {
                    acc[tabs[index].key] = res.data;
                    return acc;
                }, {});

                setAllResources(newResources);
            
            } catch (err) {
                console.error("Failed to load subject data:", err);
                setSubject({ title: 'Error Loading Subject', description: 'Could not fetch subject details.' });
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectData();
    }, [subjectId]);

    // NEW LOGIC: Use useMemo to filter resources in real-time
    const filteredResources = useMemo(() => {
        const activeResources = allResources[activeTab] || [];
        
        if (!searchQuery) {
            return activeResources;
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        
        return activeResources.filter(resource =>
            resource.title.toLowerCase().includes(lowercasedQuery) ||
            resource.description?.toLowerCase().includes(lowercasedQuery) ||
            resource.tags?.some(tag => tag.toLowerCase().includes(lowercasedQuery))
        );
    }, [activeTab, allResources, searchQuery]); // Re-calculate when these states change

    // Determine the content to display based on the active tab
    const ActiveIcon = tabs.find(t => t.key === activeTab)?.icon || Link2;

    return (
        <div className="py-8">
            <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-extrabold text-gray-900 mb-2"
            >
                {subject?.title || (loading ? "Loading..." : "Subject Not Found")}
            </motion.h1>
            <p className="text-lg text-gray-500 mb-8">
                {subject?.description && subject.description.trim() !== ''
                    ? subject.description
                    : 'No description available for this subject.'}
            </p>

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
                        placeholder={`Search ${activeTab} content...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} // <-- Triggers real-time filtering
                        className="flex-grow p-2 border-none focus:ring-0 focus:outline-none text-gray-700"
                    />
                </div>
            </motion.div>
        
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setSearchQuery(''); // Clear search on tab switch for clarity
                        }}
                        className={`flex items-center space-x-2 py-3 px-6 text-lg font-medium transition-colors ${
                            activeTab === tab.key
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-indigo-600'
                        }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {loading && <p className="text-center text-indigo-600">Loading resources...</p>}
            
            {!loading && filteredResources.length === 0 && (
                <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <ActiveIcon className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">
                        {searchQuery 
                            ? `No results found for "${searchQuery}" in ${activeTab}.`
                            : `No ${activeTab} resources available for this subject yet.`
                        }
                    </p>
                </div>
            )}

            {/* Resource List */}
            <div className="space-y-4">
                {filteredResources.map((resource) => ( // Use filtered list
                    <ResourceListItem key={resource._id} resource={resource} onPreview={setPreviewResource} />
                ))}
            </div>
            
            {/* PDF/Note Review Modal */}
            {previewResource && (
                <PDFPreviewModal 
                    resource={previewResource} 
                    onClose={() => setPreviewResource(null)} 
                />
            )}
        </div>
    );
};

export default SubjectPage;