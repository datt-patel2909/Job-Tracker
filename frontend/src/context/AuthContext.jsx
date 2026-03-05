import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user: userData, token } = response.data;

            setUser(userData);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.msg || 'Invalid credentials'
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            await api.post('/auth/register', { name, email, password });
            // Don't auto-login — user should be redirected to login page
            return { success: true };
        } catch (error) {
            let errorMsg = error.response?.data?.msg || 'Registration failed';

            // Map the raw Mongo duplicate value error to a more user-friendly message
            if (errorMsg.includes('Duplicate value entered')) {
                errorMsg = 'User already exists';
            }

            return {
                success: false,
                error: errorMsg
            };
        }
    };

    const googleLogin = async (googleToken) => {
        try {
            const response = await api.post('/auth/google', { token: googleToken });
            const { user: userData, token } = response.data;

            setUser(userData);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.msg || 'Google Sign-In failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        loading,
        login,
        register,
        googleLogin,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
