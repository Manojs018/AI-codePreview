import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { handleAuthCallback } from '../store/slices/authSlice';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');

        if (token && refreshToken) {
            dispatch(handleAuthCallback({ token, refreshToken }))
                .unwrap()
                .then(() => {
                    navigate('/dashboard');
                })
                .catch((error) => {
                    console.error('Auth callback error:', error);
                    navigate('/login');
                });
        } else {
            navigate('/login');
        }
    }, [searchParams, dispatch, navigate]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Completing authentication...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
