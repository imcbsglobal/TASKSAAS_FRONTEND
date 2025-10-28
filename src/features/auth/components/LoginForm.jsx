import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../services/api';
import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice'

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [accountCode, setAccountCode] = useState('');
    const [clientId, setClientId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginType, setLoginType] = useState('personal');
    const navigate = useNavigate();

    const dispatch = useDispatch()
    const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth || {})

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/login/`, {
                username,
                password,
                accountcode: accountCode,
                client_id: clientId
            });

            if (response.data.success) {
                const user = response.data.user;
                const token = response.data.token; // Get the token from response

                if (loginType === 'personal' && user.role === 'Admin') {
                    setError('Admin users must use Corporate Login');
                    setLoading(false);
                    return;
                }

                if (loginType === 'corporate' && user.role === 'User') {
                    setError('Regular users must use Personal Login');
                    setLoading(false);
                    return;
                }



                // Store both user data and token
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', token); // Store token separately
               
                //set user into Redux store
                dispatch(login(user))



                if (user.role === 'Admin') {
                    navigate('/dashboard/admin');
                } else {
                    navigate('/dashboard/user');
                }
            } else {
                setError(response.data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (type) => {
        setLoginType(type);
        setError('');
        setAccountCode('');
    };

    return (
        <div className="login-form-container">
            <div className="login-toggle">
                <button
                    type="button"
                    className={`toggle-btn ${loginType === 'personal' ? 'active' : ''}`}
                    onClick={() => handleToggle('personal')}
                >
                    Personal Login
                </button>
                <button
                    type="button"
                    className={`toggle-btn ${loginType === 'corporate' ? 'active' : ''}`}
                    onClick={() => handleToggle('corporate')}
                >
                    Corporate Login
                </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="clientId">Client ID</label>
                    <input
                        type="text"
                        id="clientId"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        required
                        placeholder="Enter your Client ID"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="accountCode">
                        Account Code (optional)
                    </label>
                    <input
                        type="text"
                        id="accountCode"
                        value={accountCode}
                        onChange={(e) => setAccountCode(e.target.value)}
                        placeholder="Enter if you have an account code"
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : `${loginType === 'personal' ? 'Personal' : 'Corporate'} Login`}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;