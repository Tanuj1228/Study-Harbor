// frontend/src/pages/SubjectPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Video, BookOpen, Download, Link2 } from 'lucide-react';
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
const [resources, setResources] = useState({}); // { note: [], video: [], syllabus: [] }
const [loading, setLoading] = useState(true);
const [previewResource, setPreviewResource] = useState(null); // Resource object for the modal

useEffect(() => {
 const fetchSubjectData = async () => {
 setLoading(true);
 try {
    // --- 1. Fetch Subject Details (New Call) ---
    // This relies on the new GET /api/subjects/:subjectId route you added
    const subjectDetailRes = api.get(`/subjects/${subjectId}`); 
    
    // --- 2. Fetch Resources Concurrently ---
  const resourcePromises = tabs.map(tab => 
   api.get(`/subjects/${subjectId}/resources?type=${tab.key}`)
  );

    // Combine all promises
  const [subjectRes, ...resourceResponses] = await Promise.all([
      subjectDetailRes,
      ...resourcePromises 
    ]);
  
    // Set Subject Details first
    setSubject(subjectRes.data);
    
  // Process Resource Responses
  const newResources = resourceResponses.reduce((acc, res, index) => {
   acc[tabs[index].key] = res.data;
   return acc;
  }, {});

  setResources(newResources);
 
 } catch (err) {
  console.error("Failed to load subject data:", err);
  // Fallback if API fails
  setSubject({ title: 'Error Loading Subject', description: 'Could not fetch subject details.' });
 } finally {
  setLoading(false);
 }
 };

 fetchSubjectData();
}, [subjectId]);

// Determine the content to display based on the active tab
const activeResources = resources[activeTab] || [];
const ActiveIcon = tabs.find(t => t.key === activeTab)?.icon || Link2;

return (
 <div className="py-8">
 <motion.h1
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className="text-4xl font-extrabold text-gray-900 mb-2"
 >
  {/* Display actual subject title or loading placeholder */}
  {subject?.title || (loading ? "Loading..." : "Subject Not Found")}
 </motion.h1>
    {/* FIX: Check if subject?.description is NOT just an empty string */}
 <p className="text-lg text-gray-500 mb-8">
        {subject?.description && subject.description.trim() !== ''
            ? subject.description
            : 'No description available for this subject.'}
    </p>
 
 {/* Tabs Navigation */}
 <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
  {tabs.map((tab) => (
  <button
   key={tab.key}
   onClick={() => setActiveTab(tab.key)}
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
 
 {!loading && activeResources.length === 0 && (
  <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
   <ActiveIcon className="w-10 h-10 mx-auto text-gray-400 mb-3" />
   <p className="text-gray-600">No {activeTab} resources available for this subject yet.</p>
  </div>
 )}

 {/* Resource List */}
 <div className="space-y-4">
  {activeResources.map((resource) => (
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