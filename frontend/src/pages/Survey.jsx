import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const SurveyWizard = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader, refreshUserData } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        wake_up_time: '08:00',
        requires_darkness: false,
        cleanliness: 3,
        guest_tolerance: 3,
        dominance: 3
    });

    const totalSteps = 5;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.patch(`${API_URL}/api/profile/update/`, formData, {
                headers: getAuthHeader()
            });
            await refreshUserData();
            navigate('/dashboard');
        } catch (error) {
            console.error("Survey Update Error:", error.response);
            if (error.response?.status === 401) {
                alert("Session expired. Please login again.");
                navigate('/login');
            } else {
                alert('Error updating profile: ' + (error.response?.data?.detail || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="survey-step">
                        <div className="step-icon">🌅</div>
                        <h2>When do you naturally wake up?</h2>
                        <p className="step-description">
                            This helps us match you with roommates who have similar sleep schedules.
                        </p>
                        <div className="form-group">
                            <label>Wake Up Time</label>
                            <input
                                type="time"
                                className="input-field large"
                                value={formData.wake_up_time}
                                onChange={e => setFormData({ ...formData, wake_up_time: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="survey-step">
                        <div className="step-icon">🌙</div>
                        <h2>Can you sleep with lights on?</h2>
                        <p className="step-description">
                            Some people need complete darkness to sleep well.
                        </p>
                        <div className="toggle-options">
                            <button
                                type="button"
                                className={`toggle-btn ${!formData.requires_darkness ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, requires_darkness: false })}
                            >
                                <span className="toggle-icon">💡</span>
                                <span>Yes, I can sleep with some light</span>
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${formData.requires_darkness ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, requires_darkness: true })}
                            >
                                <span className="toggle-icon">🌑</span>
                                <span>No, I need complete darkness</span>
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="survey-step">
                        <div className="step-icon">🧹</div>
                        <h2>How tidy do you keep your space?</h2>
                        <p className="step-description">
                            Matching cleanliness preferences prevents conflicts.
                        </p>
                        <div className="slider-container">
                            <div className="slider-labels">
                                <span>Very Relaxed</span>
                                <span>Very Tidy</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                className="slider"
                                value={formData.cleanliness}
                                onChange={e => setFormData({ ...formData, cleanliness: parseInt(e.target.value) })}
                            />
                            <div className="slider-value">{formData.cleanliness}</div>
                            <div className="slider-description">
                                {formData.cleanliness === 1 && "I don't mind some mess around"}
                                {formData.cleanliness === 2 && "I clean when things get too messy"}
                                {formData.cleanliness === 3 && "I keep things reasonably organized"}
                                {formData.cleanliness === 4 && "I prefer a clean and organized space"}
                                {formData.cleanliness === 5 && "I keep my space spotlessly clean"}
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="survey-step">
                        <div className="step-icon">👥</div>
                        <h2>How often should friends visit?</h2>
                        <p className="step-description">
                            Guest preferences should align for peaceful coexistence.
                        </p>
                        <div className="slider-container">
                            <div className="slider-labels">
                                <span>Rarely</span>
                                <span>Often</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                className="slider"
                                value={formData.guest_tolerance}
                                onChange={e => setFormData({ ...formData, guest_tolerance: parseInt(e.target.value) })}
                            />
                            <div className="slider-value">{formData.guest_tolerance}</div>
                            <div className="slider-description">
                                {formData.guest_tolerance === 1 && "I prefer minimal visitors"}
                                {formData.guest_tolerance === 2 && "Occasional visitors are fine"}
                                {formData.guest_tolerance === 3 && "Normal amount of visitors"}
                                {formData.guest_tolerance === 4 && "I like having friends over"}
                                {formData.guest_tolerance === 5 && "The more the merrier!"}
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="survey-step">
                        <div className="step-icon">⚡</div>
                        <h2>After a long day, do you prefer...</h2>
                        <p className="step-description">
                            This helps us understand your social energy levels.
                        </p>
                        <div className="slider-container">
                            <div className="slider-labels">
                                <span>Alone Time</span>
                                <span>Socializing</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                className="slider"
                                value={formData.dominance}
                                onChange={e => setFormData({ ...formData, dominance: parseInt(e.target.value) })}
                            />
                            <div className="slider-value">{formData.dominance}</div>
                            <div className="slider-description">
                                {formData.dominance === 1 && "I definitely need quiet alone time"}
                                {formData.dominance === 2 && "I prefer some peaceful time"}
                                {formData.dominance === 3 && "I'm flexible either way"}
                                {formData.dominance === 4 && "I enjoy chatting and hanging out"}
                                {formData.dominance === 5 && "I love being around people!"}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="survey-container">
            <div className="card survey-card">
                {/* Progress Bar */}
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
                <div className="step-indicator">Step {step} of {totalSteps}</div>

                <form onSubmit={handleSubmit}>
                    {renderStep()}

                    <div className="survey-navigation">
                        {step > 1 && (
                            <button type="button" className="btn btn-secondary" onClick={prevStep}>
                                ← Back
                            </button>
                        )}
                        {step < totalSteps ? (
                            <button type="button" className="btn btn-primary" onClick={nextStep}>
                                Next →
                            </button>
                        ) : (
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Complete Survey ✓'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SurveyWizard;
