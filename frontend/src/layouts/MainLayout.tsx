import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar'; // Import the new Sidebar
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const MainLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    // Extract page title from path
    const getPageTitle = () => {
        const path = location.pathname.replace('/', '');
        return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard';
    };

    return (
        <div className="wrapper">
            <Sidebar />

            <div className="main-panel">
                {/* Transparent Top Navbar */}
                <nav className="navbar navbar-expand-lg navbar-top">
                    <div className="container-fluid">
                        <div className="navbar-wrapper">
                            <div className="navbar-toggle d-inline">
                                <button type="button" className="navbar-toggler">
                                    <span className="navbar-toggler-bar bar1"></span>
                                    <span className="navbar-toggler-bar bar2"></span>
                                    <span className="navbar-toggler-bar bar3"></span>
                                </button>
                            </div>
                            <h1 className="navbar-brand" style={{ fontSize: '1.5rem', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '2px', color: 'white' }}>
                                {getPageTitle()}
                            </h1>
                        </div>

                        <div className="collapse navbar-collapse justify-content-end" id="navigation">
                            {/* Search Bar - Visual Only for now */}
                            <div className="mr-4 d-none d-lg-block">
                                <div className="input-group" style={{ background: 'transparent' }}>
                                    <div className="input-group-prepend">
                                        <span className="input-group-text" style={{ background: 'transparent', border: 'none' }}>
                                            <i className="fas fa-search" style={{ color: 'var(--text-muted)' }}></i>
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search..."
                                        style={{ background: 'var(--bg-body)', border: 'none', borderRadius: '30px', color: 'white', paddingLeft: '10px' }}
                                    />
                                </div>
                            </div>

                            <ul className="navbar-nav ml-auto align-items-center">
                                <li className="nav-item">
                                    <a className="nav-link" href="#">
                                        <i className="fas fa-bell" style={{ fontSize: '1.2rem' }}></i>
                                        <span className="d-lg-none d-block">Notifications</span>
                                    </a>
                                </li>
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link"
                                        href="#"
                                        id="navbarDropdownProfile"
                                        data-toggle="dropdown"
                                        aria-haspopup="true"
                                        aria-expanded="false"
                                    >
                                        <img
                                            src={user?.avatar_url || 'https://via.placeholder.com/150'}
                                            alt="avatar"
                                            className="avatar"
                                            style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--primary)' }}
                                        />
                                        <p className="d-lg-none d-block">Account</p>
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdownProfile" style={{ background: 'var(--bg-card)', border: 'none', boxShadow: '0 10px 50px rgba(0,0,0,0.5)' }}>
                                        <Link className="dropdown-item" to="/profile" style={{ color: 'white' }}>Profile</Link>
                                        <Link className="dropdown-item" to="/settings" style={{ color: 'white' }}>Settings</Link>
                                        <div className="dropdown-divider" style={{ borderColor: 'rgba(255,255,255,0.1)' }}></div>
                                        <button className="dropdown-item" onClick={handleLogout} style={{ color: '#fd5d93' }}>Log out</button>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="content" style={{ marginTop: '30px' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
