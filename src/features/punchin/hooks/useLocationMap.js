import { useState, useRef, useCallback, useEffect } from 'react';
import { getCurrentPosition } from '../../../hooks';
import { distanceKm } from '../../../utils/geoDis';
import { addAccuracyCircle, initHybridMap, setViewAndMarker, clearMapOverlays } from '../../../utils/mapHelpers';
import { logger } from '../../../utils/logger';

// Simple location map hook - only shows user location
const useLocationMap = (targetLocation = null) => {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Get user's current location
  const getLocation = useCallback(async () => {
    if (isGettingLocation) return;

    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const pos = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000
      });

      const newLoc = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: Date.now()
      };

      setUserLocation(newLoc);

      // Update map if it exists - show user location only
      if (mapRef.current?._map) {
        setViewAndMarker(mapRef.current._map, markerRef, newLoc.latitude, newLoc.longitude, 19);
        addAccuracyCircle(mapRef.current._map, newLoc.latitude, newLoc.longitude, 50);
      }
      
      logger.info('Location captured successfully', { location: newLoc });
    } catch (err) {
      const errorMessage = err.message || 'Failed to get current location';
      setLocationError(errorMessage);
      logger.error('Error fetching location:', err);
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  // Initialize map - simple default view
  const initializeMap = useCallback(() => {
    if (mapRef.current && !mapRef.current._map) {
      try {
        // Always start with default location (no customer markers)
        const map = initHybridMap(mapRef.current, {
          center: [10.7669, 75.9258], // Ponnani coordinates
          zoom: 4,
        });

        mapRef.current._map = map;
        logger.info('Map initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize map:', error);
        setLocationError('Failed to initialize map');
      }
    }
  }, []);

  // Calculate distance and check if within allowed radius (100 meters)
  useEffect(() => {
    if (targetLocation?.latitude && userLocation?.latitude) {
      try {
        // Validate coordinates
        const targetLat = parseFloat(targetLocation.latitude);
        const targetLng = parseFloat(targetLocation.longitude);
        const userLat = parseFloat(userLocation.latitude);
        const userLng = parseFloat(userLocation.longitude);
        
        if (isNaN(targetLat) || isNaN(targetLng) || isNaN(userLat) || isNaN(userLng)) {
          console.error('Invalid coordinates detected:', {
            targetLat, targetLng, userLat, userLng
          });
          setDistance({
            km: 'Invalid',
            meters: 'Invalid',
            isWithinRadius: false,
            formattedDistance: 'Invalid coordinates'
          });
          return;
        }
        
        const distKm = distanceKm(targetLat, targetLng, userLat, userLng);
        
        // Convert km to meters for more precise radius checking
        const distanceInMeters = parseFloat(distKm) * 1000;
        
        const distanceData = {
          km: distKm,
          meters: distanceInMeters.toFixed(0),
          isWithinRadius: distanceInMeters <= 500, // 100 meter radius
          formattedDistance: distanceInMeters < 1000 
            ? `${distanceInMeters.toFixed(0)}m`
            : `${distKm}km`
        };
        
        setDistance(distanceData);
      } catch (error) {
        logger.error('Error calculating distance:', error);
        setDistance({
          km: 'Error',
          meters: 'Error',
          isWithinRadius: false,
          formattedDistance: 'Calculation error'
        });
      }
    } else {
      setDistance("");
    }
  }, [targetLocation?.latitude, targetLocation?.longitude, userLocation?.latitude, userLocation?.longitude]);

  // Auto-initialize map
  useEffect(() => {
    const timer = setTimeout(initializeMap, 100);
    return () => {
      clearTimeout(timer);
      if (mapRef.current?._map) {
        try {
          // Clear overlays before removing map
          clearMapOverlays(mapRef.current._map);
          mapRef.current._map.remove();
          mapRef.current._map = null;
        } catch (error) {
          logger.warn('Error cleaning up map:', error);
        }
      }
    };
  }, [initializeMap]);

  return {
    // For PunchIn compatibility
    punchInLocation: userLocation,
    // For AddLocation compatibility  
    userLocation,
    distance,
    locationError,
    isGettingLocation,
    mapRef,
    getLocation,
    initializeMap,
  };
};

export default useLocationMap;