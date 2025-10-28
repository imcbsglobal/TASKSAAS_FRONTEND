import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { IoChevronBack, IoCheckmarkCircle, IoCloseCircle, IoCamera, IoBusiness, IoLocation } from 'react-icons/io5';
import { FaRegClock } from 'react-icons/fa';
import './ConfirmationStep.scss';

const ConfirmationStep = ({ 
  selectedCustomer,
  capturedImage,
  capturedLocation,
  distance,
  onPunchIn,
  onPrev,
  isLoading
}) => {
  
  const isWithinRadius = distance?.isWithinRadius || false;
  const hasCustomerLocation = selectedCustomer?.latitude;
  const canPunchIn = !hasCustomerLocation || isWithinRadius;

  const getStatusConfig = () => {
    if (!hasCustomerLocation) {
      return { 
        icon: IoCheckmarkCircle, 
        text: 'Location Not Required', 
        status: 'success',
        description: 'No location restriction for this customer'
      };
    }
    if (isWithinRadius) {
      return { 
        icon: IoCheckmarkCircle, 
        text: 'Within Range', 
        status: 'success',
        description: 'You are within the allowed distance'
      };
    }
    return { 
      icon: IoCloseCircle, 
      text: 'Out of Range', 
      status: 'error',
      description: 'You must be within 100 meters to punch in'
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const customerName = selectedCustomer?.firm_name || selectedCustomer?.customerName || selectedCustomer?.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="confirmation-step"
    >
      {/* Header with Customer Name */}
      <div className="confirmation-header">
        <div className="header-content">
          <div className="customer-info">
            <div className="customer-details">
              <span className="customer-label">Customer</span>
              <h2 className="customer-name">{customerName}</h2>
              {selectedCustomer?.address && (
                <p className="customer-address">{selectedCustomer.address}</p>
              )}
            </div>
          </div>
        </div>
        <div className="header-decoration">
          <FaRegClock className="header-icon" />
        </div>
      </div>

      {/* Summary Cards Grid - Removed Customer Card */}
      <div className="summary-grid">
        {/* Photo Card */}
        <div className="summary-card photo-card">
          <div className="card-header">
            <IoCamera className="card-icon" />
            <h3 className="card-title">Attendance Photo</h3>
          </div>
          <div className="card-content">
            <div className="photo-container">
              <img 
                src={capturedImage?.url} 
                alt="photo" 
                className="attendance-photo"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGMEYxIi8+CjxwYXRoIGQ9Ik0xMjUgODVIMTUuNUwxMjUgODVaIiBmaWxsPSIjQ0VDRUNGIi8+CjxjaXJjbGUgY3g9IjcwIiBjeT0iNzAiIHI9IjMwIiBmaWxsPSIjQ0VDRUNGIi8+Cjwvc3ZnPgo=';
                }}
              />
              {/* <div className="photo-overlay">
                <IoCamera className="overlay-icon" />
              </div> */}
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="summary-card location-card">
          <div className="card-header">
            <IoLocation className="card-icon" />
            <h3 className="card-title">Location Status</h3>
          </div>
          <div className="card-content">
            <div className={`status-indicator status-${statusConfig.status}`}>
              <StatusIcon className="status-icon" />
              <div className="status-content">
                <span className="status-text">{statusConfig.text}</span>
                <span className="status-description">{statusConfig.description}</span>
              </div>
            </div>
            
            {distance?.formattedDistance && (
              <div className="distance-info">
                <div className="distance-value">
                  <span className="distance-number">{distance.formattedDistance}</span>
                  <span className="distance-label">from target location</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-secondary"
          onClick={onPrev}
          disabled={isLoading}
        >
          <IoChevronBack className="btn-icon" />
          Back
        </motion.button>
        
        <motion.button
          whileHover={canPunchIn && !isLoading ? { scale: 1.02 } : {}}
          whileTap={canPunchIn && !isLoading ? { scale: 0.98 } : {}}
          className={`btn btn-primary ${!canPunchIn ? 'btn-disabled' : ''} ${isLoading ? 'btn-loading' : ''}`}
          onClick={onPunchIn}
          disabled={isLoading || !canPunchIn}
        >
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              Processing...
            </div>
          ) : (
            <>
              <FaRegClock className="btn-icon" />
              Confirm Punch In
            </>
          )}
        </motion.button>
      </div>

      {/* Status Message */}
      {!canPunchIn && (
        <div className="error-message">
          <IoCloseCircle className="error-icon" />
          <span>You must be within the required distance to punch in</span>
        </div>
      )}
    </motion.div>
  );
};

ConfirmationStep.propTypes = {
  selectedCustomer: PropTypes.object,
  capturedImage: PropTypes.object,
  capturedLocation: PropTypes.object,
  distance: PropTypes.object,
  onPunchIn: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default ConfirmationStep;