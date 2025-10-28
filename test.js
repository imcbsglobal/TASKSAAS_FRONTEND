import React, { Suspense, useEffect, useState } from "react";
import "../styles/PunchinCapture.scss";

// Components
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { PunchAPI } from "../services/punchService";
import { toast } from 'react-toastify';

// Lazy load components
const Punchin = React.lazy(() => import("../components/Punchin"));
const PunchOutScreen = React.lazy(() => import("../components/PunchOutScreen"));

/**
 * Smart PunchInCapture component that checks for active punch-ins
 * and shows appropriate screen (wizard or punch-out)
 */
const PunchInCapture = () => {
    // State management
    const [activePunchIn, setActivePunchIn] = useState(null);
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for active punch-in on component mount
    useEffect(() => {
        checkActivePunchIn();
    }, []);

    /**
     * Check if user has an active punch-in session
     * Uses hybrid approach: localStorage + API verification
     */
    const checkActivePunchIn = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use the smart status checking method
            const statusCheck = await PunchAPI.checkPunchInStatus();

            if (statusCheck.isActive && statusCheck.activePunchIn) {
                setActivePunchIn(statusCheck.activePunchIn);
                setIsPunchedIn(true);

                // Show feedback about data source
                if (statusCheck.source === 'localStorage') {
                    toast.info('Working offline - showing last known status');
                }
            } else {
                setActivePunchIn(null);
                setIsPunchedIn(false);
            }
        } catch (error) {
            console.error('Failed to check punch-in status:', error);
            setError('Failed to load punch-in status. Please check your connection.');

            // Emergency fallback: check localStorage directly
            const stored = localStorage.getItem('activePunchIn');
            if (stored) {
                try {
                    const punchData = JSON.parse(stored);
                    setActivePunchIn(punchData);
                    setIsPunchedIn(true);
                    toast.warning('Working offline - showing cached data');
                } catch (parseError) {
                    localStorage.removeItem('activePunchIn');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle punch-out action
     */
    const handlePunchOut = async () => {
        try {
            if (activePunchIn?.id) {
                await PunchAPI.punchOut(activePunchIn.id);
                toast.success('Successfully punched out!');
            }

            // Clear state and localStorage
            setActivePunchIn(null);
            setIsPunchedIn(false);
            localStorage.removeItem('activePunchIn');

        } catch (error) {
            console.error('Punch out failed:', error);
            toast.error('Failed to punch out. Please try again.');
            throw error; // Re-throw for PunchOutScreen to handle
        }
    };

    /**
     * Handle successful punch-in from wizard
     */
    const handlePunchIn = async (punchData) => {
        try {
            const result = await PunchAPI.punchIn(punchData);

            // Create active punch object for localStorage
            const newPunchIn = {
                id: result.data.id,
                firm_name: punchData.customerName,
                firm_code: punchData.customerCode,
                punchin_time: new Date().toISOString(),
                photo_url: result.data.photo_url,
                latitude: punchData.location?.latitude,
                longitude: punchData.location?.longitude,
                status: 'active'
            };

            // Update state and localStorage
            setActivePunchIn(newPunchIn);
            setIsPunchedIn(true);
            localStorage.setItem('activePunchIn', JSON.stringify(newPunchIn));

            toast.success('Successfully punched in!');
            return result;
        } catch (error) {
            toast.error('Punch-in failed. Please try again.');
            throw error;
        }
    };

    // Loading state - checking punch-in status
    if (loading) {
        return (
            <div className="all-body">
                <div className="punchin-capture-page">
                    <div className="status-check-loading">
                        <LoadingSpinner size="large" />
                        <h3>Checking your punch-in status...</h3>
                        <p>Please wait while we verify your current session</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state with retry and continue options
    if (error && !isPunchedIn) {
        return (
            <div className="all-body">
                <div className="punchin-capture-page">
                    <div className="error-fallback">
                        <h2>Unable to verify punch-in status</h2>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button
                                onClick={checkActivePunchIn}
                                className="retry-btn"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => {
                                    setError(null);
                                    setIsPunchedIn(false);
                                    setLoading(false);
                                }}
                                className="continue-btn"
                            >
                                Continue to Punch-In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback components for ErrorBoundary and Suspense
    const fallbackComponent = (
        <div className="error-fallback">
            <h2>Unable to load punch-in system</h2>
            <p>Please refresh the page and try again.</p>
            <button onClick={() => window.location.reload()}>
                Refresh Page
            </button>
        </div>
    );

    const loadingComponent = (
        <div className="loading-container">
            <LoadingSpinner size="large" />
            <p>Loading...</p>
        </div>
    );

    return (
        <div className="all-body">
            <div className="punchin-capture-page">
                <ErrorBoundary fallback={fallbackComponent}>
                    <Suspense fallback={loadingComponent}>
                        {isPunchedIn ? (
                            <PunchOutScreen
                                activePunchIn={activePunchIn}
                                onPunchOut={handlePunchOut}
                                onRefresh={checkActivePunchIn}
                            />
                        ) : (
                            <Punchin onPunchIn={handlePunchIn} />
                        )}
                    </Suspense>
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default PunchInCapture;