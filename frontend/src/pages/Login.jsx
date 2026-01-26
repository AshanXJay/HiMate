import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { user, loginWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if already logged in
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
        <div className="login-page">
            <div className="card login-card">
                <div className="logo">🏛️</div>
                <h1>HiMate Portal</h1>
                <p className="tagline">
                    Smart Hostel Allocation System<br />
                    <span style={{ color: 'var(--primary-light)', fontWeight: 500 }}>
                        Uva Wellassa University
                    </span>
                </p>

                <div className="google-btn">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap
                        shape="pill"
                        theme="filled_black"
                        size="large"
                        text="continue_with"
                        width="280"
                    />
                </div>

                <p className="login-note">
                    Authorized Access Only<br />
                    <span style={{ opacity: 0.7 }}>Use your university email (@std.uwu.ac.lk)</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
