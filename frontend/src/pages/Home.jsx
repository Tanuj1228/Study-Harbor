// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AnimatedBackground from '../components/AnimatedBackground'; 
import { Search, ChevronRight, User, Info } from 'lucide-react'; // Added Info icon
import { useAuth } from '../context/AuthContext'; 

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
    const [quote, setQuote] = useState({ quote: 'Loading inspiration...', author: ' ' }); 
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [yearsRes, annRes, holRes, quoteRes] = await Promise.all([ 
                    api.get('/years'),
                    api.get('/announcements'),
                    api.get('/holidays'),
                    api.get('/quote')
                ]);
                
                setYears(yearsRes.data);
                setAnnouncements(annRes.data.slice(0, 3)); 
                setHolidays(holRes.data.slice(0, 3)); 
                setQuote(quoteRes.data);

            } catch (err) {
                console.error("Failed to fetch home data:", err);
                setQuote({ quote: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' });
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
    
    const renderCallToActionOrWelcome = () => {
        if (!isAuthenticated) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="max-w-4xl mx-auto text-center mt-12 p-8 bg-indigo-50 rounded-xl shadow-lg border border-indigo-200 space-y-4"
                >
                    <h3 className="text-2xl font-bold text-indigo-700">Access Complete Features for Free!</h3>
                    <p className="text-lg text-gray-600">
                        Log in or register now to instantly view notes, syllabi, and full holiday details.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <motion.button
                            onClick={() => navigate('/login')}
                            whileHover={{ scale: 1.05 }}
                            className="py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg shadow-md"
                        >
                            Login
                        </motion.button>
                        <motion.button
                            onClick={() => navigate('/register')}
                            whileHover={{ scale: 1.05 }}
                            className="py-3 px-6 bg-gray-200 text-indigo-600 font-bold rounded-lg shadow-md"
                        >
                            Register
                        </motion.button>
                    </div>
                </motion.div>
            );
        } else {
            return (
                 <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="max-w-4xl mx-auto text-center mt-12 p-8 bg-green-50 rounded-xl shadow-lg border border-green-300 space-y-3"
                >
                    <User className="w-8 h-8 text-green-700 mx-auto" />
                    <h3 className="text-2xl font-bold text-green-700">
                        Welcome Back, {user.name.split(' ')[0]}!
                    </h3>
                    <p className="text-base text-gray-600">
                        You have full access. Find your materials or check the latest alerts.
                    </p>
                </motion.div>
            );
        }
    };

    return (
        <div className="relative min-h-[80vh] py-10">
            <AnimatedBackground />
            <div className="relative z-10">
                
                {/* 1. Quote of the Day */}
                <motion.div
                    className="max-w-4xl mx-auto text-center mb-8 p-8 bg-indigo-500/80 backdrop-blur-sm rounded-3xl shadow-2xl text-white"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <h2 className="text-xl font-light italic mb-2">Quote of the Day.</h2>
                    <p className="text-3xl font-bold leading-snug">"{quote.quote}"</p>
                    <p className="text-lg mt-3 font-medium">- {quote.author}</p>
                </motion.div>

                {/* NEW: Under Development Notice Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-4xl mx-auto mb-12 p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm flex items-center justify-center space-x-3 text-amber-800"
                >
                    <Info className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm md:text-base font-medium">
                        <strong>Website Under Development:</strong> If you don't find notes for a specific subject, please check the reference videos. Notes will be uploaded shortly!
                    </p>
                </motion.div>

                {/* 2. Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    
                    {/* LEFT COLUMN: Announcements Snippet */}
                    <Card>
                        <h3 className="text-xl font-semibold text-indigo-700 border-b pb-2 mb-4">Latest Announcements 📣</h3>
                        <ul className="space-y-3">
                            {announcements.length > 0 ? announcements.map(ann => (
                                <li key={ann._id} className="text-gray-700 flex items-start space-x-2">
                                    <ChevronRight className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                    <span 
                                        className="font-medium hover:text-indigo-600 cursor-pointer transition-colors" 
                                        onClick={() => navigate(`/announcements/${ann._id}`)}
                                    >
                                        {ann.title}
                                    </span>
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

                {/* 3. Call to Action / Welcome Message */}
                {renderCallToActionOrWelcome()}

            </div>
        </div>
    );
};

export default Home;
