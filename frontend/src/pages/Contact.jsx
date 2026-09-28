// frontend/src/pages/Contact.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-xl shadow-2xl border border-gray-100"
    >
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-8 text-center">Get In Touch</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        
        <motion.div 
            className="p-6 bg-indigo-50 rounded-xl shadow-md"
            whileHover={{ scale: 1.05 }}
        >
          <Mail className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Email Support</h3>
          <p className="text-gray-700">support@studyharbor.com</p>
          <p className="text-sm text-gray-500">Expect a reply within 24-48 hours.</p>
        </motion.div>

        <motion.div 
            className="p-6 bg-indigo-50 rounded-xl shadow-md"
            whileHover={{ scale: 1.05 }}
        >
          <Phone className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Phone</h3>
          <p className="text-gray-700">+91 98765 43210</p>
          <p className="text-sm text-gray-500">Available Mon-Fri, 9am-5pm.</p>
        </motion.div>

        <motion.div 
            className="p-6 bg-indigo-50 rounded-xl shadow-md"
            whileHover={{ scale: 1.05 }}
        >
          <MapPin className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Campus Office</h3>
          <p className="text-gray-700">Student Services Center, Room 101</p>
          <p className="text-sm text-gray-500">Visit us during office hours.</p>
        </motion.div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg font-semibold text-gray-800">For general feedback, please visit our dedicated:</p>
        <motion.a
            href="/feedback"
            className="inline-block mt-4 py-3 px-8 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
        >
            Go to Feedback Form
        </motion.a>
      </div>
    </motion.div>
  );
};

export default Contact;