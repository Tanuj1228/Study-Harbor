// frontend/src/pages/About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Code } from 'lucide-react';

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-xl shadow-2xl border border-gray-100"
    >
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 text-center">About Study Harbor</h1>
      
      <div className="space-y-6 text-lg text-gray-700">
        <p>
          Welcome to **Study Harbor**, a project born out of the direct need to solve common student pain points: fragmented resources, outdated information, and last-minute exam stress. As a student myself, I created this platform to centralize all academic necessities into one beautiful, easy-to-use digital portal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
          <motion.div 
            className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <BookOpen className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <p className="font-semibold">Centralized Resources</p>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Users className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <p className="font-semibold">Seamless Organization (By Year/Subject)</p>
          </motion.div>

          <motion.div 
            className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Code className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <p className="font-semibold">Built by a Student, for Students</p>
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 pt-4">Our Vision</h2>
        <p>
          To eliminate the wasted time spent searching for notes, checking holiday schedules, and missing crucial exam announcements. Study Harbor aims to be the single source of truth for all students, ensuring you can focus on learning, not logistics.
        </p>
      </div>
    </motion.div>
  );
};

export default About;