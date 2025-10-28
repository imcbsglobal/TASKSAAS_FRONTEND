import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { SettingsApi } from '../../settings/services/settingService';
import { PunchAPI } from '../services/punchService';
import './AreaAssign.scss';

const AreaAssign = () => {
    // State management
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Select User, 2: Assign Areas
    const [users, setUsers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [searchArea, setSearchArea] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState('');
    const dropdownRef = useRef(null);

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

useEffect(()=>{
console.log(users)
},[users])
    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await SettingsApi.getUsers();
            setUsers(response.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    // Fetch areas from API
    const fetchAreas = async () => {
        try {
            setLoading(true);
            const response = await PunchAPI.getAreas();
            // Filter out null values and convert strings to objects
            const areaList = (response.areas || [])
                .filter(area => area !== null)
                .map((area, index) => ({
                    id: area,
                    name: area
                }));
            setAreas(areaList);
        } catch (error) {
            console.error('Error fetching areas:', error);
            toast.error('Failed to fetch areas');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's assigned areas
    const fetchUserAreas = async (userId) => {
        try {
            setLoading(true);
            const response = await PunchAPI.getUserAreas(userId);
            // Response should contain area names
            setSelectedAreas(response.areas || []);
        } catch (error) {
            console.error('Error fetching user areas:', error);
            // If API not implemented, start with empty
            setSelectedAreas([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle user selection and move to step 2
    const handleUserSelect = async (user) => {
        setSelectedUser(user);
        setStep(2);
        setIsDropdownOpen(false);
        setDropdownSearch('');
        // Fetch areas and user's current assignments
        await fetchAreas();
        await fetchUserAreas(user.id);
    };

    // Go back to user selection
    const handleBackToUsers = () => {
        setStep(1);
        setSelectedUser(null);
        setSelectedAreas([]);
        setSearchArea('');
        setAreas([]);
        setDropdownSearch('');
        setIsDropdownOpen(false);
    };

    // Handle area toggle (select/deselect)
    const handleAreaToggle = (areaId) => {
        setSelectedAreas(prev => {
            if (prev.includes(areaId)) {
                return prev.filter(id => id !== areaId);
            } else {
                return [...prev, areaId];
            }
        });
    };

    // Handle select all areas
    const handleSelectAll = () => {
        const allAreaIds = filteredAreas.map(area => area.id);
        setSelectedAreas(allAreaIds);
    };

    // Handle deselect all areas
    const handleDeselectAll = () => {
        setSelectedAreas([]);
    };

    // Save area assignments
    const handleSaveAssignments = async () => {
        if (!selectedUser) {
            toast.error('Please select a user first');
            return;
        }

        if (selectedAreas.length === 0) {
            toast.error('Please select at least one area');
            return;
        }

        try {
            setSaving(true);
            await PunchAPI.updateUserAreas(selectedUser.id, selectedAreas);
           
            toast.success(`${selectedAreas.length} area(s) assigned to ${selectedUser.id} successfully`);
            
            // Reset and go back to step 1
            setTimeout(() => {
                handleBackToUsers();
            }, 1500);
        } catch (error) {
            console.error('Error saving area assignments:', error);
            toast.error('Failed to save area assignments');
        } finally {
            setSaving(false);
        }
    };

    // Filter users based on dropdown search
    const filteredDropdownUsers = useMemo(() => {
        if (!dropdownSearch.trim()) return users;
        
        const search = dropdownSearch.toLowerCase();
        return users.filter(user => 
            user.username?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            user.role?.toLowerCase().includes(search) ||
            user.id?.toLowerCase().includes(search)
        );
    }, [users, dropdownSearch]);

    // Filter areas based on search
    const filteredAreas = useMemo(() => {
        if (!searchArea.trim()) return areas;
        
        const search = searchArea.toLowerCase();
        return areas.filter(area => 
            area.name?.toLowerCase().includes(search)
        );
    }, [areas, searchArea]);

    // Statistics
    const stats = {
        totalUsers: users.length,
        totalAreas: areas.length,
        selectedAreas: selectedAreas.length,
        assignmentProgress: areas.length > 0 
            ? Math.round((selectedAreas.length / areas.length) * 100) 
            : 0
    };

    return (
        <div className="all-body">
            <div className="area-assign-page">
                {/* Header */}
                <div className="area-assign__header">
                    <div className="area-assign__header-content">
                        <div className="header-top">
                            <div className="header-tit">
                                <h1 className="area-assign__title">
                                    <i className="fas fa-map-marked-alt"></i>
                                    Area Assignment
                                </h1>
                                <p className="area-assign__subtitle">
                                    {step === 1 
                                        ? 'Step 1: Select a user to assign areas' 
                                        : `Step 2: Assign areas to ${selectedUser?.id}`
                                    }
                                </p>
                            </div>
                            {/* <button 
                                className="btn btn--secondary"
                                onClick={() => navigate('/area-assign-view')}
                            >
                                <i className="fas fa-list"></i>
                                View Assignments
                            </button> */}
                        </div>
                    </div>
                
                {/* Step Indicator */}
                <div className="step-indicator">
                    <div className={`step-indicator__item ${step >= 1 ? 'step-indicator__item--active' : ''} ${step > 1 ? 'step-indicator__item--completed' : ''}`}>
                        <div className="step-indicator__circle">
                            {step > 1 ? <i className="fas fa-check"></i> : '1'}
                        </div>
                        <span className="step-indicator__label">Select User</span>
                    </div>
                    <div className="step-indicator__line"></div>
                    <div className={`step-indicator__item ${step >= 2 ? 'step-indicator__item--active' : ''}`}>
                        <div className="step-indicator__circle">2</div>
                        <span className="step-indicator__label">Assign Areas</span>
                    </div>
                </div>

                {/* Statistics Cards - Only show in step 2 */}
                {step === 2 && (
                    <div className="area-assign__stats">
                        <div className="stat-card">
                            <div className="stat-card__icon stat-card__icon--user">
                                <i className="fas fa-user"></i>
                            </div>
                            <div className="stat-card__content">
                                <span className="stat-card__value">{selectedUser?.id}</span>
                                <span className="stat-card__label">{selectedUser?.role}</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="area-assign__content">
                {/* STEP 1: User Selection */}
                {step === 1 && (
                    <div className="area-assign__step area-assign__step--users">
                        <div className="step-panel">
                            <div className="panel-header">
                                <h2 className="panel-header__title">
                                    <i className="fas fa-users"></i>
                                    Select User to Assign Areas
                                </h2>
                                <p className="panel-header__subtitle">
                                    Choose a user from the dropdown to start assigning areas
                                </p>
                            </div>

                            <div className="panel-content">
                                <div className="user-selection-container">
                                    <div className="user-dropdown-wrapper">
                                        <label className="user-dropdown-label">
                                            <i className="fas fa-user"></i>
                                            Select User
                                        </label>
                                        
                                        <div className={`user-dropdown ${isDropdownOpen ? 'user-dropdown--open' : ''}`} ref={dropdownRef}>
                                            <div className="user-dropdown__trigger">
                                                <div className="user-dropdown__input-wrapper">
                                                    <i className="fas fa-search user-dropdown__search-icon"></i>
                                                    <input
                                                        type="text"
                                                        placeholder="Type to search users..."
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
                                                    />
                                                    <i 
                                                        className={`fas fa-chevron-down user-dropdown__arrow ${isDropdownOpen ? 'user-dropdown__arrow--up' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsDropdownOpen(!isDropdownOpen);
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
                                                                        <div className="user-option__avatar">
                                                                            {user.id?.charAt(0).toUpperCase() || 'U'}
                                                                        </div>
                                                                        <div className="user-option__info">
                                                                            <div className="user-option__name">{user.id}</div>
                                                                            <div className="user-option__email">{user.email}</div>
                                                                            <div className={`user-option__role user-option__role--${user.role?.toLowerCase()}`}>
                                                                                {user.role}
                                                                            </div>
                                                                        </div>
                                                                        <div className="user-option__action">
                                                                            <i className="fas fa-arrow-right"></i>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="user-selection-stats">
                                            <div className="stat-item">
                                                <i className="fas fa-users"></i>
                                                <span>{users.length} total users</span>
                                            </div>
                                            {dropdownSearch && (
                                                <div className="stat-item">
                                                    <i className="fas fa-filter"></i>
                                                    <span>{filteredDropdownUsers.length} filtered</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="selection-instructions">
                                        <div className="instruction-card">
                                            <div className="instruction-card__icon">
                                                <i className="fas fa-info-circle"></i>
                                            </div>
                                            <div className="instruction-card__content">
                                                <h3>How to select a user:</h3>
                                                <ul>
                                                    <li>Click on the dropdown above or start typing to search</li>
                                                    <li>Filter users by name, email, or role</li>
                                                    <li>Click on a user to proceed to area assignment</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Area Assignment */}
                {step === 2 && (
                    <div className="area-assign__step area-assign__step--areas">
                        <div className="step-panel">
                            <div className="panel-header">
                                <div className="panel-header__left">
                                    <button 
                                        className="btn btn--icon"
                                        onClick={handleBackToUsers}
                                        title="Back to user selection"
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                    </button>
                                    <div>
                                        <h2 className="panel-header__title">
                                            <i className="fas fa-map-pin"></i>
                                            Assign Areas to {selectedUser?.id}
                                        </h2>
                                        <p className="panel-header__subtitle">
                                            Select areas that this user can access for punch-in
                                        </p>
                                    </div>
                                </div>
                                
                            </div>

                            <div className="panel-toolbar">
                                <div className="panel-toolbar__search">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Search areas by name..."
                                        value={searchArea}
                                        onChange={(e) => setSearchArea(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                
                                <div className="panel-toolbar__actions">
                                    <button
                                        className="btn btn--secondary btn--sm"
                                        onClick={handleSelectAll}
                                        disabled={filteredAreas.length === 0}
                                    >
                                        <i className="fas fa-check-double"></i>
                                        Select All
                                    </button>
                                    <button
                                        className="btn btn--secondary btn--sm"
                                        onClick={handleDeselectAll}
                                        disabled={selectedAreas.length === 0}
                                    >
                                        <i className="fas fa-times"></i>
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {selectedAreas.length > 0 && (
                                <div className="progress-bar">
                                    <div className="progress-bar__track">
                                        <div 
                                            className="progress-bar__fill"
                                            style={{ width: `${stats.assignmentProgress}%` }}
                                        ></div>
                                    </div>
                                    <span className="progress-bar__label">
                                        {stats.selectedAreas} of {stats.totalAreas} areas selected ({stats.assignmentProgress}%)
                                    </span>
                                </div>
                            )}

                            <div className="panel-content">
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="spinner"></div>
                                        <p>Loading areas...</p>
                                    </div>
                                ) : filteredAreas.length === 0 ? (
                                    <div className="empty-state">
                                        <i className="fas fa-map-marker-slash"></i>
                                        <p>No areas found</p>
                                        {searchArea && (
                                            <button 
                                                className="btn btn--secondary btn--sm"
                                                onClick={() => setSearchArea('')}
                                            >
                                                Clear Search
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="area-list">
                                        {filteredAreas.map(area => (
                                            <div
                                                key={area.id}
                                                className={`area-card ${selectedAreas.includes(area.id) ? 'area-card--selected' : ''}`}
                                                onClick={() => handleAreaToggle(area.id)}
                                            >
                                                <div className="area-card__checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAreas.includes(area.id)}
                                                        onChange={() => {}}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <span className="checkbox-custom"></span>
                                                </div>
                                                
                                                <div className="area-card__content">
                                                    <h3 className="area-card__name">
                                                        <i className="fas fa-map-marker-alt"></i>
                                                        {area.name}
                                                    </h3>
                                                    <p className="area-card__code">
                                                        <i className="fas fa-code"></i>
                                                        Code: {area.id}
                                                    </p>
                                                </div>

                                                {selectedAreas.includes(area.id) && (
                                                    <div className="area-card__badge">
                                                        <i className="fas fa-check"></i>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with Action Buttons */}
            {step === 2 && (
                <div className="area-assign__footer">
                    <div className="area-assign__footer-content">
                        <div className="footer-info">
                            <p className="footer-info__text">
                                <strong>{selectedAreas.length}</strong> area(s) selected for <strong>{selectedUser?.id}</strong>
                            </p>
                            {selectedAreas.length > 0 && (
                                <p className="footer-info__hint">
                                    <i className="fas fa-info-circle"></i>
                                    Click "Save Assignments" to apply changes
                                </p>
                            )}
                        </div>
                        
                        <div className="footer-actions">
                            <button
                                className="btn btn--secondary"
                                onClick={handleBackToUsers}
                                disabled={saving}
                            >
                                <i className="fas fa-arrow-left"></i>
                                Back
                            </button>
                            <button
                                className="btn btn--primary"
                                onClick={handleSaveAssignments}
                                disabled={saving || selectedAreas.length === 0}
                            >
                                {saving ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i>
                                        Save Assignments ({selectedAreas.length})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default AreaAssign;
