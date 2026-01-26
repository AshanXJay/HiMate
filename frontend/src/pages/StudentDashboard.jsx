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

    if (!user) return <div className="container p-8"><p>Loading...</p></div>;

    return (
        <div className="container p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-4" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Hello, <span style={{ color: 'var(--color-primary)' }}>{getDisplayName()}</span> 👋
                    </h1>
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        color: 'var(--color-primary)'
                    }}>
                        {user.enrollment_number || 'Pending Enrollment'}
                    </span>
                </div>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                    Logout
                </button>
            </div>

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
                    ) : (
                        <div className="text-center p-4">
                            {user.is_profile_complete ? (
                                <>
                                    <span className="status-occupied" style={{ display: 'inline-block', marginBottom: '1rem' }}>Pending Allocation</span>
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

            {/* My Requests */}
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
        </div>
    );
};

export default StudentDashboard;
