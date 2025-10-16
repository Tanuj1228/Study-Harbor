// frontend/src/pages/YearPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Search } from 'lucide-react'; // Import Search icon for the input field

// Reusable Subject Card Component (No changes needed here)
const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      onClick={() => navigate(`/subject/${subject._id}`)}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      className="p-6 bg-white rounded-xl shadow-lg cursor-pointer transition-all border-t-4 border-indigo-500 h-full flex flex-col"
    >
      <h3 className="text-xl font-bold text-indigo-700 mb-2">{subject.title}</h3>
      <p className="text-sm text-gray-500 font-mono mb-3">{subject.code}</p>
      <p className="text-gray-600 line-clamp-2 flex-grow">{subject.description || 'No description available.'}</p>
    </motion.div>
  );
};

const YearPage = () => {
  const { yearId } = useParams();
  // State to hold ALL subjects fetched from the API
  const [allSubjects, setAllSubjects] = useState([]);
  // State to hold the SUBJECTS CURRENTLY DISPLAYED (filtered list)
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [yearName, setYearName] = useState('Loading Year...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NEW STATE: Holds the real-time search query
  const [searchQuery, setSearchQuery] = useState(''); 
  const navigate = useNavigate();


  // NEW EFFECT: Runs whenever searchQuery or allSubjects changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSubjects(allSubjects);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const results = allSubjects.filter(subject => 
        subject.title.toLowerCase().includes(lowercasedQuery) ||
        subject.code.toLowerCase().includes(lowercasedQuery) ||
        subject.description?.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredSubjects(results);
    }
  }, [searchQuery, allSubjects]); // Trigger filter on every keystroke


  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/years/${yearId}/subjects`);
        
        // CRITICAL: Store both states after fetch
        setAllSubjects(res.data);
        setFilteredSubjects(res.data); // Initially show all subjects
        
        // Quick way to get a meaningful name
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
                  placeholder={`Search subjects and codes in ${yearName}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} // <-- Triggers real-time update
                  className="flex-grow p-2 border-none focus:ring-0 focus:outline-none text-gray-700"
              />
          </div>
      </motion.div>

      {loading && <p className="text-center text-indigo-600">Loading subject list...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Display message if no results after filtering */}
      {!loading && filteredSubjects.length === 0 && !error && (
        <p className="text-center text-gray-500 p-10 bg-gray-50 rounded-lg">
          No subjects match your search criteria.
        </p>
      )}

      {/* Grid container handles responsive columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSubjects.map((subject, index) => ( // Use filteredSubjects here
          <motion.div
            key={subject._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
          >
            <SubjectCard subject={subject} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default YearPage;