import React from 'react';

const Repositories: React.FC = () => {
    return (
        <div className="repositories-page">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="display-4 font-weight-bold">Repositories</h1>
                    <p className="lead text-muted">
                        Manage your GitHub repositories and code review settings
                    </p>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <p className="text-center text-muted py-5">
                                <i className="fas fa-folder-open fa-3x mb-3 d-block"></i>
                                No repositories configured yet. Connect your GitHub repositories to get started.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Repositories;
