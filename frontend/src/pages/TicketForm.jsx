import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';

const TicketForm = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
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
        { value: 'AC_FAN', label: '❄️ Fan' },
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
            toast.success('Maintenance ticket submitted!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>🔧 Report Maintenance Issue</h2>
                <p style={{ marginBottom: '2rem' }}>
                    Report any maintenance or inventory issues in your room or common areas.
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
                    <div className="form-group">
                        <label>Category *</label>
                        <div className="grid grid-cols-4 gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    className={formData.category === cat.value ? 'btn btn-primary' : 'btn btn-secondary'}
                                    style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem' }}
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
                            style={{ resize: 'vertical', minHeight: '100px' }}
                        />
                    </div>

                    <div className="flex justify-between" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
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
