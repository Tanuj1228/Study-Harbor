// frontend/src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Search as SearchIcon, FileText, Video, BookOpen } from 'lucide-react';

// Helper to parse query parameters (e.g., ?q=query)
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// Icon map for results
const getResultIcon = (type) => {
    switch(type) {
        case 'note': return FileText;
        case 'syllabus': return BookOpen;
        case 'video': return Video;
        default: return FileText;
    }
};

const SearchResultItem = ({ resource }) => {
    const navigate = useNavigate();
    const Icon = getResultIcon(resource.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate(`/subject/${resource.subjectId._id}`)}
            className="p-5 bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-indigo-400 flex items-start space-x-4"
        >
            <Icon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
            <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800">
                    {resource.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    {resource.description || `Type: ${resource.type.toUpperCase()}`}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    Subject: {resource.subjectId.code} - {resource.subjectId.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {resource.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const Search = () => {
  const queryParams = useQuery();
  const [searchQuery, setSearchQuery] = useState(queryParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentQuery = queryParams.get('q');

  useEffect(() => {
    if (currentQuery) {
        fetchResults(currentQuery);
    } else {
        setResults([]);
    }
  }, [currentQuery]);

  const fetchResults = async (query) => {
    setLoading(true);
    try {
        const res = await api.get(`/search/resources?q=${encodeURIComponent(query)}`);
        setResults(res.data);
    } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
    } finally {
        setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        const url = `/search?q=${searchQuery.trim()}`;
        // Manually navigate to update the URL and trigger useEffect
        window.history.pushState({}, '', url);
        fetchResults(searchQuery.trim());
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-extrabold text-indigo-700 mb-8 flex items-center space-x-3 border-b pb-4"
      >
        <SearchIcon className="w-8 h-8" />
        <span>Search Results</span>
      </motion.h1>

      <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 mb-8">
        <input
            type="text"
            placeholder="Refine your search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-4 border-2 border-indigo-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg"
        />
        <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
        >
            <SearchIcon className="w-6 h-6" />
        </motion.button>
      </form>
      
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">
        Results for: "{currentQuery || '...'}"
      </h2>

      {loading && <p className="text-center p-10 text-indigo-600 text-lg">Searching...</p>}

      {!loading && results.length === 0 && currentQuery && (
          <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <SearchIcon className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No resources matched your search query. Try different keywords!</p>
          </div>
      )}

      <div className="space-y-4">
        {results.map((resource) => (
          <SearchResultItem key={resource._id} resource={resource} />
        ))}
      </div>
    </div>
  );
};

export default Search;