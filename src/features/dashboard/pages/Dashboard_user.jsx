import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard_admin.scss'; // Import the same stylesheet
import axios from 'axios';
import API_BASE_URL from '../../../services/api';

const DashboardUser = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [miselData, setMiselData] = useState([]); // Changed to array
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/');
        } else {
            fetchMiselData();
        }
    }, []);

    const fetchMiselData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/get-misel-data/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if (response.data.success && response.data.data.length > 0) {
                setMiselData(response.data.data); // Store all records
            }
        } catch (error) {
            console.error('Error fetching MISEL data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className='all-body'>
            <div className="dashboard">
                <header>
                    <h1>Welcome, {user?.username}!</h1>
                    <div className="user-info">
                        <p>
                            Role: <strong className={`role-${user?.role?.toLowerCase()}`}>
                                {user?.role || 'User'}
                            </strong>
                        </p>
                    </div>
                    <p>Client ID: <strong>{user?.client_id}</strong></p>
                </header>
                
                <main>
                    <div className="dashboard-content">
                        <h2>User Dashboard</h2>
                        
                        {loading ? (
                            <div className="loading-section">
                                <p>Loading company information...</p>
                            </div>
                        ) : miselData.length > 0 ? (
                            <div className="misel-data-section">
                                <h3>Company Information ({miselData.length} record{miselData.length > 1 ? 's' : ''})</h3>
                                
                                {miselData.map((company, index) => (
                                    <div key={company.id || index} className="company-record">
                                        {miselData.length > 1 && (
                                            <h4>Company {index + 1}: {company.firm_name}</h4>
                                        )}
                                        <div className='full-table'>
                                            <table className="misel-table">
                                                <tbody>
                                                    <tr>
                                                        <td>Firm Name</td>
                                                        <td>{company.firm_name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Address</td>
                                                        <td>{company.address}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Address Line 1</td>
                                                        <td>{company.address1}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Address Line 2</td>
                                                        <td>{company.address2}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Address Line 3</td>
                                                        <td>{company.address3}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Phones</td>
                                                        <td>{company.phones}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Mobile</td>
                                                        <td>{company.mobile || 'N/A'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>GST No</td>
                                                        <td>{company.tinno}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Email</td>
                                                        <td>{company.pagers}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {index < miselData.length - 1 && <hr style={{margin: '20px 0'}} />}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-section">
                                <p>No company information found for your account.</p>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardUser;