// frontend/src/pages/Feedback.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Feedback = () => {
    const { user, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        userEmail: isAuthenticated ? user.email : '',
        userName: isAuthenticated ? user.name : '',
        message: '',
    });
    const [status, setStatus] = useState({ type: null, message: '' }); // 'success' or 'error'
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        try {
            await api.post('/feedback', formData);
            setStatus({ 
                type: 'success', 
                message: 'Thank you for your feedback! Please check your email for an automated confirmation.' 
            });
            // Clear message input only
            setFormData({ ...formData, message: '' });

        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data?.msg || 'Feedback failed to send. Please try again later.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className="max-w-xl mx-auto my-12 p-8 bg-white rounded-xl shadow-2xl border border-gray-100"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <h2 className="text-3xl font-bold text-center text-indigo-700 mb-4 flex items-center justify-center space-x-3">
                <Send className="w-7 h-7" />
                <span>Send Feedback</span>
            </h2>
            <p className="text-center text-gray-600 mb-8">
                Tell us how we can improve the Notes Portal. We appreciate your input!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name (Optional, pre-filled if logged in) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="userName">Your Name (Optional)</label>
                    <input
                        id="userName"
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isAuthenticated}
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="userEmail">Email Address (For Auto-Reply)</label>
                    <input
                        id="userEmail"
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isAuthenticated}
                    />
                </div>

                {/* Message */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">Your Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="5"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    ></textarea>
                </div>

                {/* Status Message */}
                {status.type && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`p-4 rounded-lg flex items-center space-x-2 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span>{status.message}</span>
                    </motion.div>
                )}

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 text-white rounded-lg font-semibold transition-colors shadow-md ${isSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default Feedback;