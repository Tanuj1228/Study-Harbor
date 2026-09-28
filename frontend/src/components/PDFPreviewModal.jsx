// frontend/src/components/PDFPreviewModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText } from 'lucide-react';

// Helper function to convert a standard share link to a reliable embed/preview URL
const getEmbedUrl = (shareLink) => {
  // Check for the standard Google Drive 'file/d/FILE_ID/view' format
  const match = shareLink.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match && match[1]) {
    const fileId = match[1];
    // Return the specific URL format required for embedding within an iframe
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  // Fallback for direct Google Docs/Sheets links or other formats
  return shareLink;
};


const PDFPreviewModal = ({ resource, onClose }) => {
  if (!resource) return null;

  // The download link should be the original shared link (for direct access/download)
  const downloadUrl = resource.driveWebViewLink;
  
  // CRITICAL FIX: Convert the shared link to the embed/preview link
  const previewUrl = getEmbedUrl(resource.driveWebViewLink); 

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-indigo-500 text-white">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span>Review: {resource.title}</span>
            </h3>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Preview Area (Iframe) */}
          <div className="flex-grow bg-gray-100 p-2">
            <iframe
              // Use the corrected previewUrl for the iframe source
              src={previewUrl} 
              title={resource.title}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              // Allow fullscreen and web access
              allow="clipboard-write; fullscreen"
            >
              Your browser does not support iframes, please use the download button.
            </iframe>
          </div>

          {/* Footer / Download Button */}
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <motion.a
              // Use the original downloadUrl for the download button
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 py-3 px-6 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download File</span>
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PDFPreviewModal;