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


// CRITICAL: Replace with your actual Client ID (from your .env)
const GOOGLE_CLIENT_ID = "517507749773-540meojf7po9dii7h9d853ns2bh19nhh.apps.googleusercontent.com"; 


function App() {
  return (
    <Router>
      {/* WRAPPER: Entire app needs to be inside the GoogleOAuthProvider */}
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/announcements" element={<Announcements />} />
              {/* NEW ROUTE: Announcement Detail Page */}
              <Route path="/announcements/:id" element={<AnnouncementDetail />} /> 
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/search" element={<Search />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Core Content Routes */}
              <Route path="/year/:yearId" element={<YearPage />} />
              <Route path="/subject/:subjectId" element={<SubjectPage />} />

              {/* Admin Routes (PROTECTED) */}
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
      </GoogleOAuthProvider> {/* <-- END WRAPPER */}
    </Router>
  );
}

export default App;