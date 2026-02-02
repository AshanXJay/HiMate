import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import StatCard from '../components/StatCard';
import DashboardHeader from '../components/DashboardHeader';

const WardenDashboard = () => {
    const { API_URL, getAuthHeader } = useContext(AuthContext);
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
        } catch (err) { } finally {
            setLoading(false);
        }
    };

    const runAllocation = async () => {
        if (!window.confirm('Run smart allocation for all pending students?')) return;

        try {
            const res = await axios.post(`${API_URL}/api/allocation/run/`, {
                semester: '2025/2026 - Semester 1'
            }, { headers: getAuthHeader() });

            alert(res.data.message);
            fetchDashboardData();
        } catch (err) {
            alert('Allocation failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const resetAllocations = async () => {
        const confirmMsg = 'Are you sure you want to reset ALL allocations?\n\n' +
            'This will:\n' +
            '• Clear all room assignments\n' +
            '• Free all occupied beds\n' +
            '• Reset hostel requests to pending\n\n' +
            'Students will need to request hostel again.\n\n' +
            'Type "RESET" to confirm:';

        const input = window.prompt(confirmMsg);
        if (input !== 'RESET') {
            if (input !== null) alert('Reset cancelled. You must type "RESET" exactly.');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/allocation/reset/`, {
                semester: '2025/2026 - Semester 1',
                confirm: true
            }, { headers: getAuthHeader() });

            alert(`✅ ${res.data.message}\n\nAllocations cleared: ${res.data.allocations_cleared}\nBeds freed: ${res.data.beds_freed}`);
            fetchDashboardData();
        } catch (err) {
            alert('Reset failed: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) {
        return <div className="container p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}><p>Loading dashboard...</p></div>;
    }

    return (
        <div className="container p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header with Navigation */}
            <DashboardHeader
                title="Warden Dashboard"
                subtitle="Hostel Management System"
                isWarden={true}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-4 my-8">
                <StatCard icon="👨‍🎓" value={stats?.students?.total || 0} label="Total Students" color="primary" />
                <StatCard icon="✅" value={stats?.students?.allocated || 0} label="Allocated" color="success" />
                <StatCard icon="⏳" value={stats?.students?.pending_allocation || 0} label="Pending" color="warning" />
                <StatCard icon="🛏️" value={stats?.beds?.available || 0} label="Available Beds" color="default" />
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
                    <button
                        onClick={resetAllocations}
                        className="btn"
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--color-error)',
                            color: 'var(--color-error)'
                        }}
                    >
                        🔄 Reset Semester
                    </button>
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
                <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                    <Link to="/admin/requests/hostel" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>View Hostel Requests</Link>
                    <Link to="/admin/requests/swaps" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>View Swaps</Link>
                    <Link to="/admin/requests/outpasses" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>View Outpasses</Link>
                    <Link to="/admin/requests/tickets" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>View Tickets</Link>
                </div>
            </div>
        </div>
    );
};

export default WardenDashboard;
