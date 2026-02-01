import React from 'react';
import { useParams } from 'react-router-dom';

const ReviewDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="review-detail-page">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="display-4 font-weight-bold">Review Details</h1>
                    <p className="lead text-muted">
                        Review ID: {id}
                    </p>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <p className="text-center text-muted py-5">
                                <i className="fas fa-file-code fa-3x mb-3 d-block"></i>
                                Review details will be displayed here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetail;
