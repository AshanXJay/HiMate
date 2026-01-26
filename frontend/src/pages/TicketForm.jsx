import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const TicketForm = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: 'OTHER',
        priority: 'MEDIUM',
        title: '',
        description: ''
    });
    const [error, setError] = useState('');

    const categories = [
        { value: 'WIFI', label: '📶 WiFi' },
        { value: 'PLUMBING', label: '🚿 Plumbing' },
        { value: 'ELECTRICAL', label: '💡 Electrical' },
        { value: 'FURNITURE', label: '🪑 Furniture' },
        { value: 'CLEANING', label: '🧹 Cleaning' },
        { value: 'AC_FAN', label: '❄️ AC/Fan' },
        { value: 'DOOR_LOCK', label: '🔒 Door/Lock' },
        { value: 'OTHER', label: '📋 Other' }
    ];

    const priorities = [
        { value: 'LOW', label: 'Low - Can wait a few days' },
        { value: 'MEDIUM', label: 'Medium - Should be fixed soon' },
        { value: 'HIGH', label: 'High - Urgent attention needed' },
        { value: 'URGENT', label: 'Urgent - Critical issue!' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post(`${API_URL}/api/operations/ticket/`, formData, {
                headers: getAuthHeader()
            });
            alert('Maintenance ticket submitted!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container form-page">
            <div className="card form-card">
                <h2>🔧 Report Maintenance Issue</h2>
                <p className="form-description">
                    Report any maintenance or inventory issues in your room or common areas.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Category *</label>
                        <div className="category-grid">
                            {categories.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    className={`category-btn ${formData.category === cat.value ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Priority *</label>
                        <select
                            className="input-field"
                            value={formData.priority}
                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                        >
                            {priorities.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Brief description of the issue"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            className="input-field"
                            rows="4"
                            placeholder="Provide details about the issue..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketForm;
