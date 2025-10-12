// frontend/src/App.jsx

// ... imports ...
import ProtectedRoute from './components/ProtectedRoute'; // <-- IMPORT

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* ... Public and Auth Routes ... */}

            {/* Core Content Routes (Public viewing access) */}
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

            {/* Placeholder for 404 */}
            <Route path="*" element={<h1>404: Not Found</h1>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;