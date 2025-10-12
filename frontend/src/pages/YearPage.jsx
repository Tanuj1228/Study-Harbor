// frontend/src/pages/YearPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

// Reusable Subject Card Component
const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      onClick={() => navigate(`/subject/${subject._id}`)}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      className="p-6 bg-white rounded-xl shadow-lg cursor-pointer transition-all border-t-4 border-indigo-500"
    >
      <h3 className="text-xl font-bold text-indigo-700 mb-2">{subject.title}</h3>
      <p className="text-sm text-gray-500 font-mono mb-3">{subject.code}</p>
      <p className="text-gray-600 line-clamp-2">{subject.description || 'No description available.'}</p>
    </motion.div>
  );
};

const YearPage = () => {
  const { yearId } = useParams(); // Fetches the yearId from the URL
  const [subjects, setSubjects] = useState([]);
  const [yearName, setYearName] = useState('Loading Year...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/years/${yearId}/subjects`);
        setSubjects(res.data);
        
        // Infer the year name (or fetch it if needed, but for simplicity we assume yearId is meaningful)
        if (res.data.length > 0) {
            // We'll rely on a separate endpoint or better data design later,
            // but for now, if the list is empty, we set a default name.
        }
        
        // Quick way to get a meaningful name: assume yearId is the object ID of the Year model
        const yearRes = await api.get('/years'); 
        const year = yearRes.data.find(y => y._id === yearId);
        if (year) {
            setYearName(year.displayName);
        } else {
             setYearName(`Year Content`);
        }

      } catch (err) {
        setError('Failed to load subjects for this year. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [yearId]);

  return (
    <div className="py-8">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4"
      >
        {yearName} Subjects
      </motion.h1>

      {loading && <p className="text-center text-indigo-600">Loading subject list...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && subjects.length === 0 && !error && (
        <p className="text-center text-gray-500 p-10 bg-gray-50 rounded-lg">
          No subjects have been added for this year yet. Check back soon!
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <SubjectCard subject={subject} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default YearPage;