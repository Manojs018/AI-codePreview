import React from 'react';
import { useAppSelector } from '../hooks/redux';

const Settings: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);

    return (
        <div className="settings-page">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="display-4 font-weight-bold">Settings</h1>
                    <p className="lead text-muted">
                        Manage your account and preferences
                    </p>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0">
                            <h5 className="font-weight-bold mb-0">Profile Information</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-4">
                                <img
                                    src={user?.avatar_url || 'https://via.placeholder.com/80'}
                                    alt="Avatar"
                                    className="rounded-circle mr-3"
                                    style={{ width: '80px', height: '80px' }}
                                />
                                <div>
                                    <h4 className="mb-1">{user?.username}</h4>
                                    <p className="text-muted mb-0">{user?.email}</p>
                                </div>
                            </div>
                            <hr />
                            <div className="form-group">
                                <label>GitHub ID</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user?.github_id || ''}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user?.role || ''}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0">
                            <h5 className="font-weight-bold mb-0">Notification Preferences</h5>
                        </div>
                        <div className="card-body">
                            <div className="custom-control custom-switch mb-3">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="emailNotifications"
                                    defaultChecked
                                />
                                <label className="custom-control-label" htmlFor="emailNotifications">
                                    Email notifications for new reviews
                                </label>
                            </div>
                            <div className="custom-control custom-switch mb-3">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="slackNotifications"
                                />
                                <label className="custom-control-label" htmlFor="slackNotifications">
                                    Slack notifications
                                </label>
                            </div>
                            <div className="custom-control custom-switch">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="weeklyReports"
                                    defaultChecked
                                />
                                <label className="custom-control-label" htmlFor="weeklyReports">
                                    Weekly summary reports
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
