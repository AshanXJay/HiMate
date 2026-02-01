import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { googleLogout } from '@react-oauth/google';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Logout function defined with useCallback to use in the interceptor
    const logout = useCallback(() => {
        googleLogout();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) setUser(storedUser);
        }
        setLoading(false);
    }, []);

    // Setup axios interceptor to handle 401 errors globally
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.log('Session expired or invalid token - logging out');
                    logout();
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [logout]);

    const loginWithGoogle = async (credentialResponse) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/google/`, {
                token: credentialResponse.credential
            });

            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return res.data.user;
        } catch (error) {
            console.error("Google Login Failed", error);
            throw error;
        }
    };

    const refreshUserData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/api/me/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = {
                ...res.data,
                full_name: res.data.profile?.full_name || res.data.first_name || res.data.username,
                enrollment_number: res.data.profile?.enrollment_number
            };

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Failed to refresh user data", error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    };



    const getAuthHeader = () => {
        const token = localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    return (
        <AuthContext.Provider value={{
            user,
            loginWithGoogle,
            logout,
            loading,
            refreshUserData,
            getAuthHeader,
            API_URL
        }}>
            {children}
        </AuthContext.Provider>
    );
};
