import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section bg-gradient-primary text-white py-5">
                <div className="container">
                    <div className="row align-items-center min-vh-100">
                        <div className="col-lg-6">
                            <h1 className="display-3 font-weight-bold mb-4">
                                AI-Powered Code Review
                            </h1>
                            <p className="lead mb-4">
                                Automatically analyze pull requests, detect bugs, security vulnerabilities,
                                and code smells with the power of AI. Improve code quality and developer productivity.
                            </p>
                            <div className="d-flex gap-3">
                                <Link to="/login" className="btn btn-lg btn-white">
                                    <i className="fab fa-github mr-2"></i>
                                    Get Started with GitHub
                                </Link>
                                <a href="#features" className="btn btn-lg btn-outline-white">
                                    Learn More
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="hero-image">
                                <i className="fas fa-code fa-10x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-4 font-weight-bold">Why Choose AI Code Review?</h2>
                        <p className="lead text-muted">
                            Production-grade code analysis powered by GPT-4
                        </p>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-lg border-0 h-100">
                                <div className="card-body text-center">
                                    <div className="icon-box bg-primary text-white rounded-circle mx-auto mb-3"
                                        style={{ width: '80px', height: '80px', lineHeight: '80px' }}>
                                        <i className="fas fa-bug fa-2x"></i>
                                    </div>
                                    <h4 className="font-weight-bold">Bug Detection</h4>
                                    <p className="text-muted">
                                        Automatically detect logic errors, null pointer exceptions,
                                        and race conditions before they reach production.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card shadow-lg border-0 h-100">
                                <div className="card-body text-center">
                                    <div className="icon-box bg-danger text-white rounded-circle mx-auto mb-3"
                                        style={{ width: '80px', height: '80px', lineHeight: '80px' }}>
                                        <i className="fas fa-shield-alt fa-2x"></i>
                                    </div>
                                    <h4 className="font-weight-bold">Security Analysis</h4>
                                    <p className="text-muted">
                                        Identify SQL injection, XSS vulnerabilities, hardcoded secrets,
                                        and insecure dependencies.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card shadow-lg border-0 h-100">
                                <div className="card-body text-center">
                                    <div className="icon-box bg-success text-white rounded-circle mx-auto mb-3"
                                        style={{ width: '80px', height: '80px', lineHeight: '80px' }}>
                                        <i className="fas fa-tachometer-alt fa-2x"></i>
                                    </div>
                                    <h4 className="font-weight-bold">Performance Optimization</h4>
                                    <p className="text-muted">
                                        Detect O(n²) algorithms, memory leaks, and unnecessary
                                        computations that slow down your application.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card shadow-lg border-0 h-100">
                                <div className="card-body text-center">
                                    <div className="icon-box bg-info text-white rounded-circle mx-auto mb-3"
                                        style={{ width: '80px', height: '80px', lineHeight: '80px' }}>
                                        <i className="fas fa-chart-line fa-2x"></i>
                                    </div>
                                    <h4 className="font-weight-bold">Analytics Dashboard</h4>
                                    <p className="text-muted">
                                        Track code quality trends, developer productivity,
                                        and team metrics over time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card shadow-lg border-0 h-100">
                                <div className="card-body text-center">
                                    <div className="icon-box bg-warning text-white rounded-circle mx-auto mb-3"
                                        style={{ width: '80px', height: '80px', lineHeight: '80px' }}>
                                        <i className="fas fa-robot fa-2x"></i>
                                    </div>
                                    <h4 className="font-weight-bold">AI-Powered</h4>
                                    <p className="text-muted">
                                        Leverages GPT-4 with context-aware prompts for accurate
                                        and actionable code reviews.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card shadow-lg border-0 h-100">
                                <div className="card-body text-center">
                                    <div className="icon-box bg-secondary text-white rounded-circle mx-auto mb-3"
                                        style={{ width: '80px', height: '80px', lineHeight: '80px' }}>
                                        <i className="fab fa-github fa-2x"></i>
                                    </div>
                                    <h4 className="font-weight-bold">GitHub Integration</h4>
                                    <p className="text-muted">
                                        Seamlessly integrates with GitHub via webhooks.
                                        Reviews happen automatically on every PR.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section bg-gradient-primary text-white py-5">
                <div className="container text-center">
                    <h2 className="display-4 font-weight-bold mb-4">
                        Ready to Improve Your Code Quality?
                    </h2>
                    <p className="lead mb-4">
                        Join thousands of developers using AI to write better code.
                    </p>
                    <Link to="/login" className="btn btn-lg btn-white">
                        <i className="fab fa-github mr-2"></i>
                        Start Free with GitHub
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Landing;
