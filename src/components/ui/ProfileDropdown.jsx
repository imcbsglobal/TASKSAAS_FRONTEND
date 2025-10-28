import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileDropdown.scss';

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Get user initials for avatar
    const getUserInitials = (username) => {
        if (!username) return 'U';
        return username.charAt(0).toUpperCase();
    };

    return (
        <div className="profile-dropdown" ref={dropdownRef}>
            <button 
                className="profile-button" 
                onClick={toggleDropdown}
                aria-label="User menu"
            >
                <div className="profile-avatar">
                    {getUserInitials(user?.username)}
                </div>
                <svg 
                    className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12"
                >
                    <path d="M6 8L2 4h8l-4 4z" fill="currentColor" />
                </svg>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <div className="user-avatar">
                            {getUserInitials(user?.username)}
                        </div>
                        <div className="user-info">
                            <p className="username">{user?.username}</p>
                            <p className="user-role">{user?.role}</p>
                        </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button 
                        className="logout-button" 
                        onClick={handleLogout}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path 
                                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                            <polyline 
                                points="16,17 21,12 16,7"
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                            <line 
                                x1="21" 
                                y1="12" 
                                x2="9" 
                                y2="12"
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;