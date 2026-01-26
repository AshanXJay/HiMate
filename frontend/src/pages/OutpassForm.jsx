import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const OutpassForm = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
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
            alert('Outpass request submitted!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="container form-page">
            <div className="card form-card">
                <h2>🎫 Request Outpass</h2>
                <p className="form-description">
                    Request permission to leave the hostel premises for a specified period.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
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

                    <div className="form-actions">
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
