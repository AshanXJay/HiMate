import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const WardenRequestsPage = () => {
    const { type } = useParams(); // swaps, outpasses, tickets
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchRequests();
    }, [type, filter]);

    const getApiUrl = () => {
        switch (type) {
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
            console.error("Failed to fetch requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action, approve = true) => {
        setActionLoading(true);
        try {
            let url, data;
            switch (type) {
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
            }

            await axios.post(url, data, { headers: getAuthHeader() });
            setSelectedRequest(null);
            setNotes('');
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const map = {
            'PENDING': 'status-pending', 'PENDING_B': 'status-pending',
            'PENDING_WARDEN': 'status-pending', 'VIEWED': 'status-viewed',
            'IN_PROGRESS': 'status-progress', 'APPROVED': 'status-approved',
            'REJECTED': 'status-rejected', 'OPEN': 'status-pending',
            'RESOLVED': 'status-approved', 'CLOSED': 'status-approved'
        };
        return map[status] || 'status-pending';
    };

    const getTitle = () => {
        switch (type) {
            case 'swaps': return '🔄 Swap Requests';
            case 'outpasses': return '🎫 Outpass Requests';
            case 'tickets': return '🔧 Maintenance Tickets';
            default: return 'Requests';
        }
    };

    const getFilters = () => {
        switch (type) {
            case 'swaps':
                return ['', 'PENDING_B', 'PENDING_WARDEN', 'APPROVED', 'REJECTED'];
            case 'outpasses':
                return ['', 'PENDING', 'APPROVED', 'REJECTED'];
            case 'tickets':
                return ['', 'OPEN', 'VIEWED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
            default:
                return [];
        }
    };

    if (loading) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container warden-requests-page">
            <div className="page-header">
                <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>
                    ← Back
                </button>
                <h1>{getTitle()}</h1>
                <select
                    className="filter-select"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    {getFilters().filter(f => f).map(f => (
                        <option key={f} value={f}>{f.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>

            <div className="requests-table">
                {requests.length === 0 ? (
                    <div className="empty-state">No requests found</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                {type === 'swaps' && <><th>From</th><th>To</th></>}
                                {type === 'outpasses' && <><th>Student</th><th>Dates</th><th>Destination</th></>}
                                {type === 'tickets' && <><th>Student</th><th>Category</th><th>Priority</th><th>Title</th></>}
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td>#{req.id}</td>

                                    {type === 'swaps' && (
                                        <>
                                            <td>{req.student_a_name}<br /><small>{req.student_a_room}</small></td>
                                            <td>{req.student_b_name}<br /><small>{req.student_b_room}</small></td>
                                        </>
                                    )}

                                    {type === 'outpasses' && (
                                        <>
                                            <td>{req.student_name}<br /><small>{req.student_enrollment}</small></td>
                                            <td>{req.leave_date} to {req.return_date}</td>
                                            <td>{req.destination || '-'}</td>
                                        </>
                                    )}

                                    {type === 'tickets' && (
                                        <>
                                            <td>{req.student_name}<br /><small>{req.room_info?.hostel} - {req.room_info?.room_number}</small></td>
                                            <td>{req.category}</td>
                                            <td><span className={`priority-badge priority-${req.priority?.toLowerCase()}`}>{req.priority}</span></td>
                                            <td>{req.title}</td>
                                        </>
                                    )}

                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>
                                            {req.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
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
                <div className="modal-overlay">
                    <div className="modal-content review-modal">
                        <h2>Review Request #{selectedRequest.id}</h2>

                        <div className="request-summary">
                            {type === 'swaps' && (
                                <>
                                    <p><strong>From:</strong> {selectedRequest.student_a_name} ({selectedRequest.student_a_room})</p>
                                    <p><strong>To:</strong> {selectedRequest.student_b_name} ({selectedRequest.student_b_room})</p>
                                    <p><strong>Reason:</strong> {selectedRequest.reason || 'No reason provided'}</p>
                                    <p><strong>Partner Agreed:</strong> {selectedRequest.student_b_agreed ? 'Yes' : 'No'}</p>
                                </>
                            )}

                            {type === 'outpasses' && (
                                <>
                                    <p><strong>Student:</strong> {selectedRequest.student_name}</p>
                                    <p><strong>Dates:</strong> {selectedRequest.leave_date} to {selectedRequest.return_date}</p>
                                    <p><strong>Destination:</strong> {selectedRequest.destination || 'Not specified'}</p>
                                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                                    <p><strong>Emergency Contact:</strong> {selectedRequest.emergency_contact || 'Not provided'}</p>
                                </>
                            )}

                            {type === 'tickets' && (
                                <>
                                    <p><strong>Student:</strong> {selectedRequest.student_name}</p>
                                    <p><strong>Location:</strong> {selectedRequest.room_info?.hostel} - {selectedRequest.room_info?.room_number}</p>
                                    <p><strong>Category:</strong> {selectedRequest.category}</p>
                                    <p><strong>Priority:</strong> {selectedRequest.priority}</p>
                                    <p><strong>Title:</strong> {selectedRequest.title}</p>
                                    <p><strong>Description:</strong> {selectedRequest.description}</p>
                                </>
                            )}
                        </div>

                        <div className="form-group">
                            <label>{type === 'tickets' ? 'Feedback' : 'Notes'}</label>
                            <textarea
                                className="input-field"
                                rows="3"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder={type === 'tickets' ? 'Add feedback for the student...' : 'Add any notes...'}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setSelectedRequest(null); setNotes(''); }}
                            >
                                Cancel
                            </button>

                            {type === 'tickets' ? (
                                <>
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => handleAction(selectedRequest.id, 'IN_PROGRESS')}
                                        disabled={actionLoading}
                                    >
                                        Mark In Progress
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleAction(selectedRequest.id, 'RESOLVED')}
                                        disabled={actionLoading}
                                    >
                                        Mark Resolved
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-danger"
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
            )}
        </div>
    );
};

export default WardenRequestsPage;
