// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api'; // Use the custom API instance

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, email, role }
  const [loading, setLoading] = useState(true);

  // --- Initial Load (Check Local Storage for Token) ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        // Simple check: In a real app, you'd verify the token freshness on the backend
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // --- Login Function ---
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    
    const { token, user: userData } = res.data;

    // Store data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // --- Logout Function ---
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  const contextValue = {
    user,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    loading,
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading user session...</div>;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};