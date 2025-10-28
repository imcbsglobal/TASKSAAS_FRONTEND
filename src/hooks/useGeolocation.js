import { useState } from 'react';

// Default geolocation options
const GEO_DEFAULTS = { 
  enableHighAccuracy: true, 
  timeout: 15000, 
  maximumAge: 0 
};

// Custom hook for geolocation
export const useGeolocation = (options = GEO_DEFAULTS) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          setError(null);
          setLoading(false);
          resolve(position);
        },
        (error) => {
          setError(error);
          setLoading(false);
          reject(error);
        },
        options
      );
    });
  };

  const toFixed6 = ({ latitude, longitude }) => {
    return {
      latitude: Number(latitude).toFixed(6),
      longitude: Number(longitude).toFixed(6),
    };
  };

  return {
    location,
    error,
    loading,
    getCurrentPosition,
    toFixed6,
  };
};

// Utility functions for backward compatibility
export function getCurrentPosition(options = GEO_DEFAULTS) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export function toFixed6({ latitude, longitude }) {
  return {
    latitude: Number(latitude).toFixed(6),
    longitude: Number(longitude).toFixed(6),
  };
}
