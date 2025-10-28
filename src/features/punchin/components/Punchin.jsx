import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import "../styles/punchin.scss";

// Components
import ConfirmModal from "../../../components/ui/Modal/ConfirmModal";
import CamModal from "./CamModal";
import StepProgress from "./wizard/StepProgress";
import CustomerSelectionStep from "./wizard/CustomerSelectionStep";
import PhotoCaptureStep from "./wizard/PhotoCaptureStep";
import LocationCaptureStep from "./wizard/LocationCaptureStep";
import ConfirmationStep from "./wizard/ConfirmationStep";

// Hooks
import { useCamera, useDebounce } from "../../../hooks";
import useLocationMap from "../hooks/useLocationMap";

// Services & Utils
import { PunchAPI } from "../services/punchService";
import { logger } from "../../../utils/logger";

// Constants
import { WIZARD_STEPS, STEP_TITLES } from "../constants/wizardConstants";
import { toast } from "react-toastify";

const Punchin = ({ onPunchIn }) => {
  const [currentStep, setCurrentStep] = useState(WIZARD_STEPS.CUSTOMER_SELECTION);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [openConfirmPunchIn, setOpenConfirmPunchIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);

  // Debounced customer selection to prevent immediate heavy operations
  const debouncedSelectedCustomer = useDebounce(selectedCustomer, 150);

  const {
    showCamera,
    setShowCamera,
    capturedImage,
    setCapturedImage,
    videoRef,
    capturePhoto,
  } = useCamera(facingMode);

  const {
    punchInLocation: capturedLocation,
    distance,
    locationError,
    isGettingLocation,
    mapRef,
    getLocation,
    initializeMap,
  } = useLocationMap(debouncedSelectedCustomer);

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      setCustomersError(null);

      try {
        const response = await PunchAPI.getFirms();
        const customerData = response.firms.filter(cus => {
        return  cus.latitude !== null
        }) || [];
        setCustomers(customerData);

        logger.info('Customers fetched successfully', { count: customerData.length });
      } catch (err) {
        const errorMessage = 'Failed to fetch customers. Please try again.';
        setCustomersError(errorMessage);
        logger.error('Failed to fetch customers:', err);
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchCustomers();
  }, []);


  //WIZARD ACTIONS
  const handleNext = useCallback(() => {
    if (currentStep < Object.keys(WIZARD_STEPS).length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handlePunchIn = useCallback(async () => {
    // Validate location radius before punch-in (only if customer has location data)
    if (debouncedSelectedCustomer?.latitude && capturedLocation) {
      const isWithinRadius = distance?.isWithinRadius;

      if (!isWithinRadius) {
        alert(`You must be within 100 meters of ${debouncedSelectedCustomer.firm_name} to punch in. Current distance: ${distance?.formattedDistance || 'Unknown'}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const ResponsePunch = await PunchAPI.punchIn({
        customerCode: debouncedSelectedCustomer?.id,
        customerName: debouncedSelectedCustomer?.firm_name || debouncedSelectedCustomer.customerName,
        image: capturedImage?.file,
        location: capturedLocation,
        distance: distance?.formattedDistance || 'N/A'
      });

      localStorage.setItem("activePunchIn", JSON.stringify(ResponsePunch.data));

      // Call parent callback if provided
      if (onPunchIn) {
        await onPunchIn({
          customerCode: debouncedSelectedCustomer?.id,
          customerName: debouncedSelectedCustomer?.firm_name || debouncedSelectedCustomer.customerName,
          image: capturedImage?.file,
          location: capturedLocation,
          distance: distance?.formattedDistance || 'N/A'
        });
      }
      // toast.success("Punched in successfully!");

      // Reset wizard to first step
      setCurrentStep(WIZARD_STEPS.CUSTOMER_SELECTION);
      setSelectedCustomer(null);
      setCapturedImage(null);
      logger.info('Punch-in completed successfully');
    } catch (err) {
      console.error(err);
      alert("Punch in failed!");
      logger.error('Punch-in failed:', err);
    } finally {
      setIsLoading(false);
      setOpenConfirmPunchIn(false);
    }
  }, [debouncedSelectedCustomer, capturedImage, capturedLocation, distance, setCapturedImage, onPunchIn]);

  const renderCurrentStep = useCallback(() => {
    switch (currentStep) {
      case WIZARD_STEPS.CUSTOMER_SELECTION:
        return (
          <CustomerSelectionStep
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            onNext={handleNext}
            isLoading={customersLoading}
            error={customersError}
          />
        );
      case WIZARD_STEPS.PHOTO_CAPTURE:
        return (
          <PhotoCaptureStep
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
            showCamera={showCamera}
            setShowCamera={setShowCamera}
            facingMode={facingMode}
            setFacingMode={setFacingMode}
            videoRef={videoRef}
            capturePhoto={capturePhoto}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case WIZARD_STEPS.LOCATION_CAPTURE:
        return (
          <LocationCaptureStep
            selectedCustomer={selectedCustomer}
            capturedLocation={capturedLocation}
            distance={distance}
            mapRef={mapRef}
            getLocation={getLocation}
            initializeMap={initializeMap}
            isGettingLocation={isGettingLocation}
            locationError={locationError}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case WIZARD_STEPS.CONFIRMATION:
        return (
          <ConfirmationStep
            selectedCustomer={selectedCustomer}
            capturedImage={capturedImage}
            capturedLocation={capturedLocation}
            distance={distance}
            onPunchIn={() => {
              setOpenConfirmPunchIn(true)
            }}
            onPrev={handlePrev}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    handleNext,
    customersLoading,
    customersError,
    capturedImage,
    setCapturedImage,
    showCamera,
    setShowCamera,
    facingMode,
    setFacingMode,
    videoRef,
    capturePhoto,
    handlePrev,
    capturedLocation,
    distance,
    mapRef,
    getLocation,
    isGettingLocation,
    locationError,
    handlePunchIn,
    isLoading
  ]);

  return (
    <div className="punchin_wizard">
      <StepProgress
        currentStep={currentStep}
        totalSteps={Object.keys(WIZARD_STEPS).length}
        stepTitles={STEP_TITLES}
      />

      <div className="wizard_container">
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
      </div>

      <CamModal
        showCamera={showCamera}
        setShowCamera={setShowCamera}
        facingMode={facingMode}
        setFacingMode={setFacingMode}
        videoRef={videoRef}
        capturePhoto={capturePhoto}
      />

      <ConfirmModal
        open={openConfirmPunchIn}
        title="Confirm Punch In"
        message="Are you sure you want to punch in?"
        onConfirm={handlePunchIn}
        onCancel={() => setOpenConfirmPunchIn(false)}
        loading={isLoading}
      />
    </div>
  );
};

export default Punchin;
