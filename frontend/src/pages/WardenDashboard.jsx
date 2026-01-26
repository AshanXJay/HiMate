import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const WardenDashboard = () => {
    const { API_URL, getAuthHeader, logout } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [pendingRequests, setPendingRequests] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, requestsRes] = await Promise.all([
                axios.get(`${API_URL}/api/operations/dashboard/stats/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/api/operations/dashboard/requests/`, { headers: getAuthHeader() })
            ]);
            setStats(statsRes.data);
            setPendingRequests(requestsRes.data);
        } catch (err) {
            console.error("Error fetching dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const runAllocation = async () => {
        if (!window.confirm('Run smart allocation for all pending students?')) return;

        try {
            const res = await axios.post(`${API_URL}/api/allocation/run/`, {
                semester: 'Spring 2026'
            }, { headers: getAuthHeader() });

            alert(res.data.message);
            fetchDashboardData();
        } catch (err) {
            alert('Allocation failed: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) {
        return <div className="container p-8"><p>Loading dashboard...</p></div>;
    }

    return (
        <div className="container p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-4" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Warden Dashboard</h1>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Hostel Management System</p>
                </div>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                    Logout
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 my-8">
                <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                    <div className="flex items-center gap-4">
                        <span style={{ fontSize: '2rem' }}>👨‍🎓</span>
                        <div>
                            <h3 style={{ fontSize: '1.75rem', margin: 0 }}>{stats?.students?.total || 0}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Total Students</p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                    <div className="flex items-center gap-4">
                        <span style={{ fontSize: '2rem' }}>✅</span>
                        <div>
                            <h3 style={{ fontSize: '1.75rem', margin: 0 }}>{stats?.students?.allocated || 0}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Allocated</p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                    <div className="flex items-center gap-4">
                        <span style={{ fontSize: '2rem' }}>⏳</span>
                        <div>
                            <h3 style={{ fontSize: '1.75rem', margin: 0 }}>{stats?.students?.pending_allocation || 0}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Pending</p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #06b6d4' }}>
                    <div className="flex items-center gap-4">
                        <span style={{ fontSize: '2rem' }}>🛏️</span>
                        <div>
                            <h3 style={{ fontSize: '1.75rem', margin: 0 }}>{stats?.beds?.available || 0}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Available Beds</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Occupancy Rate */}
            <div className="card mb-4">
                <h3 style={{ marginBottom: '1rem' }}>🏠 Occupancy Rate</h3>
                <div style={{ height: '12px', background: 'var(--color-border)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--color-success), var(--color-warning))',
                            width: `${stats?.beds?.occupancy_rate || 0}%`,
                            borderRadius: '9999px'
                        }}
                    />
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {stats?.beds?.occupied || 0} / {stats?.beds?.total || 0} beds occupied ({stats?.beds?.occupancy_rate || 0}%)
                </p>
            </div>

            {/* Quick Actions */}
            <div className="card mb-4">
                <h3 style={{ marginBottom: '1rem' }}>⚡ Quick Actions</h3>
                <div className="grid grid-cols-4 gap-4">
                    <button onClick={runAllocation} className="btn btn-primary">
                        🧠 Run Smart Allocation
                    </button>
                    <Link to="/admin/allocation" className="btn btn-secondary">
                        👁️ View Allocations
                    </Link>
                    <Link to="/admin/hostels" className="btn btn-secondary">
                        🏨 Manage Hostels
                    </Link>
                    <Link to="/rooms" className="btn btn-secondary">
                        🚪 View Rooms
                    </Link>
                </div>
            </div>

            {/* Pending Summary */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>📋 Pending Requests</h3>
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-4" style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                            {stats?.requests?.pending_hostel || 0}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Hostel Requests</span>
                    </div>
                    <div className="text-center p-4" style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                            {stats?.requests?.pending_swaps || 0}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Swap Requests</span>
                    </div>
                    <div className="text-center p-4" style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                            {stats?.requests?.pending_outpasses || 0}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Outpasses</span>
                    </div>
                    <div className="text-center p-4" style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                            {stats?.tickets?.total_active || 0}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Open Tickets</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Link to="/admin/requests/swaps" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>View Swaps</Link>
                    <Link to="/admin/requests/outpasses" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>View Outpasses</Link>
                    <Link to="/admin/requests/tickets" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>View Tickets</Link>
                </div>
            </div>
        </div>
    );
};

export default WardenDashboard;
