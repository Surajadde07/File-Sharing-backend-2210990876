import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

//! SURAJ & TEAM DID THIS CHANGE - Google Auth Callback Handler
const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return; // Prevent multiple executions
        processedRef.current = true;
        
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            toast.error('Google authentication failed. Please try again.');
            navigate('/login');
            return;
        }

        if (token && userParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                login(token, userData);
                toast.success(`Welcome back, ${userData.username}!`);
                navigate('/dashboard');
            } catch (err) {
                console.error('Error parsing user data:', err);
                toast.error('Authentication failed. Please try again.');
                navigate('/login');
            }
        } else {
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
        }
    }, []); // Empty dependency array since we handle everything inside

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <h2 className="mt-4 text-xl font-semibold text-gray-700">
                    Completing Google Sign-in...
                </h2>
                <p className="mt-2 text-gray-500">
                    Please wait while we sign you in.
                </p>
            </div>
        </div>
    );
};

export default AuthCallback;