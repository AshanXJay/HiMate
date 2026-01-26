import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { user, loginWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'WARDEN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    const handleSuccess = async (credentialResponse) => {
        try {
            const userData = await loginWithGoogle(credentialResponse);
            if (userData.role === 'WARDEN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMsg = error.response?.data?.error ||
                'Login failed. Please ensure you are using a @std.uwu.ac.lk account.';
            alert(errorMsg);
        }
    };

    const handleError = () => {
        alert('Google Login Failed. Please try again.');
    };

    return (
        <div className="flex items-center justify-center w-full h-screen relative overflow-hidden" style={{ background: 'black' }}>
            {/* Ambient Background */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'var(--color-primary)',
                opacity: 0.1,
                borderRadius: '50%',
                filter: 'blur(120px)',
                pointerEvents: 'none'
            }}></div>

            <div className="card relative z-10" style={{
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                background: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(16px)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--color-surface-hover)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    fontSize: '2rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    🏛️
                </div>

                <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>HiMate Portal</h1>
                <p style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>
                    The Official Residence Allocation System for<br />
                    <span style={{ color: 'white', fontWeight: '500' }}>Uva Wellassa University</span>
                </p>

                <div className="flex justify-center mb-4" style={{ transform: 'scale(1.05)', transition: 'transform 0.3s' }}>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap
                        shape="pill"
                        theme="filled_black"
                        size="large"
                        text="continue_with"
                        width="250"
                    />
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem' }}>
                        Authorized Access Only.
                        <span style={{ display: 'block', marginTop: '0.25rem', opacity: 0.5 }}>
                            Please use your university email (@std.uwu.ac.lk)
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
