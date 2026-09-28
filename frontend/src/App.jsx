// frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute'; 
import { GoogleOAuthProvider } from '@react-oauth/google'; 

// Import ALL Pages and Components (Ensure these files exist in the correct paths!)
import Layout from './components/Layout';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Announcements from './pages/Announcements';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import YearPage from './pages/YearPage';
import SubjectPage from './pages/SubjectPage';
import Feedback from './pages/Feedback';
import About from './pages/About';
import Contact from './pages/Contact';
import Search from './pages/Search';
// NEW IMPORT for Announcement Detail Page
import AnnouncementDetail from './pages/AnnouncementDetail';


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "517507749773-540meojf7po9dii7h9d853ns2bh19nhh.apps.googleusercontent.com"; 


function App() {
  return (
    <Router>
      {/* WRAPPER: Entire app needs to be inside the GoogleOAuthProvider */}
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
        <AuthProvider>
          <Layout>
            <Routes>
              {/* PUBLIC/UNPROTECTED ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedback" element={<Feedback />} />
              
              {/* PROTECTED ROUTES (Requires Login) */}
              <Route 
                path="/calendar" 
                element={<ProtectedRoute><Calendar /></ProtectedRoute>} 
              />
              <Route 
                path="/announcements" 
                element={<ProtectedRoute><Announcements /></ProtectedRoute>} 
              />
              <Route 
                path="/announcements/:id" 
                element={<ProtectedRoute><AnnouncementDetail /></ProtectedRoute>} 
              />
              <Route 
                path="/search" 
                element={<ProtectedRoute><Search /></ProtectedRoute>} 
              />
              <Route 
                path="/year/:yearId" 
                element={<ProtectedRoute><YearPage /></ProtectedRoute>} 
              />
              <Route 
                path="/subject/:subjectId" 
                element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} 
              />

              {/* ADMIN ONLY ROUTE (Already Protected) */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* 404 */}
              <Route path="*" element={<h1>404: Not Found</h1>} />
            </Routes>
          </Layout>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;