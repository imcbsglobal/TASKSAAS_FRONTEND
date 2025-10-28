import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaRegClock, FaMapMarkerAlt, FaUser, FaCamera } from 'react-icons/fa'
import { IoTimeOutline } from 'react-icons/io5'
import ConfirmModal from '../../../components/ui/Modal/ConfirmModal'
import { PunchAPI } from '../services/punchService'
import { toast } from 'react-toastify'
import '../styles/PunchOutScreen.scss'
import BaseModal from '../../../components/ui/Modal/BaseModal'

const PunchOutScreen = ({ activePunchIn, onPunchOut }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [workDuration, setWorkDuration] = useState('');

    // Real-time clock and duration calculation
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            
            // Calculate work duration
            if (activePunchIn?.punchin_time) {
                const punchInTime = new Date(activePunchIn.punchin_time);
                const diff = now - punchInTime;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setWorkDuration(`${hours}h ${minutes}m`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [activePunchIn?.punchin_time]);

    const handlePunchOut = async () => {
        setLoading(true)
        try {
            await onPunchOut(activePunchIn.punchin_id)
            setShowConfirmModal(false)
            toast.success('Successfully punched out!')
        } catch (error) {
            console.error("Punch out failed:", error)
            toast.error('Failed to punch out. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='punchout-screen'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='punchout-container'
            >
                {/* Left Side - Session Info */}
                <div className="punchout-left">
                    {/* Header */}
                    <div className="punchout-header">
                        <div className="status-indicator">
                            <div className="pulse-dot"></div>
                            <span>Currently Working</span>
                        </div>
                        <h1>You're Punched In</h1>
                    </div>

                    {/* Session Information */}
                    <div className="session-info">
                        <div className="info-card">
                            <FaUser className="info-icon" />
                            <div>
                                <label>Customer</label>
                                <p>{activePunchIn?.firm_name || activePunchIn?.firmName || 'Unknown Customer'}</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <FaRegClock className='info-icon' />
                            <div>
                                <label>Started At</label>
                                <p>{activePunchIn?.punchin_time ? 
                                    new Date(activePunchIn.punchin_time).toLocaleTimeString() : 
                                    'Unknown'
                                }</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <IoTimeOutline className='info-icon' />
                            <div>
                                <label>Duration</label>
                                <p className="duration">{workDuration || '0h 0m'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Time & Actions */}
                <div className="punchout-right">
                    {/* Current Time Display */}
                    <motion.div 
                        className="current-time"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2>{currentTime.toLocaleTimeString()}</h2>
                        <p>{currentTime.toLocaleDateString()}</p>
                    </motion.div>

                    {/* Action Buttons */}
                    <div className="punchout-actions">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="punchout-btn primary"
                            onClick={() => setShowConfirmModal(true)}
                            disabled={loading}
                        >
                            <FaRegClock />
                            Punch Out
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Confirmation Modal */}
            <ConfirmModal
                open={showConfirmModal}
                title="Confirm Punch Out"
                message={`You've been working for ${workDuration}. Are you sure you want to punch out?`}
                confirmText={loading ? "Processing..." : "Yes, Punch Out"}
                cancelText="Cancel"
                loading={loading}
                onConfirm={handlePunchOut}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div>
    )
}

export default PunchOutScreen