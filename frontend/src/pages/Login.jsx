// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
// NEW IMPORTS: useLocation to get the redirect path
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
// NEW IMPORTS
import { GoogleLogin } from '@react-oauth/google'; 
import api from '../utils/api'; 

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // <-- Get the location object
    
    // Determine where to redirect: either the page they tried to access, or the homepage '/'
    const from = location.state?.from?.pathname || '/'; 

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Manual Login Handler ---
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      try {
        const user = await login(formData.email, formData.password);
        
        // Navigate based on role OR redirect to the original requested page
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate(from); // Send to original destination or '/'
        }
      } catch (err) {
        setError(err.response?.data?.msg || 'Login failed. Check your credentials.');
      }
    };

    // --- Google Login Handler ---
    const handleGoogleSuccess = async (credentialResponse) => {
      setError('');
      
      try {
          const res = await api.post('/auth/google', { token: credentialResponse.credential });
          const { token: appToken, user: userData } = res.data;
          
          localStorage.setItem('token', appToken);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Navigate based on role OR redirect to the original requested page
          if (userData.role === 'admin') {
              window.location.href = '/admin/dashboard';
          } else {
              window.location.href = from; // Send to original destination or '/'
          }
          
      } catch (err) {
          setError(err.response?.data?.msg || 'Google Sign-In failed on server verification. Try manual login.');
      }
    };

    const handleGoogleError = () => {
      setError('Google Sign-In failed. Please try again.');
    };


    return (
      <motion.div
        className="max-w-md mx-auto my-12 p-8 bg-white rounded-xl shadow-2xl border border-gray-100"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Student Login</h2>
        
        {/* NEW: GOOGLE LOGIN BUTTON */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text="signin_with"
          />
        </div>
        <div className="text-center text-gray-500 mb-8">OR</div>

        {/* MANUAL LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            />
          </div>
          
          {error && (
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 text-white bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
          >
            Sign In
          </motion.button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? 
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
            Register Here
          </Link>
        </p>
      </motion.div>
    );
};

export default Login;