import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const SwapRequestForm = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        student_b_enrollment: '',
        reason: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post(`${API_URL}/api/requests/swap/`, formData, {
                headers: getAuthHeader()
            });
            alert('Swap request submitted! Waiting for partner approval.');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.student_b_enrollment?.[0] || err.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container form-page">
            <div className="card form-card">
                <h2>🔄 Request Room Swap</h2>
                <p className="form-description">
                    Request to swap rooms with another student. They will need to approve before the warden reviews.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Partner's Enrollment Number *</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., UWU/CST/22/001"
                            value={formData.student_b_enrollment}
                            onChange={e => setFormData({ ...formData, student_b_enrollment: e.target.value })}
                            required
                        />
                        <small>Enter the enrollment number of the student you want to swap with</small>
                    </div>

                    <div className="form-group">
                        <label>Reason for Swap</label>
                        <textarea
                            className="input-field"
                            rows="4"
                            placeholder="Explain why you want to swap rooms..."
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
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

export default SwapRequestForm;
