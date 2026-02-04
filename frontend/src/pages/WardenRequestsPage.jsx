import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { useToast } from '../components/Toast';

const WardenRequestsPage = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchRequests();
    }, [type, filter]);

    const getApiUrl = () => {
        switch (type) {
            case 'hostel': return `${API_URL}/api/requests/hostel/list/`;
            case 'swaps': return `${API_URL}/api/requests/swap/list/`;
            case 'outpasses': return `${API_URL}/api/requests/outpass/list/`;
            case 'tickets': return `${API_URL}/api/operations/ticket/list/`;
            default: return null;
        }
    };

    const fetchRequests = async () => {
        try {
            let url = getApiUrl();
            if (!url) {
                navigate('/admin/dashboard');
                return;
            }
            if (filter) url += `?status=${filter}`;

            const res = await axios.get(url, { headers: getAuthHeader() });
            setRequests(res.data);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action, approve = true) => {
        setActionLoading(true);
        try {
            let url, data;
            switch (type) {
                case 'hostel':
                    if (action !== 'REJECTED') {
                        toast.warning('Only rejection is allowed. Allocation is handled automatically.');
                        setActionLoading(false);
                        return;
                    }
                    if (!notes.trim()) {
                        toast.warning('Rejection reason is required');
                        setActionLoading(false);
                        return;
                    }
                    url = `${API_URL}/api/requests/hostel/${requestId}/status/`;
                    data = { status: 'REJECTED', rejection_reason: notes };
                    break;
                case 'swaps':
                    url = `${API_URL}/api/requests/swap/${requestId}/approve/`;
                    data = { approve, notes };
                    break;
                case 'outpasses':
                    url = `${API_URL}/api/requests/outpass/${requestId}/approve/`;
                    data = { approve, notes };
                    break;
                case 'tickets':
                    url = `${API_URL}/api/operations/ticket/${requestId}/update/`;
                    data = { status: action, feedback: notes };
                    break;
                default:
                    return;
            }

            // Use PATCH for hostel status updates, POST for others
            if (type === 'hostel') {
                await axios.patch(url, data, { headers: getAuthHeader() });
            } else {
                await axios.post(url, data, { headers: getAuthHeader() });
            }
            setSelectedRequest(null);
            setNotes('');
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusClass = (status) => {
        if (['APPROVED', 'COMPLETED', 'RESOLVED', 'CLOSED', 'ALLOCATED'].includes(status)) return 'text-success';
        if (['REJECTED', 'CANCELLED'].includes(status)) return 'text-error';
        return 'text-warning';
    };

    const getTitle = () => {
        switch (type) {
            case 'hostel': return '🏠 Hostel Requests';
            case 'swaps': return '🔄 Swap Requests';
            case 'outpasses': return '🎫 Outpass Requests';
            case 'tickets': return '🔧 Maintenance Tickets';
            default: return 'Requests';
        }
    };

    const getFilters = () => {
        switch (type) {
            case 'hostel': return ['', 'PENDING', 'ALLOCATED', 'REJECTED'];
            case 'swaps': return ['', 'PENDING_B', 'PENDING_WARDEN', 'APPROVED', 'REJECTED'];
            case 'outpasses': return ['', 'PENDING', 'APPROVED', 'REJECTED'];
            case 'tickets': return ['', 'OPEN', 'VIEWED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
            default: return [];
        }
    };

    if (loading) return <div className="container p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}><p>Loading...</p></div>;

    return (
        <div className="container p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header with Navigation */}
            <DashboardHeader
                title={getTitle()}
                subtitle="Request Management"
                isWarden={true}
            />

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/admin/dashboard')}>
                        ← Back
                    </button>
                    <h1 style={{ margin: 0 }}>{getTitle()}</h1>
                </div>
                <select
                    className="input-field"
                    style={{ width: 'auto' }}
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    {getFilters().filter(f => f).map(f => (
                        <option key={f} value={f}>{f.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Requests Table */}
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                {requests.length === 0 ? (
                    <div className="text-center p-8" style={{ color: 'var(--color-text-muted)' }}>No requests found</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-surface-hover)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>ID</th>
                                {type === 'hostel' && <><th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Student</th><th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Semester</th></>}
                                {type === 'swaps' && <><th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>From</th><th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>To</th></>}
                                {type === 'outpasses' && <><th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Student</th><th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Dates</th></>}
                                {type === 'tickets' && <><th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Category</th><th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Title</th></>}
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Date</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>#{req.id}</td>

                                    {type === 'hostel' && (
                                        <>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.student_name}<br /><small style={{ color: 'var(--color-text-muted)' }}>{req.student_enrollment}</small></td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.semester}<br /><small style={{ color: 'var(--color-text-muted)' }}>{req.academic_year}</small></td>
                                        </>
                                    )}

                                    {type === 'swaps' && (
                                        <>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.student_a_name}<br /><small style={{ color: 'var(--color-text-muted)' }}>{req.student_a_room}</small></td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.student_b_name}<br /><small style={{ color: 'var(--color-text-muted)' }}>{req.student_b_room}</small></td>
                                        </>
                                    )}

                                    {type === 'outpasses' && (
                                        <>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.student_name}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.leave_date} to {req.return_date}</td>
                                        </>
                                    )}

                                    {type === 'tickets' && (
                                        <>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.category}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.title}</td>
                                        </>
                                    )}

                                    <td style={{ padding: '1rem' }}>
                                        <span className={getStatusClass(req.status)} style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                                            {req.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                            onClick={() => setSelectedRequest(req)}
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Review Modal */}
            {selectedRequest && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Review Request #{selectedRequest.id}</h2>

                        <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                            {type === 'hostel' && (
                                <>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Student:</strong> {selectedRequest.student_name}</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Enrollment:</strong> {selectedRequest.student_enrollment}</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Semester:</strong> {selectedRequest.semester} ({selectedRequest.academic_year})</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Batch:</strong> {selectedRequest.student_batch || 'N/A'}</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Gender:</strong> {selectedRequest.student_gender || 'N/A'}</p>
                                    <p style={{ margin: 0 }}><strong>Reason:</strong> {selectedRequest.reason || 'Not provided'}</p>
                                </>
                            )}

                            {type === 'swaps' && (
                                <>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>From:</strong> {selectedRequest.student_a_name} ({selectedRequest.student_a_room})</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>To:</strong> {selectedRequest.student_b_name} ({selectedRequest.student_b_room})</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Reason:</strong> {selectedRequest.reason || 'No reason provided'}</p>
                                    <p style={{ margin: 0 }}><strong>Partner Agreed:</strong> {selectedRequest.student_b_agreed ? 'Yes' : 'No'}</p>
                                </>
                            )}

                            {type === 'outpasses' && (
                                <>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Student:</strong> {selectedRequest.student_name}</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Dates:</strong> {selectedRequest.leave_date} to {selectedRequest.return_date}</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Destination:</strong> {selectedRequest.destination || 'Not specified'}</p>
                                    <p style={{ margin: 0 }}><strong>Reason:</strong> {selectedRequest.reason}</p>
                                </>
                            )}

                            {type === 'tickets' && (
                                <>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Category:</strong> {selectedRequest.category}</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Priority:</strong> {selectedRequest.priority}</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Title:</strong> {selectedRequest.title}</p>
                                    <p style={{ margin: 0 }}><strong>Description:</strong> {selectedRequest.description}</p>
                                </>
                            )}
                        </div>

                        <div className="form-group">
                            <label>
                                {type === 'hostel' ? 'Rejection Reason (Required)' : type === 'tickets' ? 'Feedback' : 'Notes'}
                            </label>
                            <textarea
                                className="input-field"
                                rows="3"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder={
                                    type === 'hostel' ? 'Provide a reason for rejection (required)...' :
                                        type === 'tickets' ? 'Add feedback for the student...' :
                                            'Add any notes...'
                                }
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="flex justify-between" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setSelectedRequest(null); setNotes(''); }}
                            >
                                Cancel
                            </button>

                            <div className="flex gap-4">
                                {type === 'hostel' ? (
                                    <>
                                        {selectedRequest.status === 'PENDING' ? (
                                            <button
                                                className="btn"
                                                style={{
                                                    background: 'var(--color-error)',
                                                    color: 'white',
                                                    opacity: notes.trim() ? 1 : 0.5
                                                }}
                                                onClick={() => handleAction(selectedRequest.id, 'REJECTED')}
                                                disabled={actionLoading || !notes.trim()}
                                            >
                                                {actionLoading ? 'Rejecting...' : 'Reject Request'}
                                            </button>
                                        ) : selectedRequest.status === 'ALLOCATED' ? (
                                            <span className="text-success" style={{ fontWeight: '600' }}>
                                                ✅ Already Allocated
                                            </span>
                                        ) : selectedRequest.status === 'REJECTED' ? (
                                            <span className="text-error" style={{ fontWeight: '600' }}>
                                                ❌ Already Rejected
                                            </span>
                                        ) : null}
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 'auto 0', maxWidth: '200px' }}>
                                            Allocation is automatic via "Run Smart Allocation"
                                        </p>
                                    </>
                                ) : type === 'tickets' ? (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
                                            onClick={() => handleAction(selectedRequest.id, 'IN_PROGRESS')}
                                            disabled={actionLoading}
                                        >
                                            In Progress
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleAction(selectedRequest.id, 'RESOLVED')}
                                            disabled={actionLoading}
                                        >
                                            Resolved
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                            onClick={() => handleAction(selectedRequest.id, null, false)}
                                            disabled={actionLoading}
                                        >
                                            Reject
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleAction(selectedRequest.id, null, true)}
                                            disabled={actionLoading}
                                        >
                                            Approve
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardenRequestsPage;
