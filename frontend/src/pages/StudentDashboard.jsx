import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import DashboardHeader from '../components/DashboardHeader';

const StudentDashboard = () => {
    const [allocation, setAllocation] = useState(null);
    const [hostelRequest, setHostelRequest] = useState(null);
    const [eligibility, setEligibility] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [requests, setRequests] = useState({ swaps: [], outpasses: [], tickets: [] });
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    const [showIneligiblePopup, setShowIneligiblePopup] = useState(false);
    const { user, logout, API_URL, getAuthHeader } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchAllData();
        }
    }, [user]);

    const fetchAllData = async () => {
        try {
            // Fetch allocation
            try {
                const allocRes = await axios.get(`${API_URL}/api/allocation/my-room/`, {
                    headers: getAuthHeader()
                });
                setAllocation(allocRes.data);
            } catch (err) { }

            // Fetch hostel request
            try {
                const reqRes = await axios.get(`${API_URL}/api/requests/hostel/list/`, {
                    headers: getAuthHeader()
                });
                if (reqRes.data && reqRes.data.length > 0) {
                    setHostelRequest(reqRes.data[0]);
                }
            } catch (err) { }

            // Fetch eligibility (only if profile has enrollment)
            if (user.enrollment_number) {
                try {
                    const eligRes = await axios.get(`${API_URL}/api/requests/hostel/eligibility/`, {
                        headers: getAuthHeader()
                    });
                    setEligibility(eligRes.data);
                } catch (err) { }
            }

            // Fetch other requests
            try {
                const [swapsRes, outpassRes, ticketsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/requests/swap/list/`, { headers: getAuthHeader() }),
                    axios.get(`${API_URL}/api/requests/outpass/list/`, { headers: getAuthHeader() }),
                    axios.get(`${API_URL}/api/operations/ticket/list/`, { headers: getAuthHeader() })
                ]);
                setRequests({
                    swaps: swapsRes.data,
                    outpasses: outpassRes.data,
                    tickets: ticketsRes.data
                });
            } catch (err) { }
        } finally {
            setDataLoaded(true);
        }
    };

    // Determine which popup to show
    useEffect(() => {
        if (user && dataLoaded && !hostelRequest && !allocation) {
            // New student without hostel request
            if (!user.is_profile_complete) {
                // Profile incomplete - show welcome popup
                setShowWelcomePopup(true);
            } else if (eligibility && !eligibility.eligible) {
                // Profile complete but not eligible - show ineligible popup
                setShowIneligiblePopup(true);
            }
        }
    }, [user, dataLoaded, hostelRequest, allocation, eligibility]);

    const handleWelcomeYes = () => {
        setShowWelcomePopup(false);
        navigate('/survey');
    };

    const handleWelcomeNo = () => {
        alert("You need hostel accommodation to use this system. Signing you out.");
        logout();
    };

    const handleIneligibleOk = () => {
        logout();
    };

    const getDisplayName = () => {
        if (user?.full_name && user.full_name !== user.username) {
            return user.full_name.split(' ')[0];
        }
        if (user?.first_name) {
            return user.first_name;
        }
        return user?.username || 'Student';
    };

    const getStatusClass = (status) => {
        if (['APPROVED', 'COMPLETED', 'RESOLVED'].includes(status)) return 'text-success';
        if (['REJECTED', 'CANCELLED'].includes(status)) return 'text-error';
        return 'text-warning';
    };

    if (!user) return <div className="container p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}><p>Loading...</p></div>;

    return (
        <div className="container p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Welcome Popup for First-time Students */}
            {showWelcomePopup && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '2rem'
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
                        <h2 style={{ marginBottom: '1rem' }}>Welcome to HiMate!</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            HiMate is a hostel allocation system designed to match you with compatible roommates
                            based on your lifestyle preferences.
                        </p>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                            Do you need hostel accommodation?
                        </h3>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleWelcomeNo}
                                className="btn btn-secondary"
                                style={{ padding: '1rem 2rem', minWidth: '120px' }}
                            >
                                No, Thanks
                            </button>
                            <button
                                onClick={handleWelcomeYes}
                                className="btn btn-primary"
                                style={{ padding: '1rem 2rem', minWidth: '120px' }}
                            >
                                Yes, I Need Hostel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ineligible Popup */}
            {showIneligiblePopup && eligibility && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '2rem'
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--color-error)' }}>Not Eligible for Hostel</h2>

                        <div style={{ background: 'var(--color-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                {eligibility.level} Level - Semester {eligibility.semester}
                            </p>
                            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
                                {eligibility.academic_year}
                            </p>
                        </div>

                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            {eligibility.reason}
                        </p>

                        <button
                            onClick={handleIneligibleOk}
                            className="btn btn-primary"
                            style={{ padding: '1rem 2rem', minWidth: '150px' }}
                        >
                            OK, Sign Out
                        </button>
                    </div>
                </div>
            )}

            {/* Header with Navigation */}
            <DashboardHeader
                title={`Hello, ${getDisplayName()} 👋`}
                subtitle={user.enrollment_number || 'Complete your profile to get started'}
                isWarden={false}
            />

            {/* Level Badge */}
            {eligibility && eligibility.level && (
                <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                    }}>
                        {eligibility.level} Level - Sem {eligibility.semester}
                    </span>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-2 my-8">
                {/* Allocation Status Card */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>🏠 Allocation Status</h3>
                    {allocation ? (
                        <div className="text-center">
                            <span className="status-available" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                                ALLOCATED
                            </span>
                            <div className="grid grid-cols-3 gap-4 my-8" style={{ background: 'var(--color-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Hostel</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: 0 }}>{allocation.hostel_name}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Room</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: 0 }}>{allocation.room?.room_number}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Bed</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: 0 }}>{allocation.bed?.bed_number || 'N/A'}</p>
                                </div>
                            </div>

                            {allocation.roommates?.length > 0 && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Roommates</h4>
                                    {allocation.roommates.map((r, i) => (
                                        <p key={i} style={{ margin: '0.25rem 0', color: 'white' }}>{r.name} (Bed {r.bed})</p>
                                    ))}
                                </div>
                            )}

                            {allocation.hostel_location?.latitude && (
                                <a
                                    href={`https://www.google.com/maps?q=${allocation.hostel_location.latitude},${allocation.hostel_location.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary mt-4"
                                    style={{ padding: '0.75rem 1.5rem' }}
                                >
                                    📍 View on Map
                                </a>
                            )}
                        </div>
                    ) : hostelRequest ? (
                        // Has hostel request - show pending allocation
                        <div className="text-center p-4">
                            <span className="status-occupied" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                                ⏳ Pending Allocation
                            </span>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                Your hostel request is being processed. The warden will allocate you soon.
                            </p>
                            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>
                                    <strong>Request Status:</strong> <span className={getStatusClass(hostelRequest.status)}>{hostelRequest.status}</span>
                                </p>
                                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>
                                    <strong>Semester:</strong> {hostelRequest.semester}
                                </p>
                                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>
                                    <strong>Submitted:</strong> {new Date(hostelRequest.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ) : !user.is_profile_complete ? (
                        // Profile not complete - prompt to complete survey
                        <div className="text-center p-4">
                            <p className="text-warning" style={{ marginBottom: '1rem' }}>⚠️ Profile Incomplete</p>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                Complete your preferences survey to request hostel accommodation.
                            </p>
                            <Link to="/survey" className="btn btn-primary">Complete Survey</Link>
                        </div>
                    ) : eligibility && !eligibility.eligible ? (
                        // Not eligible for hostel
                        <div className="text-center p-4">
                            <p className="text-error" style={{ marginBottom: '1rem' }}>🚫 Not Eligible</p>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                {eligibility.reason}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                {eligibility.level} Level - Semester {eligibility.semester}
                            </p>
                        </div>
                    ) : (
                        // Edge case - no request found
                        <div className="text-center p-4">
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                No hostel request found. Contact support if you need assistance.
                            </p>
                        </div>
                    )}
                </div>

                {/* Quick Actions Card */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>⚡ Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {!user.is_profile_complete && (
                            <Link to="/survey" className="btn btn-primary" style={{ padding: '1rem' }}>
                                📝 Complete Survey
                            </Link>
                        )}
                        {user.is_profile_complete && (
                            <Link to="/survey" className="btn btn-secondary" style={{ padding: '1rem' }}>
                                ✏️ Update Preferences
                            </Link>
                        )}
                        {allocation && (
                            <>
                                <Link to="/request/swap" className="btn btn-secondary" style={{ padding: '1rem' }}>
                                    🔄 Request Swap
                                </Link>
                                <Link to="/request/outpass" className="btn btn-secondary" style={{ padding: '1rem' }}>
                                    🎫 Request Outpass
                                </Link>
                                <Link to="/request/ticket" className="btn btn-secondary" style={{ padding: '1rem' }}>
                                    🔧 Report Issue
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* My Requests - Only show if allocated */}
            {allocation && (
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>📋 My Requests</h3>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Swap Requests */}
                        <div>
                            <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Swap Requests</h4>
                            {requests.swaps.length > 0 ? requests.swaps.slice(0, 3).map(swap => (
                                <div key={swap.id} style={{
                                    padding: '0.75rem',
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.875rem' }}>{swap.student_b_name || swap.student_b_enrollment}</span>
                                        <span className={getStatusClass(swap.status)} style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                            {swap.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <Link to={`/request/swap/${swap.id}`} style={{ fontSize: '0.875rem' }}>View</Link>
                                </div>
                            )) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No swap requests</p>}
                        </div>

                        {/* Outpasses */}
                        <div>
                            <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Outpasses</h4>
                            {requests.outpasses.length > 0 ? requests.outpasses.slice(0, 3).map(pass => (
                                <div key={pass.id} style={{
                                    padding: '0.75rem',
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.875rem' }}>{pass.leave_date}</span>
                                        <span className={getStatusClass(pass.status)} style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                            {pass.status}
                                        </span>
                                    </div>
                                    <Link to={`/request/outpass/${pass.id}`} style={{ fontSize: '0.875rem' }}>View</Link>
                                </div>
                            )) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No outpasses</p>}
                        </div>

                        {/* Tickets */}
                        <div>
                            <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Maintenance Tickets</h4>
                            {requests.tickets.length > 0 ? requests.tickets.slice(0, 3).map(ticket => (
                                <div key={ticket.id} style={{
                                    padding: '0.75rem',
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.875rem' }}>#{ticket.id} - {ticket.title?.substring(0, 20)}</span>
                                        <span className={getStatusClass(ticket.status)} style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                            {ticket.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <Link to={`/request/ticket/${ticket.id}`} style={{ fontSize: '0.875rem' }}>View</Link>
                                </div>
                            )) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No tickets</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
