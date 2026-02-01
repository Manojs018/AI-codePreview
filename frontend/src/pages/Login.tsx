import React from 'react';
import { useAppDispatch } from '../hooks/redux';
import { login, demoLogin } from '../store/slices/authSlice';

const Login: React.FC = () => {
    const dispatch = useAppDispatch();

    const handleGitHubLogin = () => {
        dispatch(login());
    };

    const handleDemoLogin = () => {
        dispatch(demoLogin());
    };

    return (
        <div className="login-page min-vh-100 d-flex align-items-center bg-gradient-primary">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-7">
                        <div className="card shadow-lg border-0">
                            <div className="card-body px-lg-5 py-lg-5">
                                <div className="text-center mb-4">
                                    <i className="fas fa-code-branch fa-4x text-primary mb-3"></i>
                                    <h2 className="font-weight-bold">AI Code Review</h2>
                                    <p className="text-muted">
                                        Sign in with GitHub to get started
                                    </p>
                                </div>

                                <button
                                    onClick={handleGitHubLogin}
                                    className="btn btn-dark btn-lg btn-block mb-3"
                                >
                                    <i className="fab fa-github mr-2"></i>
                                    Continue with GitHub
                                </button>

                                <button
                                    onClick={handleDemoLogin}
                                    className="btn btn-neutral btn-lg btn-block text-primary"
                                    style={{ backgroundColor: '#f8f9fe', border: '1px solid #e9ecef' }}
                                >
                                    <i className="fas fa-desktop mr-2"></i>
                                    Try Demo Mode
                                </button>

                                <div className="text-center mt-4">
                                    <small className="text-muted">
                                        By signing in, you agree to our Terms of Service and Privacy Policy
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-12 text-center">
                                <small className="text-white">
                                    <i className="fas fa-shield-alt mr-1"></i>
                                    Secure OAuth 2.0 authentication
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
