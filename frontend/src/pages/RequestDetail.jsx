import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const RequestDetail = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { user, API_URL, getAuthHeader } = useContext(AuthContext);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchRequest();
    }, [type, id]);

    const fetchRequest = async () => {
        try {
            let url;
            switch (type) {
                case 'swap':
                    url = `${API_URL}/api/requests/swap/${id}/`;
                    break;
                case 'outpass':
                    url = `${API_URL}/api/requests/outpass/${id}/`;
                    break;
                case 'ticket':
                    url = `${API_URL}/api/operations/ticket/${id}/`;
                    break;
                default:
                    navigate('/dashboard');
                    return;
            }
            const res = await axios.get(url, { headers: getAuthHeader() });
            setRequest(res.data);
        } catch (err) {
            console.error("Failed to fetch request:", err);
            alert('Request not found');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSwapResponse = async (agree) => {
        setActionLoading(true);
        try {
            await axios.post(`${API_URL}/api/requests/swap/${id}/respond/`, { agree }, {
                headers: getAuthHeader()
            });
            alert(agree ? 'Swap approved! Waiting for warden.' : 'Swap declined.');
            fetchRequest();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to respond');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const map = {
            'PENDING': 'status-pending',
            'PENDING_B': 'status-pending',
            'PENDING_WARDEN': 'status-pending',
            'VIEWED': 'status-viewed',
            'IN_PROGRESS': 'status-progress',
            'APPROVED': 'status-approved',
            'REJECTED': 'status-rejected',
            'COMPLETED': 'status-approved',
            'OPEN': 'status-pending',
            'RESOLVED': 'status-approved',
            'CLOSED': 'status-approved'
        };
        return map[status] || 'status-pending';
    };

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (!request) return null;

    return (
        <div className="container request-detail-page">
            <button className="btn btn-secondary back-btn" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
            </button>

            <div className="card request-detail-card">
                <div className="request-header">
                    <h2>
                        {type === 'swap' && '🔄 Swap Request'}
                        {type === 'outpass' && '🎫 Outpass'}
                        {type === 'ticket' && '🔧 Maintenance Ticket'}
                    </h2>
                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status?.replace('_', ' ')}
                    </span>
                </div>

                {/* Request Details */}
                <div className="request-details">
                    {type === 'swap' && (
                        <>
                            <div className="detail-row">
                                <span className="label">Requested By</span>
                                <span className="value">{request.student_a_name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Current Room</span>
                                <span className="value">{request.student_a_room || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Swap With</span>
                                <span className="value">{request.student_b_name} ({request.student_b_enrollment})</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Their Room</span>
                                <span className="value">{request.student_b_room || 'N/A'}</span>
                            </div>
                            {request.reason && (
                                <div className="detail-row full">
                                    <span className="label">Reason</span>
                                    <span className="value">{request.reason}</span>
                                </div>
                            )}

                            {/* Partner Response Action */}
                            {request.status === 'PENDING_B' &&
                                user?.email &&
                                request.student_b === user.id && (
                                    <div className="action-section">
                                        <h4>Your Response Required</h4>
                                        <p>Do you agree to swap rooms with {request.student_a_name}?</p>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleSwapResponse(true)}
                                                disabled={actionLoading}
                                            >
                                                ✓ Agree to Swap
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleSwapResponse(false)}
                                                disabled={actionLoading}
                                            >
                                                ✗ Decline
                                            </button>
                                        </div>
                                    </div>
                                )}
                        </>
                    )}

                    {type === 'outpass' && (
                        <>
                            <div className="detail-row">
                                <span className="label">Leave Date</span>
                                <span className="value">{request.leave_date}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Return Date</span>
                                <span className="value">{request.return_date}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Duration</span>
                                <span className="value">{request.days_count} day(s)</span>
                            </div>
                            {request.destination && (
                                <div className="detail-row">
                                    <span className="label">Destination</span>
                                    <span className="value">{request.destination}</span>
                                </div>
                            )}
                            <div className="detail-row full">
                                <span className="label">Reason</span>
                                <span className="value">{request.reason}</span>
                            </div>

                            {/* QR Code for Approved Outpass */}
                            {request.status === 'APPROVED' && request.verification_code && (
                                <div className="verification-section">
                                    <h4>✅ Outpass Approved</h4>
                                    <div className="verification-code">
                                        <span className="code">{request.verification_code}</span>
                                        <small>Show this code to security</small>
                                    </div>
                                    {request.approved_at && (
                                        <p className="approved-time">
                                            Approved on: {new Date(request.approved_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {type === 'ticket' && (
                        <>
                            <div className="detail-row">
                                <span className="label">Category</span>
                                <span className="value">{request.category}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Priority</span>
                                <span className={`priority-badge priority-${request.priority?.toLowerCase()}`}>
                                    {request.priority}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Title</span>
                                <span className="value">{request.title}</span>
                            </div>
                            <div className="detail-row full">
                                <span className="label">Description</span>
                                <span className="value">{request.description}</span>
                            </div>
                            {request.room_info && (
                                <div className="detail-row">
                                    <span className="label">Location</span>
                                    <span className="value">
                                        {request.room_info.hostel} - Room {request.room_info.room_number}
                                    </span>
                                </div>
                            )}
                            {request.feedback && (
                                <div className="detail-row full feedback-row">
                                    <span className="label">Staff Feedback</span>
                                    <span className="value">{request.feedback}</span>
                                </div>
                            )}
                            {request.assigned_to && (
                                <div className="detail-row">
                                    <span className="label">Assigned To</span>
                                    <span className="value">{request.assigned_to}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Status Timeline */}
                {request.status_history?.length > 0 && (
                    <div className="timeline-section">
                        <h4>📅 Status Timeline</h4>
                        <div className="timeline">
                            {request.status_history.map((entry, i) => (
                                <div key={i} className="timeline-item">
                                    <div className="timeline-dot" />
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <span className={`status-badge small ${getStatusBadgeClass(entry.new_status)}`}>
                                                {entry.new_status?.replace('_', ' ')}
                                            </span>
                                            <span className="timeline-time">
                                                {new Date(entry.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        {entry.notes && <p className="timeline-notes">{entry.notes}</p>}
                                        <small className="timeline-by">by {entry.changed_by_name}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Warden Notes */}
                {request.warden_notes && (
                    <div className="warden-notes">
                        <h4>📝 Warden Notes</h4>
                        <p>{request.warden_notes}</p>
                    </div>
                )}

                <div className="request-meta">
                    <small>Created: {new Date(request.created_at).toLocaleString()}</small>
                    {request.updated_at && (
                        <small>Updated: {new Date(request.updated_at).toLocaleString()}</small>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
