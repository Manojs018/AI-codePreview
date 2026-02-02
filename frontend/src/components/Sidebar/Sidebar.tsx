import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const location = useLocation();

    // Helper to check if link is active
    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <div className="sidebar-wrapper">
            <div className="sidebar-brand">
                <i className="fab fa-react" style={{ fontSize: '24px', color: '#61dafb' }}></i>
                <h3>Flux AI</h3>
            </div>

            <ul className="sidebar-nav">
                <li className={isActive('/dashboard')}>
                    <NavLink to="/dashboard">
                        <i className="fas fa-chart-pie"></i>
                        <p>Dashboard</p>
                    </NavLink>
                </li>
                <li className={isActive('/repositories')}>
                    <NavLink to="/repositories">
                        <i className="fas fa-code-branch"></i>
                        <p>Repositories</p>
                    </NavLink>
                </li>
                <li className={isActive('/reviews')}>
                    <NavLink to="/reviews">
                        <i className="fas fa-tasks"></i>
                        <p>Reviews</p>
                    </NavLink>
                </li>
                <li className={isActive('/analytics')}>
                    <NavLink to="/analytics">
                        <i className="fas fa-chart-bar"></i>
                        <p>Analytics</p>
                    </NavLink>
                </li>

                {/* Separator for User Section */}
                <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '20px 10px 10px 10px' }}></li>

                <li className={isActive('/settings')}>
                    <NavLink to="/settings">
                        <i className="fas fa-cog"></i>
                        <p>Settings</p>
                    </NavLink>
                </li>
                <li className={isActive('/profile')}>
                    <NavLink to="/profile">
                        <i className="fas fa-user"></i>
                        <p>User Profile</p>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
