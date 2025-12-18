import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { googleLogout } from '@react-oauth/google';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const loginWithGoogle = async (credentialResponse) => {
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/auth/google/', {
                token: credentialResponse.credential
            });

            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return true;
        } catch (error) {
            console.error("Google Login Failed", error);
            throw error;
        }
    };

    const logout = () => {
        googleLogout();
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
