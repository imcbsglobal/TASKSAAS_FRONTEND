import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { MdOutlineCameraAlt } from 'react-icons/md';
import { RiDeleteBinLine } from 'react-icons/ri';
import { LuSquarePen } from 'react-icons/lu';

// Photo Capture Step Component
const PhotoCaptureStep = ({ 
  capturedImage,
  setCapturedImage,
  showCamera,
  setShowCamera,
  facingMode,
  setFacingMode,
  videoRef,
  capturePhoto,
  onNext,
  onPrev
}) => {
  const handleDiscardImage = useCallback(() => {
    if (capturedImage?.url) URL.revokeObjectURL(capturedImage.url);
    setCapturedImage(null);
  }, [capturedImage, setCapturedImage]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="wizard_step photo_capture_step"
    >
      <h2>Take Photo</h2>
      
      {!capturedImage ? (
        <div className="photo_section">
          <div className="photo_label">Image :</div>
          <div className="take_button" onClick={() => setShowCamera(true)}>
            <MdOutlineCameraAlt className="icon" /> Take a Photo
          </div>
        </div>
      ) : (
        <div className="preview_section">
          <div className="photo_container">
            <img src={capturedImage.url} alt="Captured" />
          </div>

          <div className="photo_actions">
            <button className="discard" onClick={handleDiscardImage}>
              <RiDeleteBinLine className="icon" /> Discard
            </button>
            <button className="retake" onClick={() => setShowCamera(true)}>
              <LuSquarePen className="icon" /> Retake
            </button>
          </div>
        </div>
      )}

      <div className="wizard_actions">
        <button className="wizard_btn secondary" onClick={onPrev}>
          <IoChevronBack /> Previous
        </button>
        {capturedImage && (
          <button className="wizard_btn primary" onClick={onNext}>
            Next <IoChevronForward />
          </button>
        )}
      </div>
    </motion.div>
  );
};

PhotoCaptureStep.propTypes = {
  capturedImage: PropTypes.object,
  setCapturedImage: PropTypes.func.isRequired,
  showCamera: PropTypes.bool.isRequired,
  setShowCamera: PropTypes.func.isRequired,
  facingMode: PropTypes.string.isRequired,
  setFacingMode: PropTypes.func.isRequired,
  videoRef: PropTypes.object.isRequired,
  capturePhoto: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired
};

export default PhotoCaptureStep;
