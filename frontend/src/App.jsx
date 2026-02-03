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
import SwapRequestForm from './pages/SwapRequestForm';
import OutpassForm from './pages/OutpassForm';
import TicketForm from './pages/TicketForm';
import RequestDetail from './pages/RequestDetail';
import HostelManagement from './pages/HostelManagement';
import WardenRequestsPage from './pages/WardenRequestsPage';
import RequireAuth from './components/RequireAuth';
import { AuthProvider, AuthContext } from './AuthContext';
import { ToastProvider } from './components/Toast';
import { ModalProvider } from './components/Modal';

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

  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
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

                  {/* Student Request Forms */}
                  <Route path="request/swap" element={
                    <RequireAuth allowedRoles={['STUDENT']}>
                      <SwapRequestForm />
                    </RequireAuth>
                  } />
                  <Route path="request/outpass" element={
                    <RequireAuth allowedRoles={['STUDENT']}>
                      <OutpassForm />
                    </RequireAuth>
                  } />
                  <Route path="request/ticket" element={
                    <RequireAuth allowedRoles={['STUDENT']}>
                      <TicketForm />
                    </RequireAuth>
                  } />

                  {/* Request Detail (both student and warden can view) */}
                  <Route path="request/:type/:id" element={
                    <RequireAuth allowedRoles={['STUDENT', 'WARDEN']}>
                      <RequestDetail />
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
                  <Route path="admin/hostels" element={
                    <RequireAuth allowedRoles={['WARDEN']}>
                      <HostelManagement />
                    </RequireAuth>
                  } />
                  <Route path="admin/requests/:type" element={
                    <RequireAuth allowedRoles={['WARDEN']}>
                      <WardenRequestsPage />
                    </RequireAuth>
                  } />
                  <Route path="admin/tickets" element={
                    <RequireAuth allowedRoles={['WARDEN']}>
                      <WardenRequestsPage />
                    </RequireAuth>
                  } />

                  {/* Shared Routes */}
                  <Route path="rooms" element={<RoomGrid />} />
                </Route>
              </Routes>
            </Router>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
