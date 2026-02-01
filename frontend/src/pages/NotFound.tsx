import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="not-found-page min-vh-100 d-flex align-items-center justify-content-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 text-center">
                        <h1 className="display-1 font-weight-bold text-primary">404</h1>
                        <h2 className="mb-4">Page Not Found</h2>
                        <p className="lead text-muted mb-4">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                        <Link to="/dashboard" className="btn btn-primary btn-lg">
                            <i className="fas fa-home mr-2"></i>
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
