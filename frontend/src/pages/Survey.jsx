import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SurveyWizard = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        wake_up_time: '08:00',
        requires_darkness: false,
        cleanliness: 3,
        guest_tolerance: 3,
        dominance: 3
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            await axios.patch('http://127.0.0.1:8000/api/profile/update/', formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            navigate('/dashboard');
        } catch (error) {
            alert('Error updating profile');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <div className="card">
                <h2>Preferences Survey</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Wake Up Time</label>
                        <input
                            type="time"
                            className="input-field"
                            value={formData.wake_up_time}
                            onChange={e => setFormData({ ...formData, wake_up_time: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Needs Darkness to Sleep?</label>
                        <select
                            className="input-field"
                            value={formData.requires_darkness}
                            onChange={e => setFormData({ ...formData, requires_darkness: e.target.value === 'true' })}
                        >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Cleanliness (1-5)</label>
                        <input
                            type="number" min="1" max="5"
                            className="input-field"
                            value={formData.cleanliness}
                            onChange={e => setFormData({ ...formData, cleanliness: parseInt(e.target.value) })}
                        />
                    </div>

                    <button className="btn btn-primary">Save Preferences</button>
                </form>
            </div>
        </div>
    );
};

export default SurveyWizard;
