import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import StatCard from './StatCard';
import DashboardHeader from './DashboardHeader';

const AllocationControl = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [allocations, setAllocations] = useState([]);
    const [stats, setStats] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState('2025/2026 - Semester 1');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Use the same stats endpoint as admin dashboard
            const [allocRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/api/allocation/list/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/api/operations/dashboard/stats/`, { headers: getAuthHeader() })
            ]);
            setAllocations(allocRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPreview = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/allocation/preview/?semester=${encodeURIComponent(semester)}`, {
                headers: getAuthHeader()
            });
            setPreview(res.data);
        } catch (err) {
            console.error("Error fetching preview:", err);
            alert('Failed to generate preview');
        }
    };

    const runAllocation = async () => {
        if (!window.confirm(`Run allocation for ${semester}? This will assign students to rooms.`)) return;

        try {
            const res = await axios.post(`${API_URL}/api/allocation/run/`, { semester }, {
                headers: getAuthHeader()
            });
            alert(res.data.message);
            fetchData();
            setPreview(null);
        } catch (err) {
            alert('Allocation failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const filteredAllocations = allocations.filter(a => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            a.student?.email?.toLowerCase().includes(search) ||
            a.student?.username?.toLowerCase().includes(search) ||
            a.room?.room_number?.toLowerCase().includes(search) ||
            a.hostel_name?.toLowerCase().includes(search)
        );
    });

    if (loading) return <div className="container p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}><p>Loading...</p></div>;

    return (
        <div className="container p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header with Navigation */}
            <DashboardHeader
                title="Allocation Management"
                subtitle="Room Assignment System"
                isWarden={true}
            />

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/admin/dashboard')}>
                        ← Back
                    </button>
                    <h1 style={{ margin: 0 }}>📊 Allocation Management</h1>
                </div>
                <select
                    className="input-field"
                    style={{ width: 'auto' }}
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                >
                    <option value="2025/2026 - Semester 1">2025/2026 - Semester 1</option>
                    <option value="2025/2026 - Semester 2">2025/2026 - Semester 2</option>
                    <option value="2026/2027 - Semester 1">2026/2027 - Semester 1</option>
                </select>
            </div>

            {/* Stats - using same data as admin dashboard */}
            {stats && (
                <div className="grid grid-cols-4 gap-4 my-8">
                    <StatCard icon="👨‍🎓" value={stats.students?.total || 0} label="Total Students" color="primary" />
                    <StatCard icon="✅" value={stats.students?.allocated || 0} label="Allocated" color="success" />
                    <StatCard icon="⏳" value={stats.students?.pending_allocation || 0} label="Pending" color="warning" />
                    <StatCard icon="🛏️" value={stats.beds?.available || 0} label="Available Beds" color="default" />
                </div>
            )}

            {/* Actions */}
            <div className="card mb-4">
                <h3 style={{ marginBottom: '1rem' }}>⚡ Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button className="btn btn-secondary" onClick={fetchPreview}>
                        👁️ Preview Allocation
                    </button>
                    <button className="btn btn-primary" onClick={runAllocation}>
                        🧠 Run Smart Allocation
                    </button>
                </div>
            </div>

            {/* Preview */}
            {preview && (
                <div className="card mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 style={{ margin: 0 }}>📋 Allocation Preview</h3>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setPreview(null)}>
                            Close
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>👨 Male Students</h4>
                            <p style={{ fontSize: '0.875rem' }}>{preview.male?.eligible || 0} eligible, {preview.male?.groups?.length || 0} groups</p>
                            {preview.male?.groups?.slice(0, 3).map((group, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                                    <div className="flex justify-between">
                                        <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Group {i + 1}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Score: {group.avg_compatibility?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                    <ul style={{ listStyle: 'none', marginTop: '0.5rem', padding: 0 }}>
                                        {group.students?.map((s, j) => (
                                            <li key={j} style={{ fontSize: '0.875rem', padding: '0.25rem 0' }}>{s.name} ({s.enrollment})</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>👩 Female Students</h4>
                            <p style={{ fontSize: '0.875rem' }}>{preview.female?.eligible || 0} eligible, {preview.female?.groups?.length || 0} groups</p>
                            {preview.female?.groups?.slice(0, 3).map((group, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                                    <div className="flex justify-between">
                                        <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Group {i + 1}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Score: {group.avg_compatibility?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                    <ul style={{ listStyle: 'none', marginTop: '0.5rem', padding: 0 }}>
                                        {group.students?.map((s, j) => (
                                            <li key={j} style={{ fontSize: '0.875rem', padding: '0.25rem 0' }}>{s.name} ({s.enrollment})</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Allocations Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <h3 style={{ margin: 0 }}>📋 Current Allocations ({filteredAllocations.length})</h3>
                    <input
                        type="text"
                        className="input-field"
                        style={{ maxWidth: '250px' }}
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredAllocations.length === 0 ? (
                    <div className="text-center p-8" style={{ color: 'var(--color-text-muted)' }}>No allocations found</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-surface-hover)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Student</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Hostel</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Room</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Bed</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Semester</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAllocations.map(alloc => (
                                <tr key={alloc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        {alloc.student?.profile?.full_name || alloc.student?.username}
                                        <br /><small style={{ color: 'var(--color-text-muted)' }}>{alloc.student?.profile?.enrollment_number || 'N/A'}</small>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{alloc.hostel_name}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{alloc.room?.room_number}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{alloc.bed?.bed_number || '-'}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{alloc.semester}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{alloc.allocated_at ? new Date(alloc.allocated_at).toLocaleDateString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AllocationControl;
