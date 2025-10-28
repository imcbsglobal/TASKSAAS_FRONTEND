import React from 'react';
import PropTypes from 'prop-types';
import { IoCloseCircle, IoCameraReverse } from "react-icons/io5";
import { LuCamera } from "react-icons/lu";
import "../styles/CamModal.scss";

/**
 * Camera Modal Component - Original Design
 * Provides camera interface with the exact layout from PunchInold.jsx
 */
const CamModal = ({ 
  showCamera, 
  setShowCamera, 
  facingMode, 
  setFacingMode, 
  videoRef, 
  capturePhoto 
}) => {
  if (!showCamera) return null;

  const handleCameraSwitch = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="camera_modal">
      <div className="camera_container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera_video"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />
        <div className="camera_header">
          <button onClick={() => setShowCamera(false)} className="camera_btn close_btn">
            <IoCloseCircle />
          </button>
          <button
            onClick={handleCameraSwitch}
            className="camera_btn"
          >
            <IoCameraReverse />
          </button>
        </div>
        <div className="capture_overlay">
          <button className="capture_btn" onClick={capturePhoto}>
            <LuCamera />
          </button>
        </div>
      </div>
    </div>
  );
};

// PropTypes for type checking
CamModal.propTypes = {
  showCamera: PropTypes.bool.isRequired,
  setShowCamera: PropTypes.func.isRequired,
  facingMode: PropTypes.oneOf(['user', 'environment']).isRequired,
  setFacingMode: PropTypes.func.isRequired,
  videoRef: PropTypes.object.isRequired,
  capturePhoto: PropTypes.func.isRequired,
};

CamModal.displayName = 'CamModal';

export default CamModal;
