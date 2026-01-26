import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const AllocationControl = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [allocations, setAllocations] = useState([]);
    const [stats, setStats] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState('Spring 2026');
    const [filter, setFilter] = useState({ hostel: '', search: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [allocRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/api/allocation/list/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/api/allocation/stats/`, { headers: getAuthHeader() })
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
            const res = await axios.get(`${API_URL}/api/allocation/preview/?semester=${semester}`, {
                headers: getAuthHeader()
            });
            setPreview(res.data);
        } catch (err) {
            console.error("Error fetching preview:", err);
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
        if (filter.search) {
            const search = filter.search.toLowerCase();
            const matches =
                a.student?.email?.toLowerCase().includes(search) ||
                a.student?.username?.toLowerCase().includes(search) ||
                a.room?.room_number?.toLowerCase().includes(search);
            if (!matches) return false;
        }
        return true;
    });

    if (loading) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container allocation-control">
            <div className="page-header">
                <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>
                    ← Back
                </button>
                <h1>📊 Allocation Management</h1>
                <div className="header-actions">
                    <select
                        className="filter-select"
                        value={semester}
                        onChange={e => setSemester(e.target.value)}
                    >
                        <option value="Spring 2026">Spring 2026</option>
                        <option value="Fall 2026">Fall 2026</option>
                        <option value="Spring 2027">Spring 2027</option>
                    </select>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card info">
                        <div className="stat-icon">👨‍🎓</div>
                        <div className="stat-content">
                            <h3>{stats.students.profile_complete}</h3>
                            <p>Ready</p>
                        </div>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>{stats.students.allocated}</h3>
                            <p>Allocated</p>
                        </div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <h3>{stats.students.pending}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                    <div className="stat-card primary">
                        <div className="stat-icon">🛏️</div>
                        <div className="stat-content">
                            <h3>{stats.beds.available}</h3>
                            <p>Available Beds</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Allocation Actions */}
            <div className="card actions-card">
                <h3>⚡ Actions</h3>
                <div className="actions-grid">
                    <button className="action-btn secondary" onClick={fetchPreview}>
                        👁️ Preview Allocation
                    </button>
                    <button className="action-btn primary" onClick={runAllocation}>
                        🧠 Run Smart Allocation
                    </button>
                </div>
            </div>

            {/* Preview Modal */}
            {preview && (
                <div className="card preview-card">
                    <div className="preview-header">
                        <h3>📋 Allocation Preview</h3>
                        <button className="btn btn-sm btn-secondary" onClick={() => setPreview(null)}>
                            Close
                        </button>
                    </div>
                    <div className="preview-content">
                        <div className="preview-section">
                            <h4>👨 Male Students</h4>
                            <p>{preview.male.eligible} eligible students, {preview.male.groups.length} room groups</p>
                            {preview.male.groups.slice(0, 3).map((group, i) => (
                                <div key={i} className="preview-group">
                                    <span className="group-label">Group {i + 1}</span>
                                    <span className="compatibility">
                                        Score: {group.avg_compatibility?.toFixed(1) || 'N/A'}
                                    </span>
                                    <ul>
                                        {group.students.map((s, j) => (
                                            <li key={j}>{s.name} ({s.enrollment})</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="preview-section">
                            <h4>👩 Female Students</h4>
                            <p>{preview.female.eligible} eligible students, {preview.female.groups.length} room groups</p>
                            {preview.female.groups.slice(0, 3).map((group, i) => (
                                <div key={i} className="preview-group">
                                    <span className="group-label">Group {i + 1}</span>
                                    <span className="compatibility">
                                        Score: {group.avg_compatibility?.toFixed(1) || 'N/A'}
                                    </span>
                                    <ul>
                                        {group.students.map((s, j) => (
                                            <li key={j}>{s.name} ({s.enrollment})</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Current Allocations Table */}
            <div className="card allocations-card">
                <div className="card-header">
                    <h3>📋 Current Allocations ({filteredAllocations.length})</h3>
                    <input
                        type="text"
                        className="input-field search-input"
                        placeholder="Search..."
                        value={filter.search}
                        onChange={e => setFilter({ ...filter, search: e.target.value })}
                    />
                </div>

                {filteredAllocations.length === 0 ? (
                    <div className="empty-state">No allocations found</div>
                ) : (
                    <table className="allocations-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Enrollment</th>
                                <th>Hostel</th>
                                <th>Room</th>
                                <th>Bed</th>
                                <th>Semester</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAllocations.map(alloc => (
                                <tr key={alloc.id}>
                                    <td>{alloc.student?.profile?.full_name || alloc.student?.username}</td>
                                    <td>{alloc.student?.profile?.enrollment_number || 'N/A'}</td>
                                    <td>{alloc.hostel_name}</td>
                                    <td>{alloc.room?.room_number}</td>
                                    <td>{alloc.bed?.bed_number || '-'}</td>
                                    <td>{alloc.semester}</td>
                                    <td>{alloc.allocated_at ? new Date(alloc.allocated_at).toLocaleDateString() : '-'}</td>
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
