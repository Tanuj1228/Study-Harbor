// frontend/src/pages/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sun } from 'lucide-react';

// Helper function to create a standardized YYYY-MM-DD date key (Correct)
const getISODateKey = (date) => {
    if (!date || isNaN(date.getTime())) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const Calendar = () => {
    // ... (State declarations are correct)
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // ... (fetchHolidays logic is correct)
        const fetchHolidays = async () => {
            try {
                const res = await api.get('/holidays');
                setHolidays(res.data); 
            } catch (err) {
                console.error("Failed to fetch holidays:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHolidays();
    }, []);

    // Calendar logic helpers
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    
    // Convert holidays array to a map using the simple date string key (YYYY-MM-DD)
    const holidayMap = holidays.reduce((acc, hol) => {
        if (typeof hol.date === 'string' && hol.date.length === 10) {
             acc[hol.date] = hol;
        }
        return acc;
    }, {});

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const calendarDays = [];
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Fill leading empty days
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="p-2 border border-gray-100 bg-gray-50"></div>);
        }

        // Fill days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
            const dateKey = getISODateKey(date);
            const isHoliday = holidayMap[dateKey];
            
            calendarDays.push(
                <div 
                    key={day} 
                    // FIX: Ensure z-index is set if holiday overlay is absolute.
                    className={`
                        p-2 h-24 border border-gray-200 flex flex-col justify-between transition-shadow relative group overflow-hidden 
                        ${isHoliday 
                            ? 'bg-red-50 text-red-800 font-bold shadow-lg hover:shadow-xl' // Added text-red-800 for visibility
                            : 'bg-white hover:bg-gray-50'
                        }
                    `}
                >
                    {/* The date number itself (Needs to be relatively positioned or z-indexed if using absolute overlay) */}
                    <span 
                        className={`text-xl font-medium relative z-10 ${isHoliday ? 'text-red-700' : 'text-gray-800'}`}
                    >
                        {day}
                    </span>
                    
                    {/* Holiday Title and Overlay */}
                    {isHoliday && (
                        <div 
                            className="absolute inset-0 bg-red-200/70 p-2 flex flex-col justify-end items-center opacity-100 transition-opacity"
                        >
                            <p className="text-sm font-semibold text-red-800 text-center leading-tight">
                                {isHoliday.title}
                            </p>
                            <Sun className="w-5 h-5 text-red-400 mt-1" />
                        </div>
                    )}
                </div>
            );
        }
        return calendarDays;
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const changeMonth = (delta) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
        setCurrentDate(newDate);
    };

    return (
        <div className="py-8 max-w-6xl mx-auto">
            <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-extrabold text-indigo-700 mb-8 flex items-center space-x-3 border-b pb-4"
            >
                <CalendarIcon className="w-8 h-8" />
                <span>Academic Calendar</span>
            </motion.h1>

            {/* Calendar Controls */}
            <div className="flex justify-between items-center bg-indigo-600 text-white p-4 rounded-t-lg shadow-xl mb-0.5">
                <motion.button 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => changeMonth(-1)} 
                    className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </motion.button>

                <h2 className="text-2xl font-semibold">{monthName}</h2>

                <motion.button 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => changeMonth(1)} 
                    className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </motion.button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 text-center font-bold text-sm text-gray-700 bg-gray-200 border-x border-t border-gray-300">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 border border-gray-300">{day}</div>
                ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 calendar-grid border-b border-gray-300">
                {loading ? (
                    <div className="col-span-7 p-10 text-center">Loading holiday data...</div>
                ) : (
                    renderCalendar()
                )}
            </div>
        </div>
    );
};

export default Calendar;