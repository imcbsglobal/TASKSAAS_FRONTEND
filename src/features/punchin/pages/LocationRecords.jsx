import React from 'react'
import '../styles/LocationRecords.scss'
import { AiOutlinePlus } from 'react-icons/ai'
import StoreTable from '../components/RecentLocatioinTable';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LocationRecords = () => {
    const navigate = useNavigate();
    const userRole = useSelector((state) => state.auth?.user?.role)

    return (
        <div className="all-body">
            <div className='location_capture'>
                {userRole !== "Admin" &&
                    (<div className="add_new_button" style={{ marginBottom: '20px' }} onClick={() => {
                        navigate("/punch-in/location/capture")
                    }}>
                        <AiOutlinePlus className='icon' />
                        <span className='add-loc-label'>Add Location</span>
                    </div>)
                }
                <div className="">
                    <StoreTable />
                </div>
            </div>
        </div>

    )
}

export default LocationRecords