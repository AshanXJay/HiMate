import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Survey from './pages/Survey';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
import RoomGrid from './components/RoomGrid';
import AllocationControl from './components/AllocationControl';
import RequireAuth from './components/RequireAuth';
import { AuthProvider, AuthContext } from './AuthContext';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Home = () => {
  const { user, loading } = React.useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'WARDEN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  return null; // Or a loading spinner
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />

              {/* Student Routes */}
              <Route path="dashboard" element={
                <RequireAuth allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </RequireAuth>
              } />
              <Route path="survey" element={
                <RequireAuth allowedRoles={['STUDENT']}>
                  <Survey />
                </RequireAuth>
              } />

              {/* Warden Routes */}
              <Route path="admin/dashboard" element={
                <RequireAuth allowedRoles={['WARDEN']}>
                  <WardenDashboard />
                </RequireAuth>
              } />
              <Route path="admin/allocation" element={
                <RequireAuth allowedRoles={['WARDEN']}>
                  <AllocationControl />
                </RequireAuth>
              } />

              {/* Shared Routes (if any, e.g. Rooms might be viewable by both) */}
              <Route path="rooms" element={<RoomGrid />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
