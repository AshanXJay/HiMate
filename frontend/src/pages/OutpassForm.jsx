import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';

const OutpassForm = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [formData, setFormData] = useState({
        leave_date: '',
        return_date: '',
        reason: '',
        destination: '',
        emergency_contact: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post(`${API_URL}/api/requests/outpass/`, formData, {
                headers: getAuthHeader()
            });
            toast.success('Outpass request submitted!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>🎫 Request Outpass</h2>
                <p style={{ marginBottom: '2rem' }}>
                    Request permission to leave the hostel premises for a specified period.
                </p>

                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(251, 113, 133, 0.1)',
                        border: '1px solid var(--color-error)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        color: 'var(--color-error)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>Leave Date *</label>
                            <input
                                type="date"
                                className="input-field"
                                min={today}
                                value={formData.leave_date}
                                onChange={e => setFormData({ ...formData, leave_date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Return Date *</label>
                            <input
                                type="date"
                                className="input-field"
                                min={formData.leave_date || today}
                                value={formData.return_date}
                                onChange={e => setFormData({ ...formData, return_date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Reason *</label>
                        <textarea
                            className="input-field"
                            rows="4"
                            placeholder="Explain why you need to leave..."
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            required
                            style={{ resize: 'vertical', minHeight: '100px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Destination</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Where are you going?"
                            value={formData.destination}
                            onChange={e => setFormData({ ...formData, destination: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Emergency Contact</label>
                        <input
                            type="tel"
                            className="input-field"
                            placeholder="Emergency contact number"
                            value={formData.emergency_contact}
                            onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-between" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OutpassForm;
