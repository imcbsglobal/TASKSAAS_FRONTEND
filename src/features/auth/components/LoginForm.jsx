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
    const [showPassword, setShowPassword] = useState(false);
    const [isHoveringEye, setIsHoveringEye] = useState(false);
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
                const token = response.data.token;

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

                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', token);
               
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Inline styles
    const passwordWrapperStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    };

    const passwordInputStyle = {
        width: '100%',
        paddingRight: '3rem'
    };

    const eyeButtonStyle = {
        position: 'absolute',
        right: '0.75rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isHoveringEye ? '#2563eb' : '#666',
        transition: 'color 0.3s ease'
    };

    return (
        <>
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
                    <label htmlFor="username">Username or Email</label>
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
                    <div style={passwordWrapperStyle}>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={passwordInputStyle}
                        />
                        <button
                            type="button"
                            style={eyeButtonStyle}
                            onClick={togglePasswordVisibility}
                            onMouseEnter={() => setIsHoveringEye(true)}
                            onMouseLeave={() => setIsHoveringEye(false)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>
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
                    {loading ? 'Logging in...' : 'Log in'}
                </button>
            </form>
        </>
    );
};

export default LoginForm;