import React from 'react';

const Reviews: React.FC = () => {
    return (
        <div className="reviews-page">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="display-4 font-weight-bold">Code Reviews</h1>
                    <p className="lead text-muted">
                        View all AI-powered code reviews for your pull requests
                    </p>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <p className="text-center text-muted py-5">
                                <i className="fas fa-tasks fa-3x mb-3 d-block"></i>
                                No reviews yet. Create a pull request to get started.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reviews;
