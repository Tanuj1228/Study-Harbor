// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogIn, Calendar, Bell, Send, User, Menu, X, Users, LogOut } from 'lucide-react'; // Example icons

const NavLink = ({ to, children, icon: Icon }) => (
  <Link to={to} className="flex items-center space-x-1.5 py-2 px-3 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
    {Icon && <Icon className="w-4 h-4" />}
    <span className="hidden sm:inline">{children}</span>
  </Link>
);

const Navbar = () => {
  // FIX: Destructure 'user' object along with authentication state
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Home', icon: User },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/announcements', label: 'Announcements', icon: Bell },
    { to: '/feedback', label: 'Feedback', icon: Send },
    { to: '/about', label: 'About Us', icon: null },
    { to: '/contact', label: 'Contact Us', icon: null },
  ];

  // Dynamically set the button text
  const logoutButtonText = user?.name ? `${user.name.split(' ')[0]} | Logout` : 'Logout';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-white shadow-lg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Site Name */}
          <Link to="/" className="flex items-center text-2xl font-extrabold text-indigo-700">
            📚 Study Harbor
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} icon={item.icon}>{item.label}</NavLink>
            ))}
            
            {/* Conditional Admin Link */}
            {isAdmin && <NavLink to="/admin/dashboard" icon={Users}>Admin</NavLink>}
          </nav>

          {/* Auth/Mobile Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // FIX: Used the dynamically set logoutButtonText
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" /> {logoutButtonText}
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-1" /> Login/Register
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-gray-50 border-t"
        >
          <div className="flex flex-col p-4 space-y-2">
            {[...navItems, isAdmin && { to: '/admin/dashboard', label: 'Admin', icon: Users }].filter(Boolean).map(item => (
              <Link key={item.to} to={item.to} onClick={() => setIsOpen(false)} className="py-2 text-gray-700 hover:text-indigo-600 flex items-center space-x-2">
                {item.icon && <item.icon className="w-5 h-5" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;