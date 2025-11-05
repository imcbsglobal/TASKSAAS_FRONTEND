import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import taskLogo from '../../assets/TASK11.png';
import './NotFound.scss';

export default function NotFound() {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); // Go back one step in history
    };

    return (
        <div className="not-found-container">
            <div className="not-found-background">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
            </div>

            <div className="not-found-content">
                <div className="not-found-card">
                    {/* Logo */}
                    <div className="logo-container">
                        <img src={taskLogo} alt="Task SaaS Logo" className="task-logo" />
                    </div>

                    {/* 404 Animation */}
                    <div className="error-code">
                        <span className="digit">4</span>
                        <span className="digit zero">0</span>
                        <span className="digit">4</span>
                    </div>

                    {/* Brand */}
                    <div className="brand-name">Task SaaS</div>

                    {/* Error Message */}
                    <h1 className="error-title">Page Not Found</h1>
                    <p className="error-description">
                        Oops! The page you're looking for doesn't exist. 
                        It might have been moved or deleted.
                    </p>

                    {/* Back Button */}
                    <button 
                        onClick={handleBack} 
                        className="back-button"
                        aria-label="Go back to previous page"
                    >
                        <ArrowLeft size={20} />
                        <span>Go Back</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="not-found-footer">
                    <p>© 2025 Task SaaS. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}