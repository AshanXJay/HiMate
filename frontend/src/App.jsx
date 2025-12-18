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
import { AuthProvider, AuthContext } from './AuthContext';

// REPLACE WITH YOUR REAL CLIENT ID
// REPLACE WITH YOUR REAL CLIENT ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "your-google-client-id-here";

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
              <Route path="survey" element={<Survey />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="admin/dashboard" element={<WardenDashboard />} />
              <Route path="rooms" element={<RoomGrid />} />
              <Route path="admin/allocation" element={<AllocationControl />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
