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
        return <div className="container"><p>Loading dashboard...</p></div>;
    }

    return (
        <div className="container warden-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Warden Dashboard</h1>
                    <p className="text-muted">Hostel Management System</p>
                </div>
                <button onClick={logout} className="btn btn-danger">Logout</button>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">👨‍🎓</div>
                    <div className="stat-content">
                        <h3>{stats?.students?.total || 0}</h3>
                        <p>Total Students</p>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats?.students?.allocated || 0}</h3>
                        <p>Allocated</p>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <h3>{stats?.students?.pending_allocation || 0}</h3>
                        <p>Pending</p>
                    </div>
                </div>
                <div className="stat-card info">
                    <div className="stat-icon">🛏️</div>
                    <div className="stat-content">
                        <h3>{stats?.beds?.available || 0}</h3>
                        <p>Available Beds</p>
                    </div>
                </div>
            </div>

            {/* Occupancy Overview */}
            <div className="card occupancy-card">
                <h3>🏠 Occupancy Rate</h3>
                <div className="occupancy-bar-container">
                    <div
                        className="occupancy-bar"
                        style={{ width: `${stats?.beds?.occupancy_rate || 0}%` }}
                    />
                </div>
                <p className="occupancy-text">
                    {stats?.beds?.occupied || 0} / {stats?.beds?.total || 0} beds occupied
                    ({stats?.beds?.occupancy_rate || 0}%)
                </p>
            </div>

            {/* Admin Actions */}
            <div className="card actions-card">
                <h3>⚡ Quick Actions</h3>
                <div className="actions-grid">
                    <button onClick={runAllocation} className="action-btn primary">
                        🧠 Run Smart Allocation
                    </button>
                    <Link to="/admin/allocation" className="action-btn secondary">
                        👁️ View Allocations
                    </Link>
                    <Link to="/admin/hostels" className="action-btn secondary">
                        🏨 Manage Hostels
                    </Link>
                    <Link to="/rooms" className="action-btn secondary">
                        🚪 View Rooms
                    </Link>
                </div>
            </div>

            {/* Pending Requests Overview */}
            <div className="pending-section">
                <div className="card requests-summary">
                    <h3>📋 Pending Requests</h3>
                    <div className="request-counts">
                        <div className="count-item">
                            <span className="count">{stats?.requests?.pending_hostel || 0}</span>
                            <span className="label">Hostel Requests</span>
                        </div>
                        <div className="count-item">
                            <span className="count">{stats?.requests?.pending_swaps || 0}</span>
                            <span className="label">Swap Requests</span>
                        </div>
                        <div className="count-item">
                            <span className="count">{stats?.requests?.pending_outpasses || 0}</span>
                            <span className="label">Outpasses</span>
                        </div>
                        <div className="count-item">
                            <span className="count">{stats?.tickets?.total_active || 0}</span>
                            <span className="label">Open Tickets</span>
                        </div>
                    </div>
                    <div className="request-links">
                        <Link to="/admin/requests/swaps" className="btn btn-secondary">View Swaps</Link>
                        <Link to="/admin/requests/outpasses" className="btn btn-secondary">View Outpasses</Link>
                        <Link to="/admin/tickets" className="btn btn-secondary">View Tickets</Link>
                    </div>
                </div>
            </div>

            {/* Recent Tickets */}
            {pendingRequests?.tickets?.length > 0 && (
                <div className="card tickets-card">
                    <h3>🔧 Recent Maintenance Issues</h3>
                    <div className="tickets-list">
                        {pendingRequests.tickets.slice(0, 5).map(ticket => (
                            <div key={ticket.id} className="ticket-item">
                                <div className="ticket-info">
                                    <span className={`priority-badge priority-${ticket.priority?.toLowerCase()}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="ticket-category">{ticket.category}</span>
                                    <span className="ticket-title">{ticket.title}</span>
                                </div>
                                <div className="ticket-meta">
                                    <span className="ticket-room">{ticket.room_info?.hostel} - {ticket.room_info?.room_number}</span>
                                    <Link to={`/admin/ticket/${ticket.id}`} className="btn btn-sm">View</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tickets by Category */}
            {stats?.tickets?.by_category?.length > 0 && (
                <div className="card category-card">
                    <h3>📊 Issues by Category</h3>
                    <div className="category-bars">
                        {stats.tickets.by_category.map((cat, i) => (
                            <div key={i} className="category-item">
                                <span className="category-name">{cat.category}</span>
                                <div className="category-bar-container">
                                    <div
                                        className="category-bar"
                                        style={{
                                            width: `${Math.min(100, (cat.count / Math.max(...stats.tickets.by_category.map(c => c.count))) * 100)}%`
                                        }}
                                    />
                                </div>
                                <span className="category-count">{cat.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardenDashboard;
