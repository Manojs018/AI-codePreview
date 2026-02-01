import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';

const MainLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="main-layout">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container">
                    <Link className="navbar-brand" to="/dashboard">
                        <i className="fas fa-code-branch mr-2"></i>
                        AI Code Review
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashboard">
                                    <i className="fas fa-chart-line mr-1"></i>
                                    Dashboard
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/repositories">
                                    <i className="fas fa-folder mr-1"></i>
                                    Repositories
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/reviews">
                                    <i className="fas fa-tasks mr-1"></i>
                                    Reviews
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/analytics">
                                    <i className="fas fa-chart-bar mr-1"></i>
                                    Analytics
                                </Link>
                            </li>
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    id="userDropdown"
                                    role="button"
                                    data-toggle="dropdown"
                                >
                                    <img
                                        src={user?.avatar_url || 'https://via.placeholder.com/32'}
                                        alt="User"
                                        className="rounded-circle"
                                        style={{ width: '32px', height: '32px' }}
                                    />
                                    <span className="ml-2">{user?.username}</span>
                                </a>
                                <div className="dropdown-menu dropdown-menu-right">
                                    <Link className="dropdown-item" to="/settings">
                                        <i className="fas fa-cog mr-2"></i>
                                        Settings
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={handleLogout}>
                                        <i className="fas fa-sign-out-alt mr-2"></i>
                                        Logout
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <div className="container-fluid py-4">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="footer bg-light py-3 mt-auto">
                <div className="container text-center">
                    <span className="text-muted">
                        © 2024 AI Code Review Platform. Built with ❤️ for developers.
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
