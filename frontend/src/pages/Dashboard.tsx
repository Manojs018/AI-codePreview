import React from 'react';
import { useAppSelector } from '../hooks/redux';

const Dashboard: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);

    return (
        <div className="dashboard-page">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="display-4 font-weight-bold">
                        Welcome back, {user?.username}! 👋
                    </h1>
                    <p className="lead text-muted">
                        Here's an overview of your code quality metrics
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1">Total PRs Reviewed</p>
                                    <h3 className="font-weight-bold mb-0">45</h3>
                                </div>
                                <div className="icon-box bg-primary text-white rounded-circle"
                                    style={{ width: '50px', height: '50px', lineHeight: '50px', textAlign: 'center' }}>
                                    <i className="fas fa-code-branch"></i>
                                </div>
                            </div>
                            <small className="text-success">
                                <i className="fas fa-arrow-up mr-1"></i>
                                12% from last month
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1">Avg Quality Score</p>
                                    <h3 className="font-weight-bold mb-0">82.5</h3>
                                </div>
                                <div className="icon-box bg-success text-white rounded-circle"
                                    style={{ width: '50px', height: '50px', lineHeight: '50px', textAlign: 'center' }}>
                                    <i className="fas fa-chart-line"></i>
                                </div>
                            </div>
                            <small className="text-success">
                                <i className="fas fa-arrow-up mr-1"></i>
                                5.2% improvement
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1">Issues Found</p>
                                    <h3 className="font-weight-bold mb-0">180</h3>
                                </div>
                                <div className="icon-box bg-warning text-white rounded-circle"
                                    style={{ width: '50px', height: '50px', lineHeight: '50px', textAlign: 'center' }}>
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                            </div>
                            <small className="text-danger">
                                <i className="fas fa-arrow-down mr-1"></i>
                                8% from last month
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1">Critical Issues</p>
                                    <h3 className="font-weight-bold mb-0">2</h3>
                                </div>
                                <div className="icon-box bg-danger text-white rounded-circle"
                                    style={{ width: '50px', height: '50px', lineHeight: '50px', textAlign: 'center' }}>
                                    <i className="fas fa-bug"></i>
                                </div>
                            </div>
                            <small className="text-success">
                                <i className="fas fa-arrow-down mr-1"></i>
                                50% reduction
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reviews */}
            <div className="row">
                <div className="col-lg-8 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0">
                            <h5 className="font-weight-bold mb-0">Recent Reviews</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>PR</th>
                                            <th>Repository</th>
                                            <th>Quality Score</th>
                                            <th>Issues</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>#123</td>
                                            <td>my-repo</td>
                                            <td>
                                                <span className="badge badge-success">85</span>
                                            </td>
                                            <td>5</td>
                                            <td>
                                                <span className="badge badge-success">Completed</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>#122</td>
                                            <td>another-repo</td>
                                            <td>
                                                <span className="badge badge-warning">72</span>
                                            </td>
                                            <td>12</td>
                                            <td>
                                                <span className="badge badge-success">Completed</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>#121</td>
                                            <td>my-repo</td>
                                            <td>
                                                <span className="badge badge-success">90</span>
                                            </td>
                                            <td>2</td>
                                            <td>
                                                <span className="badge badge-success">Completed</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0">
                            <h5 className="font-weight-bold mb-0">Issue Distribution</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Bugs</span>
                                    <span className="font-weight-bold">45</span>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-danger" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Security</span>
                                    <span className="font-weight-bold">20</span>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-warning" style={{ width: '20%' }}></div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Performance</span>
                                    <span className="font-weight-bold">35</span>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-info" style={{ width: '35%' }}></div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Best Practices</span>
                                    <span className="font-weight-bold">80</span>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-primary" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
