// frontend/src/pages/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sun } from 'lucide-react';

const Calendar = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                // Fetch all holidays (the public controller returns future holidays sorted by date)
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
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 (Sun) - 6 (Sat)
    
    // Convert holidays array to a map for O(1) lookup
    const holidayMap = holidays.reduce((acc, hol) => {
        const dateKey = new Date(hol.date).toDateString();
        acc[dateKey] = hol;
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
            const isHoliday = holidayMap[date.toDateString()];
            
            calendarDays.push(
                <div 
                    key={day} 
                    className={`p-2 h-24 border border-gray-200 flex flex-col justify-between transition-shadow relative ${
                        isHoliday ? 'bg-red-50 text-red-800 font-bold shadow-lg hover:shadow-xl' : 'bg-white hover:bg-gray-50'
                    }`}
                >
                    <span className={`text-xl font-medium ${isHoliday ? 'text-red-600' : 'text-gray-800'}`}>{day}</span>
                    {isHoliday && (
                        <div className="absolute inset-0 bg-red-200/50 p-2 pt-8 overflow-hidden">
                            <p className="text-xs font-semibold">{isHoliday.title}</p>
                            <Sun className="w-5 h-5 absolute bottom-1 right-1 opacity-70" />
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