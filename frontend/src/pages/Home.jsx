// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AnimatedBackground from '../components/AnimatedBackground'; // Background animation
import { Search, ChevronRight } from 'lucide-react';

const QUOTE_OF_THE_DAY = {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
};

const Card = ({ children }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100"
    >
        {children}
    </motion.div>
);

const Home = () => {
    const [years, setYears] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch essential data on load
        const fetchData = async () => {
            try {
                const [yearsRes, annRes, holRes] = await Promise.all([
                    api.get('/years'),
                    api.get('/announcements'),
                    api.get('/holidays')
                ]);
                setYears(yearsRes.data);
                setAnnouncements(annRes.data.slice(0, 3)); // Show top 3 for snippet
                setHolidays(holRes.data.slice(0, 3)); // Show next 3 holidays
            } catch (err) {
                console.error("Failed to fetch home data:", err);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${searchQuery.trim()}`);
        }
    };

    return (
        <div className="relative min-h-[80vh] py-10">
            <AnimatedBackground /> {/* Lottie Background */}
            <div className="relative z-10">
                
                {/* Quote of the Day (Centerpiece) */}
                <motion.div
                    className="max-w-4xl mx-auto text-center mb-12 p-8 bg-indigo-500/80 backdrop-blur-sm rounded-3xl shadow-2xl text-white"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <h2 className="text-xl font-light italic mb-2">Quote of the Day.</h2>
                    <p className="text-3xl font-bold leading-snug">"{QUOTE_OF_THE_DAY.quote}"</p>
                    <p className="text-lg mt-3 font-medium">- {QUOTE_OF_THE_DAY.author}</p>
                </motion.div>

                {/* Main Grid: Announcements, Years, Holidays */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    
                    {/* LEFT COLUMN: Announcements Snippet */}
                    <Card>
                        <h3 className="text-xl font-semibold text-indigo-700 border-b pb-2 mb-4">Latest Announcements 📣</h3>
                        <ul className="space-y-3">
                            {announcements.length > 0 ? announcements.map(ann => (
                                <li key={ann._id} className="text-gray-700 flex items-start space-x-2">
                                    <ChevronRight className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                    <span className="font-medium hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => navigate('/announcements')}>{ann.title}</span>
                                </li>
                            )) : <p className="text-gray-500">No recent announcements.</p>}
                        </ul>
                        <Link to="/announcements" className="mt-4 block text-indigo-600 hover:text-indigo-800 font-medium text-sm">View All &rarr;</Link>
                    </Card>

                    {/* CENTER: Year Buttons and Search */}
                    <div className="lg:col-span-1 flex flex-col space-y-8">
                        {/* Year Buttons */}
                        <Card>
                            <h3 className="text-xl font-semibold text-center text-indigo-700 mb-4">Select Your Year</h3>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                                {years.map((year, index) => (
                                    <motion.div
                                        key={year._id}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="col-span-1"
                                    >
                                        <Link
                                            to={`/year/${year._id}`}
                                            className="block w-full text-center py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            {year.displayName}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                        
                        {/* Search Bar */}
                        <Card>
                            <form onSubmit={handleSearch} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Search subjects, notes, videos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-grow p-3 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                />
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                                >
                                    <Search className="w-5 h-5" />
                                </motion.button>
                            </form>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Upcoming Holidays Snippet */}
                    <Card>
                        <h3 className="text-xl font-semibold text-indigo-700 border-b pb-2 mb-4">Upcoming Holidays 📅</h3>
                        <ul className="space-y-3">
                            {holidays.length > 0 ? holidays.map(hol => (
                                <li key={hol._id} className="text-gray-700">
                                    <p className="text-sm text-indigo-500 font-medium">{new Date(hol.date).toLocaleDateString()}</p>
                                    <p className="font-medium">{hol.title}</p>
                                </li>
                            )) : <p className="text-gray-500">No confirmed holidays soon.</p>}
                        </ul>
                        <Link to="/calendar" className="mt-4 block text-indigo-600 hover:text-indigo-800 font-medium text-sm">View Calendar &rarr;</Link>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default Home;