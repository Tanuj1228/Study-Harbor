// frontend/src/components/Layout.jsx
import React from 'react';
// NEW IMPORTS: useLocation, Navigate for routing control
import { useLocation, Navigate } from 'react-router-dom'; 
import Navbar from './Navbar'; 
// NEW IMPORT: to check user status
import { useAuth } from '../context/AuthContext.jsx'; 

// Define paths that are allowed BEFORE login (Home is NOT public here)
const PUBLIC_PATHS = ['/login', '/register', '/about', '/contact', '/feedback', '/search'];

function Layout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isPublicPath = PUBLIC_PATHS.includes(location.pathname);

  // 1. Show loading screen while checking auth state
  if (loading) {
    return <div className="text-center p-20 text-indigo-600 text-lg">Loading session...</div>;
  }

  // 2. Route Guard Logic (CRITICAL)
  // If the user is NOT authenticated and they are accessing a protected page, redirect to login.
  if (!isAuthenticated && !isPublicPath) {
    // Redirect to login, storing the current path for later redirect after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 3. Render the application (If authenticated OR if on a public path)
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar /> 
      
      <main className="container mx-auto p-4 flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="text-center p-4 text-sm text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} Notes Portal | Built with ❤️ by a dedicated student.
      </footer>
    </div>
  );
}

export default Layout;