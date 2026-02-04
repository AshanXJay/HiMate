import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import { useModal } from '../components/Modal';

const SurveyWizard = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader, refreshUserData } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const modal = useModal();
    const [formData, setFormData] = useState({
        wake_up_time: '08:00',
        requires_darkness: false,
        cleanliness: 3,
        guest_tolerance: 3,
        dominance: 3
    });

    const totalSteps = 5;

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await axios.patch(`${API_URL}/api/profile/update/`, formData, {
                headers: getAuthHeader()
            });

            try {
                await axios.post(`${API_URL}/api/requests/hostel/`, {
                    reason: "Hostel accommodation requested via survey completion"
                }, { headers: getAuthHeader() });
            } catch (hostelErr) {
                if (hostelErr.response?.status === 403) {
                    const data = hostelErr.response.data;
                    modal.showInfo('Not Eligible for Hostel', `${data.reason}\n\nLevel: ${data.level}\nSemester: ${data.semester}`);
                }
            }

            await refreshUserData();
            navigate('/dashboard');
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else {
                toast.error('Error updating profile: ' + (error.response?.data?.detail || error.message));
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
                    <div className="text-center p-4">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌅</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>When do you naturally wake up?</h2>
                        <p style={{ marginBottom: '2rem' }}>This helps us match you with roommates who have similar sleep schedules.</p>
                        <div className="form-group" style={{ maxWidth: '200px', margin: '0 auto' }}>
                            <input
                                type="time"
                                className="input-field text-center"
                                style={{ fontSize: '1.5rem', textAlign: 'center' }}
                                value={formData.wake_up_time}
                                onChange={e => setFormData({ ...formData, wake_up_time: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="text-center p-4">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌙</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Can you sleep with lights on?</h2>
                        <p style={{ marginBottom: '2rem' }}>Some people need complete darkness to sleep well.</p>
                        <div className="flex flex-col gap-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                            <button
                                type="button"
                                className={formData.requires_darkness ? 'btn btn-secondary' : 'btn btn-primary'}
                                onClick={() => setFormData({ ...formData, requires_darkness: false })}
                            >
                                💡 Yes, I can sleep with some light
                            </button>
                            <button
                                type="button"
                                className={formData.requires_darkness ? 'btn btn-primary' : 'btn btn-secondary'}
                                onClick={() => setFormData({ ...formData, requires_darkness: true })}
                            >
                                🌑 No, I need complete darkness
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="text-center p-4">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧹</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>How tidy do you keep your space?</h2>
                        <p style={{ marginBottom: '2rem' }}>Matching cleanliness preferences prevents conflicts.</p>
                        <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', maxWidth: '400px', margin: '0 auto' }}>
                            <div className="flex justify-between" style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <span>Very Relaxed</span>
                                <span>Very Tidy</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                                value={formData.cleanliness}
                                onChange={e => setFormData({ ...formData, cleanliness: parseInt(e.target.value) })}
                            />
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', margin: '1rem 0' }}>
                                {formData.cleanliness}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                {formData.cleanliness === 1 && "I don't mind some mess around"}
                                {formData.cleanliness === 2 && "I clean when things get too messy"}
                                {formData.cleanliness === 3 && "I keep things reasonably organized"}
                                {formData.cleanliness === 4 && "I prefer a clean and organized space"}
                                {formData.cleanliness === 5 && "I keep my space spotlessly clean"}
                            </p>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="text-center p-4">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>How often should friends visit?</h2>
                        <p style={{ marginBottom: '2rem' }}>Guest preferences should align for peaceful coexistence.</p>
                        <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', maxWidth: '400px', margin: '0 auto' }}>
                            <div className="flex justify-between" style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <span>Rarely</span>
                                <span>Often</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                                value={formData.guest_tolerance}
                                onChange={e => setFormData({ ...formData, guest_tolerance: parseInt(e.target.value) })}
                            />
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', margin: '1rem 0' }}>
                                {formData.guest_tolerance}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                {formData.guest_tolerance === 1 && "I prefer minimal visitors"}
                                {formData.guest_tolerance === 2 && "Occasional visitors are fine"}
                                {formData.guest_tolerance === 3 && "Normal amount of visitors"}
                                {formData.guest_tolerance === 4 && "I like having friends over"}
                                {formData.guest_tolerance === 5 && "The more the merrier!"}
                            </p>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="text-center p-4">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>After a long day, do you prefer...</h2>
                        <p style={{ marginBottom: '2rem' }}>This helps us understand your social energy levels.</p>
                        <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', maxWidth: '400px', margin: '0 auto' }}>
                            <div className="flex justify-between" style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <span>Alone Time</span>
                                <span>Socializing</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                                value={formData.dominance}
                                onChange={e => setFormData({ ...formData, dominance: parseInt(e.target.value) })}
                            />
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', margin: '1rem 0' }}>
                                {formData.dominance}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                {formData.dominance === 1 && "I definitely need quiet alone time"}
                                {formData.dominance === 2 && "I prefer some peaceful time"}
                                {formData.dominance === 3 && "I'm flexible either way"}
                                {formData.dominance === 4 && "I enjoy chatting and hanging out"}
                                {formData.dominance === 5 && "I love being around people!"}
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                {/* Progress Bar */}
                <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '9999px', marginBottom: '1rem', overflow: 'hidden' }}>
                    <div
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--color-primary), #FF9933)',
                            borderRadius: '9999px',
                            width: `${(step / totalSteps) * 100}%`,
                            transition: 'width 0.3s ease'
                        }}
                    />
                </div>
                <p className="text-center" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Step {step} of {totalSteps}
                </p>

                <div>
                    {renderStep()}

                    <div className="flex justify-between mt-4" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                        {step > 1 && (
                            <button type="button" className="btn btn-secondary" onClick={prevStep}>
                                ← Back
                            </button>
                        )}
                        <div style={{ marginLeft: 'auto' }}>
                            {step < totalSteps ? (
                                <button type="button" className="btn btn-primary" onClick={nextStep}>
                                    Next →
                                </button>
                            ) : (
                                <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
                                    {loading ? 'Saving...' : 'Complete Survey ✓'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyWizard;
