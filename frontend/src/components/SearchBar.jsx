// frontend/src/components/SearchBar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearchSubmit, placeholder }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearchSubmit(query.trim());
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <form onSubmit={handleSubmit} className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow-lg border">
                <input
                    type="text"
                    placeholder={placeholder || "Search here..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-grow p-2 border-none focus:ring-0 focus:outline-none text-gray-700"
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                    <Search className="w-5 h-5" />
                </motion.button>
            </form>
        </motion.div>
    );
};

export default SearchBar;