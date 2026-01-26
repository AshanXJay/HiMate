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

    const getStatusClass = (status) => {
        if (['APPROVED', 'COMPLETED', 'RESOLVED', 'CLOSED'].includes(status)) return 'text-success';
        if (['REJECTED', 'CANCELLED'].includes(status)) return 'text-error';
        return 'text-warning';
    };

    if (loading) return <div className="container p-8"><p>Loading...</p></div>;
    if (!request) return null;

    return (
        <div className="container p-8" style={{ maxWidth: '700px' }}>
            <button
                className="btn btn-secondary mb-4"
                style={{ padding: '0.5rem 1rem' }}
                onClick={() => navigate('/dashboard')}
            >
                ← Back to Dashboard
            </button>

            <div className="card">
                <div className="flex justify-between items-center mb-4" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ margin: 0 }}>
                        {type === 'swap' && '🔄 Swap Request'}
                        {type === 'outpass' && '🎫 Outpass'}
                        {type === 'ticket' && '🔧 Maintenance Ticket'}
                    </h2>
                    <span className={getStatusClass(request.status)} style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid currentColor',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                    }}>
                        {request.status?.replace('_', ' ')}
                    </span>
                </div>

                {/* Request Details */}
                <div style={{ marginBottom: '1.5rem' }}>
                    {type === 'swap' && (
                        <>
                            <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Requested By</span>
                                <span>{request.student_a_name}</span>
                            </div>
                            <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Current Room</span>
                                <span>{request.student_a_room || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Swap With</span>
                                <span>{request.student_b_name} ({request.student_b_enrollment})</span>
                            </div>
                            <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Their Room</span>
                                <span>{request.student_b_room || 'N/A'}</span>
                            </div>
                            {request.reason && (
                                <div className="p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Reason</p>
                                    <p style={{ margin: 0, color: 'white' }}>{request.reason}</p>
                                </div>
                            )}

                            {/* Partner Response Action */}
                            {request.status === 'PENDING_B' && user?.id === request.student_b && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1.5rem',
                                    background: 'rgba(255, 102, 0, 0.1)',
                                    border: '1px solid var(--color-primary)',
                                    borderRadius: 'var(--radius-lg)'
                                }}>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Your Response Required</h4>
                                    <p style={{ marginBottom: '1rem' }}>Do you agree to swap rooms with {request.student_a_name}?</p>
                                    <div className="flex gap-4">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleSwapResponse(true)}
                                            disabled={actionLoading}
                                        >
                                            ✓ Agree to Swap
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ border: '1px solid var(--color-error)', color: 'var(--color-error)' }}
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
                            <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Leave Date</span>
                                <span>{request.leave_date}</span>
                            </div>
                            <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Return Date</span>
                                <span>{request.return_date}</span>
                            </div>
                            {request.destination && (
                                <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Destination</span>
                                    <span>{request.destination}</span>
                                </div>
                            )}
                            <div className="p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Reason</p>
                                <p style={{ margin: 0, color: 'white' }}>{request.reason}</p>
                            </div>

                            {/* Verification Code for Approved */}
                            {request.status === 'APPROVED' && request.verification_code && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1.5rem',
                                    background: 'rgba(74, 222, 128, 0.1)',
                                    border: '1px solid var(--color-success)',
                                    borderRadius: 'var(--radius-lg)',
                                    textAlign: 'center'
                                }}>
                                    <h4 style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>✅ Outpass Approved</h4>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: '700',
                                        letterSpacing: '0.2em',
                                        color: 'var(--color-success)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {request.verification_code}
                                    </div>
                                    <small style={{ color: 'var(--color-text-muted)' }}>Show this code to security</small>
                                </div>
                            )}
                        </>
                    )}

                    {type === 'ticket' && (
                        <>
                            <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Category</span>
                                <span>{request.category}</span>
                            </div>
                            <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Priority</span>
                                <span style={{
                                    color: request.priority === 'URGENT' || request.priority === 'HIGH'
                                        ? 'var(--color-error)'
                                        : request.priority === 'MEDIUM'
                                            ? 'var(--color-warning)'
                                            : 'var(--color-success)'
                                }}>
                                    {request.priority}
                                </span>
                            </div>
                            <div className="flex justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Title</span>
                                <span>{request.title}</span>
                            </div>
                            <div className="p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Description</p>
                                <p style={{ margin: 0, color: 'white' }}>{request.description}</p>
                            </div>
                            {request.feedback && (
                                <div className="p-4" style={{ background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Staff Feedback</p>
                                    <p style={{ margin: 0, color: 'white' }}>{request.feedback}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Meta */}
                <div className="flex justify-between" style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span>Created: {new Date(request.created_at).toLocaleString()}</span>
                    {request.updated_at && <span>Updated: {new Date(request.updated_at).toLocaleString()}</span>}
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
