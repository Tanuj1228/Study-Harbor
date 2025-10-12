// frontend/src/components/PDFPreviewModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText } from 'lucide-react';

const PDFPreviewModal = ({ resource, onClose }) => {
  if (!resource) return null;

  // The link to the Google Drive file must be in the format for embedding/preview.
  // We use the basic link, as Google Drive handles embedding often by converting /view to /preview
  // or using the standard share link in an iframe.
  const previewUrl = resource.driveWebViewLink; 
  const downloadUrl = resource.driveWebViewLink; // Use the same link for download

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
              src={previewUrl} 
              title={resource.title}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              allow="clipboard-write"
            >
              Your browser does not support iframes, please use the download button.
            </iframe>
          </div>

          {/* Footer / Download Button */}
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <motion.a
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