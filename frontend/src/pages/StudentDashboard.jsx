import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const StudentDashboard = () => {
    const [allocation, setAllocation] = useState(null);
    const [requests, setRequests] = useState({ swaps: [], outpasses: [], tickets: [] });
    const { user, logout, API_URL, getAuthHeader } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            fetchAllocation();
            fetchMyRequests();
        }
    }, [user]);

    const fetchAllocation = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/allocation/my-room/`, {
                headers: getAuthHeader()
            });
            setAllocation(res.data);
        } catch (err) {
            console.log("Not allocated");
        }
    };

    const fetchMyRequests = async () => {
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
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    };

    // Get display name - prioritize full_name, then first_name, then username
    const getDisplayName = () => {
        if (user?.full_name && user.full_name !== user.username) {
            return user.full_name.split(' ')[0]; // First name
        }
        if (user?.first_name) {
            return user.first_name;
        }
        return user?.username || 'Student';
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'PENDING': 'status-pending',
            'PENDING_B': 'status-pending',
            'PENDING_WARDEN': 'status-pending',
            'VIEWED': 'status-viewed',
            'IN_PROGRESS': 'status-progress',
            'APPROVED': 'status-approved',
            'REJECTED': 'status-rejected',
            'COMPLETED': 'status-approved',
            'OPEN': 'status-pending',
            'RESOLVED': 'status-approved'
        };
        return statusColors[status] || 'status-pending';
    };

    if (!user) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container">
            <header className="dashboard-header">
                <div>
                    <h1 className="welcome-text">Hello, <span className="highlight">{getDisplayName()}</span> 👋</h1>
                    <p className="enrollment-badge">{user.enrollment_number || 'Pending Enrollment'}</p>
                </div>
                <button onClick={logout} className="btn btn-danger">Logout</button>
            </header>

            <div className="dashboard-grid">
                {/* Allocation Status Card */}
                <div className="card allocation-card">
                    <h3>🏠 Allocation Status</h3>
                    {allocation ? (
                        <div className="allocation-details">
                            <div className="status-badge status-approved">ALLOCATED</div>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="label">Hostel</span>
                                    <span className="value">{allocation.hostel_name}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Room</span>
                                    <span className="value">{allocation.room?.room_number}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Bed</span>
                                    <span className="value">{allocation.bed?.bed_number || 'N/A'}</span>
                                </div>
                            </div>

                            {allocation.roommates?.length > 0 && (
                                <div className="roommates-section">
                                    <h4>Roommates</h4>
                                    <ul>
                                        {allocation.roommates.map((r, i) => (
                                            <li key={i}>{r.name} (Bed {r.bed})</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {allocation.hostel_location?.latitude && (
                                <a
                                    href={`https://www.google.com/maps?q=${allocation.hostel_location.latitude},${allocation.hostel_location.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary mt-4"
                                >
                                    📍 View on Map
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="no-allocation">
                            {user.is_profile_complete ? (
                                <>
                                    <div className="status-badge status-pending">Pending Allocation</div>
                                    <p>Your profile is complete. Waiting for allocation.</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-warning">Profile Incomplete</p>
                                    <Link to="/survey" className="btn btn-primary">Complete Survey</Link>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Actions Card */}
                <div className="card actions-card">
                    <h3>⚡ Quick Actions</h3>
                    <div className="actions-grid">
                        {!user.is_profile_complete && (
                            <Link to="/survey" className="action-btn primary">
                                📝 Complete Survey
                            </Link>
                        )}
                        {user.is_profile_complete && (
                            <Link to="/survey" className="action-btn secondary">
                                ✏️ Update Preferences
                            </Link>
                        )}
                        {allocation && (
                            <>
                                <Link to="/request/swap" className="action-btn secondary">
                                    🔄 Request Swap
                                </Link>
                                <Link to="/request/outpass" className="action-btn secondary">
                                    🎫 Request Outpass
                                </Link>
                                <Link to="/request/ticket" className="action-btn secondary">
                                    🔧 Report Issue
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* My Requests Card */}
                <div className="card requests-card full-width">
                    <h3>📋 My Requests</h3>

                    {/* Tabs */}
                    <div className="requests-section">
                        {/* Swap Requests */}
                        {requests.swaps.length > 0 && (
                            <div className="request-group">
                                <h4>Swap Requests</h4>
                                {requests.swaps.slice(0, 3).map(swap => (
                                    <div key={swap.id} className="request-item">
                                        <div className="request-info">
                                            <span>With: {swap.student_b_name || swap.student_b_enrollment}</span>
                                            <span className={`status-badge ${getStatusBadge(swap.status)}`}>
                                                {swap.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <Link to={`/request/swap/${swap.id}`} className="view-link">View</Link>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Outpasses */}
                        {requests.outpasses.length > 0 && (
                            <div className="request-group">
                                <h4>Outpasses</h4>
                                {requests.outpasses.slice(0, 3).map(pass => (
                                    <div key={pass.id} className="request-item">
                                        <div className="request-info">
                                            <span>{pass.leave_date} - {pass.return_date}</span>
                                            <span className={`status-badge ${getStatusBadge(pass.status)}`}>
                                                {pass.status}
                                            </span>
                                        </div>
                                        <Link to={`/request/outpass/${pass.id}`} className="view-link">View</Link>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tickets */}
                        {requests.tickets.length > 0 && (
                            <div className="request-group">
                                <h4>Maintenance Tickets</h4>
                                {requests.tickets.slice(0, 3).map(ticket => (
                                    <div key={ticket.id} className="request-item">
                                        <div className="request-info">
                                            <span>#{ticket.id} - {ticket.title}</span>
                                            <span className={`status-badge ${getStatusBadge(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <Link to={`/request/ticket/${ticket.id}`} className="view-link">View</Link>
                                    </div>
                                ))}
                            </div>
                        )}

                        {requests.swaps.length === 0 && requests.outpasses.length === 0 && requests.tickets.length === 0 && (
                            <p className="no-requests">No active requests</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
