import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { IoChevronBack, IoChevronForward, IoRefreshCircle, IoLocation, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { MdOutlineNotListedLocation, MdOutlineSocialDistance, MdNotListedLocation } from 'react-icons/md';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

//Punch In  Location Capture Step Component
const LocationCaptureStep = ({
  selectedCustomer,
  capturedLocation,
  distance,
  mapRef,
  getLocation,
  initializeMap,
  isGettingLocation,
  locationError,
  onNext,
  onPrev
}) => {
  // Auto-fetch location when component mounts
  useEffect(() => {
    if (!capturedLocation && !isGettingLocation && !locationError) {
      getLocation();
    }
  }, [capturedLocation, isGettingLocation, locationError, getLocation]);

  // Initialize map when component mounts
  useEffect(() => {
    if (selectedCustomer?.latitude && initializeMap) {
      initializeMap();
    }
  }, [selectedCustomer?.latitude, initializeMap]);

  const getLocationStatusText = () => {
    if (isGettingLocation) return "Fetching...";
    if (locationError) return "Location Failed";
    if (capturedLocation) return "Your Location";
    return "Get Location";
  };

  const getLocationIcon = () => {
    if (locationError) return <MdNotListedLocation className="icon error" />;
    return <MdOutlineNotListedLocation className="icon" />;
  };

  // Distance validation helper
  const getDistanceStatus = () => {
    if (!selectedCustomer?.latitude) {
      return {
        isValid: true, // Allow punch-in if no customer location is set
        distance: 'No location data',
        message: 'Customer location not configured - punch-in allowed'
      };
    }
    
    if (!distance || !capturedLocation) return null;
    
    const isWithinRadius = distance?.isWithinRadius;
    const formattedDistance = distance?.formattedDistance;
    
    return {
      isValid: isWithinRadius,
      distance: formattedDistance,
      message: isWithinRadius 
        ? `✓ Within range (${formattedDistance})` 
        : `⚠ Outside range (${formattedDistance}) - Must be within 100m`
    };
  };

  const distanceStatus = getDistanceStatus();

  useEffect(() => {
    const ts = new Date().toISOString();

    const summarizeRef = (ref) => {
      if (!ref || typeof ref !== 'object' || !('current' in ref)) return ref;
      const node = ref.current;
      if (!node) return { current: null };
      if (node instanceof HTMLElement) {
        const cls = node.className ? `.${String(node.className).trim().replace(/\s+/g, '.')}` : '';
        const id = node.id ? `#${node.id}` : '';
        return { current: `<${node.nodeName.toLowerCase()}${id}${cls}>` };
      }
      return { current: node };
    };

    const fmt = (v) => {
      if (typeof v === 'function') return `[fn] ${v.name || 'anonymous'}`;
      if (v && typeof v === 'object' && 'current' in v) return summarizeRef(v);
      return v;
    };

    console.groupCollapsed(
      `%c[LocationCaptureStep]%c props @ ${ts}`,
      'color:#6c5ce7;font-weight:bold;',
      'color:#0984e3;'
    );
    console.log('%cselectedCustomer:', 'color:#636e72;', fmt(selectedCustomer));
    console.log('%ccapturedLocation:', 'color:#636e72;', fmt(capturedLocation));
    console.log('%cdistance:', 'color:#636e72;', fmt(distance));
    console.log('%cmapRef:', 'color:#636e72;', fmt(mapRef));
    console.log('%cgetLocation:', 'color:#636e72;', fmt(getLocation));
    console.log('%cisGettingLocation:', 'color:#636e72;', fmt(isGettingLocation));
    console.log('%clocationError:', 'color:#636e72;', fmt(locationError));
    console.log('%conNext:', 'color:#636e72;', fmt(onNext));
    console.log('%conPrev:', 'color:#636e72;', fmt(onPrev));

    if (selectedCustomer && typeof selectedCustomer === 'object') {
      try {
        console.groupCollapsed('%cselectedCustomer details', 'color:#00b894;');
        console.table(selectedCustomer);
        console.groupEnd();
      } catch {}
    }

    if (capturedLocation && typeof capturedLocation === 'object') {
      try {
        console.groupCollapsed('%ccapturedLocation details', 'color:#00b894;');
        console.table(capturedLocation);
        console.groupEnd();
      } catch {}
    }

    console.groupEnd();
  }, [
    selectedCustomer,
    capturedLocation,
    distance,
    mapRef,
    getLocation,
    isGettingLocation,
    locationError,
    onNext,
    onPrev
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="wizard_step location_capture_step"
    >
      <h2>Capture Location</h2>

      <div className="capture_location">
        <div className="location_container">
          <div className="location_header">
            <div className={`your_location ${isGettingLocation ? 'loading' : ''} ${locationError ? 'error' : ''}`}>
              {getLocationIcon()} {getLocationStatusText()}
            </div>
            <button
              className={`fetch_btn ${isGettingLocation ? 'loading' : ''}`}
              onClick={getLocation}
              disabled={isGettingLocation}
              title={isGettingLocation ? "Getting location..." : "Refresh location"}
            >
              <IoRefreshCircle className={isGettingLocation ? 'rotating' : ''} />
            </button>
          </div>

          {/* Distance Status Display */}
          {capturedLocation && distanceStatus && (
            <div className={`distance_status ${distanceStatus.isValid ? 'valid' : 'invalid'}`}>
              <div className="distance_info">
                <MdOutlineSocialDistance className="distance_icon" />
                <div className="distance_text">
                  <span className="distance_label">
                    Distance to {selectedCustomer?.firm_name || 'Customer'}:
                  </span>
                  <span className={`distance_value ${distanceStatus.isValid ? 'valid' : 'invalid'}`}>
                    {distanceStatus.distance}
                  </span>
                </div>
                <div className={`status_indicator ${distanceStatus.isValid ? 'valid' : 'invalid'}`}>
                  {distanceStatus.isValid ? (
                    <IoCheckmarkCircle className="status_icon valid" />
                  ) : (
                    <IoCloseCircle className="status_icon invalid" />
                  )}
                </div>
              </div>
              <div className={`status_message ${distanceStatus.isValid ? 'valid' : 'invalid'}`}>
                {distanceStatus.message}
              </div>
              {!distanceStatus.isValid && selectedCustomer?.latitude && (
                <div className="radius_help">
                  <small>📍 Move closer to the customer location to enable punch-in</small>
                </div>
              )}
            </div>
          )}

          <div className="location_map_wrapper">
            {/* Show placeholder only when no location AND not loading AND has error */}
            {!capturedLocation && !isGettingLocation && locationError && (
              <div className="location_placeholder">
                <div className="placeholder_content">
                  <IoLocation className="placeholder_icon" />
                  <p className="placeholder_text">Unable to get your location</p>
                  <button className="retry_btn" onClick={getLocation}>
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Map container - always present but conditionally visible */}
            <div
              className={`location_map ${!capturedLocation && !isGettingLocation ? 'hidden' : ''}`}
              ref={mapRef}
            />

            {/* Loading overlay - only when getting location */}
            {isGettingLocation && (
              <div className="location_loading_overlay">
                <LoadingSpinner size="medium" />
                <p>Getting your current location...</p>
              </div>
            )}
          </div>

          <div className="km_container">
            <div className="mdOutline">
              <MdOutlineSocialDistance className="icon" /> Distance from shop
            </div>
            <div className="km_span">
              {distance?.formattedDistance || (isGettingLocation ? "Calculating..." : "N/A")}
            </div>
          </div>

          {locationError && !isGettingLocation && (
            <div className="error_message">
              <p>⚠️ {locationError}</p>
              <p className="error_help">Please check your location permissions and try again.</p>
            </div>
          )}
        </div>
      </div>

      <div className="wizard_actions">
        <button className="wizard_btn secondary" onClick={onPrev}>
          <IoChevronBack /> Previous
        </button>
        {capturedLocation && distanceStatus?.isValid && (
          <button className="wizard_btn primary" onClick={onNext}>
            Next <IoChevronForward />
          </button>
        )}
        {capturedLocation && !distanceStatus?.isValid && selectedCustomer?.latitude && (
          <button className="wizard_btn primary disabled" disabled title="You must be within 100m to continue">
            Next <IoChevronForward />
          </button>
        )}
        {capturedLocation && !selectedCustomer?.latitude && (
          <button className="wizard_btn primary" onClick={onNext}>
            Next <IoChevronForward />
          </button>
        )}
      </div>
    </motion.div>
  );
};

LocationCaptureStep.propTypes = {
  selectedCustomer: PropTypes.object,
  capturedLocation: PropTypes.object,
  distance: PropTypes.string,
  mapRef: PropTypes.object.isRequired,
  getLocation: PropTypes.func.isRequired,
  initializeMap: PropTypes.func.isRequired,
  isGettingLocation: PropTypes.bool.isRequired,
  locationError: PropTypes.string,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired
};

export default LocationCaptureStep;
