import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { loginWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            await loginWithGoogle(credentialResponse);
            navigate('/dashboard');
        } catch (error) {
            alert('Login failed. Please ensure you are using a @std.uwu.ac.lk account.');
        }
    };

    const handleError = () => {
        alert('Google Login Failed');
    };

    return (
        <div className="flex items-center justify-center w-full h-screen relative overflow-hidden bg-black">

            {/* Ambient Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary opacity-10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="card relative z-10 p-10 w-full max-w-md border border-neutral-800 bg-[#0a0a0a]/90 backdrop-blur-xl shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mb-6 shadow-gl border border-white/5 text-3xl">
                        🏛️
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">HiMate Portal</h1>
                    <p className="text-muted text-sm mb-8">
                        The Official Residence Allocation System for <br />
                        <span className="text-white font-medium">Uva Wellassa University</span>
                    </p>

                    <div className="flex justify-center mb-8 transform hover:scale-105 transition-transform duration-300">
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

                    <div className="border-t border-white/5 pt-6">
                        <p className="text-xs text-muted">
                            Authorized Access Only.
                            <span className="block mt-1 opacity-50">Please use your university email (@std.uwu.ac.lk)</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
