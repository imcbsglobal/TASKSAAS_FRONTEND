import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Menuselection.scss';
import { SettingsApi } from '../services/settingService';

const Menuselection = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState('');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && isDropdownOpen) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isDropdownOpen]);

    // Check if user is level one
    const isLevelOne = (user) => {
        if (!user) return false;

        if (user.level !== undefined && user.level !== null) {
            const n = Number(user.level);
            if (!isNaN(n) && n === 1) return true;
        }

        const roleStr = (user.role ?? '').toString().trim().toLowerCase();
        if (!roleStr) return false;
        if (roleStr === '1') return true;
        if (/level[\s-]*1/.test(roleStr)) return true;
        return false;
    };

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await SettingsApi.getUsers();
            console.log("usr data ,", response.users)
            
            const raw = Array.isArray(response?.users)
                ? response.users
                : Array.isArray(response)
                ? response
                : [];
            
            // Filter to show only level one users
            const level1 = raw.filter((u) => isLevelOne(u));

            // Remove duplicates
            const seen = new Set();
            const deduped = [];
            for (const u of level1) {
                const key = (u?.id ?? '').toString();
                if (!key) continue;
                if (!seen.has(key)) {
                    seen.add(key);
                    deduped.push(u);
                }
            }
            setUsers(deduped);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on dropdown search
    const filteredDropdownUsers = useMemo(() => {
        if (!dropdownSearch.trim()) return users;
        
        const searchLower = dropdownSearch.toLowerCase();
        return users.filter(user => 
            user.id?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.role?.toLowerCase().includes(searchLower) ||
            user.accountcode?.toLowerCase().includes(searchLower)
        );
    }, [users, dropdownSearch]);

    // Handle user selection
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setIsDropdownOpen(false);
        setDropdownSearch('');
    };

    // Navigate to menu management page
    const handleProceed = () => {
        if (selectedUser) {
            navigate(`/settings/menu-management/${selectedUser.id}`, {
                state: { user: selectedUser }
            });
        }
    };

    return (
        <div className="menu-selection-body">
            <div className="menu-selection-container">
                <div className="selection-header">
                    <h1>Menu Management</h1>
                    <p className="subtitle">Select a user to manage their menu permissions</p>
                </div>

                <div className="selection-content">
                    <div className="form-group">
                        <label htmlFor="user-select" className="user-dropdown-label">
                            Select User
                        </label>
                        
                        <div className={`user-dropdown ${isDropdownOpen ? 'user-dropdown--open' : ''}`} ref={dropdownRef}>
                            <div className="user-dropdown__trigger">
                                <div className="user-dropdown__input-wrapper">
                                    <i className="fas fa-search user-dropdown__search-icon"></i>
                                    <input
                                        type="text"
                                        placeholder={selectedUser ? selectedUser.id : "Search users..."}
                                        value={dropdownSearch}
                                        onChange={(e) => {
                                            setDropdownSearch(e.target.value);
                                            if (!isDropdownOpen) setIsDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isDropdownOpen) setIsDropdownOpen(true);
                                        }}
                                        className="user-dropdown__input"
                                        disabled={loading}
                                    />
                                    <i 
                                        className={`fas fa-chevron-down user-dropdown__arrow ${isDropdownOpen ? 'user-dropdown__arrow--up' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!loading) setIsDropdownOpen(!isDropdownOpen);
                                        }}
                                    ></i>
                                </div>
                            </div>

                            {isDropdownOpen && (
                                <div className="user-dropdown__menu">
                                    {loading ? (
                                        <div className="user-dropdown__loading">
                                            <div className="spinner-small"></div>
                                            <span>Loading users...</span>
                                        </div>
                                    ) : filteredDropdownUsers.length === 0 ? (
                                        <div className="user-dropdown__empty">
                                            <i className="fas fa-user-slash"></i>
                                            <span>
                                                {dropdownSearch ? 'No users found matching your search' : 'No users available'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="user-dropdown__options">
                                            {filteredDropdownUsers.map(user => (
                                                <div
                                                    key={user.id}
                                                    className="user-dropdown__option"
                                                    onClick={() => handleUserSelect(user)}
                                                >
                                                    <div className="user-option">
                                                        <div className="user-option__info">
                                                            <div className="user-option__name">{user.id}</div>
                                                        </div>
                                                        {selectedUser?.id === user.id && (
                                                            <div className="user-option__selected">
                                                                <i className="fas fa-check"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedUser && (
                        <div className="user-preview-card">
                            <div className="preview-header">
                                <i className="fas fa-user-circle"></i>
                                <h3>Selected User</h3>
                            </div>
                            <div className="preview-content">
                                <div className="preview-row">
                                    <span className="preview-label">User ID:</span>
                                    <span className="preview-value">{selectedUser.id}</span>
                                </div>
                                <div className="preview-row">
                                    <span className="preview-label">Role:</span>
                                    <span className="preview-value role-badge">{selectedUser.role || 'User'}</span>
                                </div>
                                {selectedUser.accountcode && (
                                    <div className="preview-row">
                                        <span className="preview-label">Account Code:</span>
                                        <span className="preview-value">{selectedUser.accountcode}</span>
                                    </div>
                                )}
                                {selectedUser.client_id && (
                                    <div className="preview-row">
                                        <span className="preview-label">Client ID:</span>
                                        <span className="preview-value">{selectedUser.client_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="action-section">
                        <button
                            className="btn btn-proceed"
                            onClick={handleProceed}
                            disabled={!selectedUser || loading}
                        >
                            <span>Proceed to Menu Management</span>
                            <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>

                    <div className="total-users">
                        Total Users: <strong>{users.length}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Menuselection;