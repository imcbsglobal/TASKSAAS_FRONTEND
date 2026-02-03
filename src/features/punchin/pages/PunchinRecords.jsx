import React, { useState } from 'react'
import styles from '../styles/PunchinRecords.module.scss'
import { AiOutlinePlus } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import StoreTable from '../components/RecentLocatioinTable'
import PunchinTable from '../components/RecentPunchinTable'
// import StoreTable from '../components/StoreTable'

const PunchinRecords = () => {
    const navigate = useNavigate()
    const userRole = useSelector((state) => state.auth?.user?.role)

    return (
        <div className="all-body">
            <div className="location_capture">
                {userRole !== "Admin" && (
                    <div
                        className={styles['add_new_button']}
                        style={{ marginBottom: '20px' }}
                        //PunchIn Capture Page
                        onClick={() => navigate("/punch-in/capture")}
                    >
                        <AiOutlinePlus className="icon" />
                        <span className="add-loc-label">Verify Visit</span>
                    </div>
                )}

                <div className="">
                    {/* This section shows your recent verifications (limit 5) */}
                    <PunchinTable />
                </div>
            </div>
        </div>
    )
}

export default PunchinRecords
