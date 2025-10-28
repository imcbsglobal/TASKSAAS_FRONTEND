import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { SettingsApi } from '../../settings/services/settingService';
import { PunchAPI } from '../services/punchService';
import './AreaAssignView.scss';

const AreaAssignView = () => {
    const navigate = useNavigate();
    
    // State management
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userAreas, setUserAreas] = useState([]);
    const [assignmentHistory, setAssignmentHistory] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [searchArea, setSearchArea] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

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

    // Fetch user's assigned areas
    const fetchUserAssignedAreas = async (userId) => {
        try {
            setLoading(true);
            const response = await PunchAPI.getUserAssignedAreasDetails(userId);
            setUserAreas(response.areas || ["MEPPADI"]);
        } catch (error) {
            console.error('Error fetching user areas:', error);
            toast.error('Failed to fetch user areas');
            setUserAreas([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch assignment history for user
    const fetchAssignmentHistory = async (userId) => {
        try {
            setHistoryLoading(true);
            const response = await PunchAPI.getUserAreaHistory(userId);
            setAssignmentHistory(response.history || []);
        } catch (error) {
            console.error('Error fetching assignment history:', error);
            toast.error('Failed to fetch assignment history');
            setAssignmentHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Handle user selection
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        fetchUserAssignedAreas(user.id);
        fetchAssignmentHistory(user.id);
    };

    // Handle remove area assignment
    const handleRemoveArea = async (areaId) => {
        if (!selectedUser) return;
        
        if (!window.confirm('Are you sure you want to remove this area assignment?')) {
            return;
        }

        try {
            const updatedAreas = userAreas
                .filter(area => area.id !== areaId)
                .map(area => area.id);
            
            await PunchAPI.updateUserAreas(selectedUser.id, updatedAreas);
            toast.success('Area removed successfully');
            
            // Refresh data
            fetchUserAssignedAreas(selectedUser.id);
            fetchAssignmentHistory(selectedUser.id);
        } catch (error) {
            console.error('Error removing area:', error);
            toast.error('Failed to remove area');
        }
    };

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        if (!searchUser.trim()) return users;
        
        const search = searchUser.toLowerCase();
        return users.filter(user => 
            user.username?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            user.role?.toLowerCase().includes(search)
        );
    }, [users, searchUser]);

    // Filter areas based on search
    const filteredAreas = useMemo(() => {
        if (!searchArea.trim()) return userAreas;
        
        const search = searchArea.toLowerCase();
        return userAreas.filter(area => 
            area.firm_name?.toLowerCase().includes(search) ||
            area.address?.toLowerCase().includes(search)
        );
    }, [userAreas, searchArea]);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get action badge class
    const getActionBadgeClass = (action) => {
        switch (action.toLowerCase()) {
            case 'added':
            case 'assigned':
                return 'badge--success';
            case 'removed':
            case 'unassigned':
                return 'badge--danger';
            case 'updated':
            case 'modified':
                return 'badge--warning';
            default:
                return 'badge--info';
        }
    };

    return (
        <div className="all-body">
            <div className="area-assign-view-page">
                <div className="area-assign-view">
                    {/* Header */}
                    <div className="area-assign-view__header">
                        <div className="header-top">
                            <div className="header-tit">
                                <h1 className="area-assign-view__title">
                                    <i className="fas fa-list-alt"></i>
                                    View Area Assignments
                                </h1>
                                <p className="area-assign-view__subtitle">
                                    View and manage user area assignments and history
                                </p>
                            </div>
                            <div className="header-actions">
                                <button 
                                    className="btn-back"
                                    onClick={() => navigate(-1)}
                                    title="Go back"
                                >
                                    <i className="fas fa-arrow-left"></i>
                                    Back
                                </button>
                                <button 
                                    className="btn-primary"
                                    onClick={() => navigate('/area-assign')}
                                >
                                    <i className="fas fa-plus"></i>
                                    New Assignment
                                </button>
                            </div>
                        </div>
                    </div> {/* end area-assign-view__header */}

                    {/* Main Content */}
                    <div className="area-assign-view__content">
                {/* User Selection Sidebar */}
                <div className="area-assign-view__sidebar">
                    <div className="sidebar-panel">
                        <div className="panel-header">
                            <h2 className="panel-header__title">
                                <i className="fas fa-users"></i>
                                Users
                            </h2>
                            <div className="panel-header__search">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="panel-content">
                            {loading && !selectedUser ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="empty-state">
                                    <i className="fas fa-user-slash"></i>
                                    <p>No users found</p>
                                </div>
                            ) : (
                                <div className="user-list">
                                    {filteredUsers.map(user => (
                                        <div
                                            key={user.id}
                                            className={`user-card ${selectedUser?.id === user.id ? 'user-card--active' : ''}`}
                                            onClick={() => handleUserSelect(user)}
                                        >
                                            <div className="user-card__avatar">
                                                {user.username?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="user-card__info">
                                                <h3 className="user-card__name">{user.username}</h3>
                                                <p className="user-card__email">{user.email}</p>
                                                <span className={`user-card__role user-card__role--${user.role?.toLowerCase()}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            {selectedUser?.id === user.id && (
                                                <div className="user-card__check">
                                                    <i className="fas fa-check-circle"></i>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="area-assign-view__main">
                    {!selectedUser ? (
                        <div className="empty-state-large">
                            <i className="fas fa-hand-pointer"></i>
                            <h2>Select a User</h2>
                            <p>Choose a user from the left sidebar to view their area assignments and history</p>
                        </div>
                    ) : (
                        <>
                            {/* User Info Banner */}
                            <div className="user-info-banner">
                                <div className="user-info-banner__avatar">
                                    {selectedUser.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-info-banner__details">
                                    <h2 className="user-info-banner__name">{selectedUser.username}</h2>
                                    <p className="user-info-banner__email">{selectedUser.email}</p>
                                    <span className={`user-info-banner__role user-info-banner__role--${selectedUser.role?.toLowerCase()}`}>
                                        {selectedUser.role}
                                    </span>
                                </div>
                                <div className="user-info-banner__stats">
                                    <div className="stat-item">
                                        <i className="fas fa-map-marked-alt"></i>
                                        <div className="stat-item__content">
                                            <span className="stat-item__value">{userAreas.length}</span>
                                            <span className="stat-item__label">Assigned Areas</span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <i className="fas fa-history"></i>
                                        <div className="stat-item__content">
                                            <span className="stat-item__value">{assignmentHistory.length}</span>
                                            <span className="stat-item__label">History Records</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="tabs">
                                <button
                                    className={`tabs__btn ${activeTab === 'current' ? 'tabs__btn--active' : ''}`}
                                    onClick={() => setActiveTab('current')}
                                >
                                    <i className="fas fa-map-marked-alt"></i>
                                    Current Assignments ({userAreas.length})
                                </button>
                                <button
                                    className={`tabs__btn ${activeTab === 'history' ? 'tabs__btn--active' : ''}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    <i className="fas fa-history"></i>
                                    Assignment History ({assignmentHistory.length})
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {/* Current Assignments Tab */}
                                {activeTab === 'current' && (
                                    <div className="assignments-panel">
                                        <div className="panel-toolbar">
                                            <div className="panel-toolbar__search">
                                                <i className="fas fa-search"></i>
                                                <input
                                                    type="text"
                                                    placeholder="Search assigned areas..."
                                                    value={searchArea}
                                                    onChange={(e) => setSearchArea(e.target.value)}
                                                    className="search-input"
                                                />
                                            </div>
                                            
                                            <div className="panel-toolbar__actions">
                                                <button
                                                    className="btn btn--primary btn--sm"
                                                    onClick={() => navigate('/area-assign')}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                    Modify Assignments
                                                </button>
                                                <div className="view-toggle">
                                                    <button
                                                        className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`}
                                                        onClick={() => setViewMode('grid')}
                                                    >
                                                        <i className="fas fa-th"></i>
                                                    </button>
                                                    <button
                                                        className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`}
                                                        onClick={() => setViewMode('list')}
                                                    >
                                                        <i className="fas fa-list"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="panel-content">
                                            {loading ? (
                                                <div className="loading-state">
                                                    <div className="spinner"></div>
                                                    <p>Loading assigned areas...</p>
                                                </div>
                                            ) : filteredAreas.length === 0 ? (
                                                <div className="empty-state">
                                                    <i className="fas fa-map-marker-slash"></i>
                                                    <h3>No Areas Assigned</h3>
                                                    <p>This user has no assigned areas yet</p>
                                                    <button 
                                                        className="btn btn--primary"
                                                        onClick={() => navigate('/area-assign')}
                                                    >
                                                        <i className="fas fa-plus"></i>
                                                        Assign Areas
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`area-grid area-grid--${viewMode}`}>
                                                    {filteredAreas.map(area => (
                                                        <div key={area.id} className="area-card-detailed">
                                                            <div className="area-card-detailed__header">
                                                                <div className="area-card-detailed__icon">
                                                                    <i className="fas fa-building"></i>
                                                                </div>
                                                                <button
                                                                    className="area-card-detailed__remove"
                                                                    onClick={() => handleRemoveArea(area.id)}
                                                                    title="Remove assignment"
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                            <div className="area-card-detailed__content">
                                                                <h3 className="area-card-detailed__name">
                                                                    {area.firm_name || area.name}
                                                                </h3>
                                                                {area.address && (
                                                                    <p className="area-card-detailed__address">
                                                                        <i className="fas fa-map-marker-alt"></i>
                                                                        {area.address}
                                                                    </p>
                                                                )}
                                                                {(area.latitude && area.longitude) && (
                                                                    <p className="area-card-detailed__coordinates">
                                                                        <i className="fas fa-crosshairs"></i>
                                                                        {area.latitude.toFixed(6)}, {area.longitude.toFixed(6)}
                                                                    </p>
                                                                )}
                                                                {area.assigned_at && (
                                                                    <p className="area-card-detailed__date">
                                                                        <i className="fas fa-clock"></i>
                                                                        Assigned: {formatDate(area.assigned_at)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* History Tab */}
                                {activeTab === 'history' && (
                                    <div className="history-panel">
                                        <div className="panel-toolbar">
                                            <h3 className="panel-toolbar__title">
                                                <i className="fas fa-history"></i>
                                                Assignment History Timeline
                                            </h3>
                                        </div>

                                        <div className="panel-content">
                                            {historyLoading ? (
                                                <div className="loading-state">
                                                    <div className="spinner"></div>
                                                    <p>Loading history...</p>
                                                </div>
                                            ) : assignmentHistory.length === 0 ? (
                                                <div className="empty-state">
                                                    <i className="fas fa-history"></i>
                                                    <h3>No History Available</h3>
                                                    <p>No assignment history found for this user</p>
                                                </div>
                                            ) : (
                                                <div className="timeline">
                                                    {assignmentHistory.map((record, index) => (
                                                        <div key={index} className="timeline-item">
                                                            <div className="timeline-item__marker">
                                                                <i className={`fas ${
                                                                    record.action === 'added' || record.action === 'assigned' 
                                                                        ? 'fa-plus' 
                                                                        : record.action === 'removed' || record.action === 'unassigned'
                                                                        ? 'fa-minus'
                                                                        : 'fa-edit'
                                                                }`}></i>
                                                            </div>
                                                            <div className="timeline-item__content">
                                                                <div className="timeline-item__header">
                                                                    <span className={`badge ${getActionBadgeClass(record.action)}`}>
                                                                        {record.action}
                                                                    </span>
                                                                    <span className="timeline-item__date">
                                                                        {formatDate(record.created_at)}
                                                                    </span>
                                                                </div>
                                                                <h4 className="timeline-item__title">
                                                                    {record.area_name}
                                                                </h4>
                                                                {record.area_address && (
                                                                    <p className="timeline-item__description">
                                                                        <i className="fas fa-map-marker-alt"></i>
                                                                        {record.area_address}
                                                                    </p>
                                                                )}
                                                                {record.assigned_by && (
                                                                    <p className="timeline-item__meta">
                                                                        <i className="fas fa-user"></i>
                                                                        By: {record.assigned_by}
                                                                    </p>
                                                                )}
                                                                {record.notes && (
                                                                    <p className="timeline-item__notes">
                                                                        <i className="fas fa-comment"></i>
                                                                        {record.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
</div>
    );
};

export default AreaAssignView;
