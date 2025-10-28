import React, { useState } from 'react';
import { MdNotListedLocation } from "react-icons/md";
import { BiCurrentLocation } from "react-icons/bi";
import '../styles/AddLocation.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PunchAPI } from '../services/punchService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../components/ui/Modal/ConfirmModal';
import useLocationMap from '../hooks/useLocationMap';

// Import Leaflet marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AddLocation = ({ customer }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Use the unified location hook
  const {
    userLocation,
    locationError,
    isGettingLocation,
    mapRef,
    getLocation,
  } = useLocationMap();

  const navigate = useNavigate();

  const saveLocation = async () => {
    if (!userLocation) return toast.error("❌ Please fetch location first");
    
    setShowConfirm(false);
    try {
      await PunchAPI.AddShopLocation({
        firm_name: customer.firm_name || customer.customerName,
        latitude: parseFloat(userLocation.latitude),
        longitude: parseFloat(userLocation.longitude),
      });
      toast.success("✅ Location saved!");
      navigate('/punch-in/location');
    } catch (err) {
      toast.error(`❌ Save failed: ${err.message}`);
    }
  };

  return (
    <div className='add-location-container'>
      <h2 className='set-loc-text'>
        {!customer.latitude ? "Set Location for:" : "Location Details for:"}
        <span className="set-cus-name">
          {customer.firm_name || customer.customerName || "Unnamed Customer"}
        </span>
      </h2>

      <div className="location-status">
        {!customer.latitude ? (
          <div className="add-location">
            <div className="location-warning">
              <MdNotListedLocation className="icon" />
              <div className="message">
                <h5 className="title">Store location unavailable</h5>
                <p className="description">Move closer to the store to set its location accurately.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="location-available-">
            <div className="location-success">
              <BiCurrentLocation className="icon" />
              <div className="message">
                <h5 className="title">Location Available</h5>
                <p className="description">This store has a saved location. You can update if needed.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fetch-current">
        <div className="geo-loc-label">
          <BiCurrentLocation className="icon-geo" />
          <span>Fetch via Geolocation</span>
        </div>

        <div ref={mapRef} className='map' style={{ height: '300px', width: '100%' }} />

        <button
          className="fetch-current-btn"
          onClick={getLocation}
          disabled={isGettingLocation}
        >
          <BiCurrentLocation className='icon' />
          {isGettingLocation ? "Fetching..." : "Fetch Current Location"}
        </button>

        {locationError && (
          <div className="location-error" style={{ color: 'red', margin: '10px 0' }}>
            ❌ {locationError}
          </div>
        )}

        <div className="coordinates">
          <div className="coordinate">
            <label>Latitude:</label>
            <input
              type="text"
              value={userLocation ? userLocation.latitude.toFixed(6) : "00.000000"}
              readOnly
              style={{ backgroundColor: userLocation ? '#e8f5e8' : '#f5f5f5' }}
            />
          </div>
          <div className="coordinate">
            <label>Longitude:</label>
            <input
              type="text"
              value={userLocation ? userLocation.longitude.toFixed(6) : "00.000000"}
              readOnly
              style={{ backgroundColor: userLocation ? '#e8f5e8' : '#f5f5f5' }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn cancel" onClick={() => navigate("/punch-in")}>
            Back
          </button>
          <button
            className="btn save"
            onClick={() => setShowConfirm(true)}
            disabled={!userLocation}
          >
            Save
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Location Confirmation"
        message={userLocation ? `Set (${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}) as store location? Ensure you're at the store entrance.` : "No location available"}
        confirmText="Yes, Confirm"
        cancelText="Cancel"
        onCancel={() => setShowConfirm(false)}
        onConfirm={saveLocation}
      />
    </div>
  );
};

export default AddLocation;