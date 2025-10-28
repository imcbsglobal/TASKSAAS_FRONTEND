import React from 'react';
import './LoadingSpinner.scss';

/**
 * Simple loading spinner component with SCSS-based animations
 */
const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  return (
    <div className={`loading-spinner ${className}`} role="status" aria-label="Loading">
      <div className={`spinner spinner--${size}`} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
