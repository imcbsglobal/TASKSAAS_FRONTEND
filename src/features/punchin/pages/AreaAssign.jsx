// REQUIRED so your icons actually appear
import '@fortawesome/fontawesome-free/css/all.min.css';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { SettingsApi } from '../../settings/services/settingService';
import { PunchAPI } from '../services/punchService';
import './AreaAssign.scss';

const AreaAssign = () => {
  const [users, setUsers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const userDropdownRef = useRef(null);
  const areaDropdownRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(e.target)) {
        setAreaDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await SettingsApi.getUsers();
      const raw = Array.isArray(response?.users)
        ? response.users
        : Array.isArray(response)
        ? response
        : [];
      const level1 = raw.filter((u) => isLevelOne(u));

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
      return deduped;
    } catch (err) {
      console.error('fetchUsers', err);
      toast.error('Failed to fetch users');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await PunchAPI.getAreas();
      const list = (res?.areas || []).filter((a) => a != null);
      setAreas(list);
    } catch (err) {
      console.error('fetchAreas', err);
      toast.error('Failed to fetch areas');
    }
  };

  const fetchAllAssignments = async (userList) => {
    try {
      const usersToFetch = userList || users;
      if (usersToFetch.length === 0) return;

      const assignmentPromises = usersToFetch.map(user =>
        PunchAPI.getUserAreas(user.id)
          .then(res => ({ userId: user.id, areas: res?.areas || [] }))
          .catch(() => ({ userId: user.id, areas: [] }))
      );

      const results = await Promise.all(assignmentPromises);

      const newAssignments = {};
      results.forEach(result => {
        if (result.areas.length > 0) {
          newAssignments[result.userId] = result.areas;
        }
      });

      setAssignments(newAssignments);
    } catch (err) {
      console.error('fetchAllAssignments', err);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await fetchUsers();
      await fetchAreas();
      await fetchAllAssignments(fetchedUsers);
    } catch (err) {
      console.error('loadInitialData', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await fetchUsers();
      await fetchAreas();
      await fetchAllAssignments(fetchedUsers);
      toast.success('Data refreshed successfully');
    } catch (err) {
      console.error('handleRefresh', err);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setUserDropdownOpen(false);
    setSearchUser('');

    // Fetch user areas if not already loaded
    if (!assignments[user.id]) {
      try {
        const res = await PunchAPI.getUserAreas(user.id);
        setAssignments((prev) => ({
          ...prev,
          [user.id]: res?.areas || [],
        }));
      } catch (err) {
        console.error('fetchUserAreas', err);
      }
    }
  };

  const toggleAreaSelection = (area) => {
    setSelectedAreas((prev) => {
      if (prev.includes(area)) {
        return prev.filter((a) => a !== area);
      }
      return [...prev, area];
    });
  };

  const handleAddAreas = async () => {
    if (!selectedUser || selectedAreas.length === 0) return;

    const userAreas = assignments[selectedUser.id] || [];
    const newAreas = selectedAreas.filter((area) => !userAreas.includes(area));

    if (newAreas.length === 0) {
      toast.warning('All selected areas are already assigned');
      return;
    }

    const updatedAreas = [...userAreas, ...newAreas];

    try {
      await PunchAPI.updateUserAreas(selectedUser.id, updatedAreas);
      setAssignments((prev) => ({
        ...prev,
        [selectedUser.id]: updatedAreas,
      }));
      setSelectedAreas([]);
      setAreaDropdownOpen(false);
      setSearchArea('');
      toast.success(`${newAreas.length} area(s) assigned successfully`);
    } catch (err) {
      console.error('Error adding areas', err);
      toast.error('Failed to assign areas');
    }
  };

  const handleDeleteAllAssignments = async (userId) => {
    const user = users.find((u) => u.id === userId);
    const userName = user?.name || user?.accountcode || userId;

    if (!window.confirm(`Delete all area assignments for ${userName}?`)) return;

    try {
      await PunchAPI.updateUserAreas(userId, []);
      setAssignments((prev) => ({
        ...prev,
        [userId]: [],
      }));
      toast.success('All assignments deleted successfully');
    } catch (err) {
      console.error('Error deleting assignments', err);
      toast.error('Failed to delete assignments');
    }
  };

  const handleEditAssignments = (userId) => {
    const user = users.find((u) => u.id === userId);
    setEditingUser({
      id: userId,
      name: user?.name || user?.accountcode || userId,
      areas: assignments[userId] || [],
    });
    setEditModalOpen(true);
  };

  const handleDeleteFromModal = async (area) => {
    if (!editingUser) return;

    const updatedAreas = editingUser.areas.filter((a) => a !== area);

    try {
      await PunchAPI.updateUserAreas(editingUser.id, updatedAreas);
      setAssignments((prev) => ({
        ...prev,
        [editingUser.id]: updatedAreas,
      }));
      setEditingUser((prev) => ({
        ...prev,
        areas: updatedAreas,
      }));
      toast.success('Area removed successfully');
    } catch (err) {
      console.error('Error removing area', err);
      toast.error('Failed to remove area');
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchUser.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.id?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.accountcode?.toLowerCase().includes(q)
    );
  }, [users, searchUser]);

  const filteredAreas = useMemo(() => {
    const q = searchArea.toLowerCase().trim();
    if (!q) return areas;
    return areas.filter((a) => a.toLowerCase().includes(q));
  }, [areas, searchArea]);

  const getUsersWithAssignments = useMemo(() => {
    return users
      .filter((user) => (assignments[user.id] || []).length > 0)
      .map((user) => ({
        ...user,
        areas: assignments[user.id] || [],
      }));
  }, [users, assignments]);

  return (
    <div className="all-body">
      <div className="area-assign-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="header-title">Area Assignment</h1>
              <p className="header-subtitle">Assign and manage area access for Level 1 users</p>
            </div>
            <button type="button" onClick={handleRefresh} disabled={loading} className="header-refresh-btn">
              <i className="fas fa-sync-alt" />
              <span>Refresh</span>
            </button>
          </div>

          {loading && (
            <div className="header-loading">
              <span className="spinner" />
              <span>Loading...</span>
            </div>
          )}
        </div>

        {/* Assignment Controls */}
        <div className="assignment-controls">
          <h2 className="controls-title">
            <span>Add New Assignment</span>
          </h2>

          <div className="controls-grid">
            {/* User Dropdown */}
            <div className="dropdown-wrapper" ref={userDropdownRef}>
              <label className="dropdown-label">Select User</label>
              <div className="dropdown-container" onClick={() => setUserDropdownOpen(true)}>
                <input
                  type="text"
                  placeholder="Select user"
                  value={
                    selectedUser
                      ? selectedUser.name || selectedUser.accountcode || selectedUser.id
                      : ''
                  }
                  readOnly
                  className="dropdown-input"
                />
                {selectedUser && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(null);
                      setSearchUser('');
                      setSelectedAreas([]);
                    }}
                    className="dropdown-clear"
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
                <button
                  type="button"
                  className="dropdown-arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserDropdownOpen((prev) => !prev);
                  }}
                >
                  <i className="fas fa-chevron-down" />
                </button>
              </div>

              {userDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-search-wrapper">
                    <div className="dropdown-search">
                      <i className="fas fa-search" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="dropdown-items">
                    {filteredUsers.length === 0 ? (
                      <div className="dropdown-empty">No users found</div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className={`dropdown-item ${
                            selectedUser?.id === user.id ? 'dropdown-item-selected' : ''
                          }`}
                        >
                          <div className="dropdown-item-main">
                            {user.name || user.accountcode || user.id}
                          </div>
                          <i className="fas fa-check dropdown-item-checkmark" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Areas Dropdown */}
            <div className="dropdown-wrapper" ref={areaDropdownRef}>
              <label className="dropdown-label">Select Areas</label>
              <div
                className={`dropdown-container ${!selectedUser ? 'dropdown-disabled' : ''}`}
                onClick={() => selectedUser && setAreaDropdownOpen(true)}
              >
                <input
                  type="text"
                  placeholder={
                    selectedUser
                      ? selectedAreas.length > 0
                        ? `${selectedAreas.length} area(s) selected`
                        : 'Select areas'
                      : 'Select user first'
                  }
                  readOnly
                  disabled={!selectedUser}
                  className="dropdown-input"
                />

                {selectedAreas.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAreas([]);
                    }}
                    className="dropdown-clear"
                  >
                    <i className="fas fa-times" />
                  </button>
                )}

                <button
                  type="button"
                  className="dropdown-arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedUser) setAreaDropdownOpen((prev) => !prev);
                  }}
                >
                  <i className="fas fa-chevron-down" />
                </button>
              </div>

              {areaDropdownOpen && selectedUser && (
                <div className="dropdown-menu">
                  <div className="dropdown-search-wrapper">
                    <div className="dropdown-search">
                      <i className="fas fa-search" />
                      <input
                        type="text"
                        placeholder="Search areas..."
                        value={searchArea}
                        onChange={(e) => setSearchArea(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="dropdown-items">
                    {filteredAreas.length === 0 ? (
                      <div className="dropdown-empty">No areas found</div>
                    ) : (
                      filteredAreas.map((area) => (
                        <div
                          key={area}
                          onClick={() => toggleAreaSelection(area)}
                          className={`dropdown-item dropdown-item-single ${
                            selectedAreas.includes(area) ? 'dropdown-item-selected' : ''
                          }`}
                        >
                          <span className="dropdown-item-main">{area}</span>
                          <i className="fas fa-check dropdown-item-checkmark" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Add Assignment Button */}
            <div className="add-button-wrapper">
              <button
                type="button"
                onClick={handleAddAreas}
                disabled={!selectedUser || selectedAreas.length === 0}
                className="btn-add"
              >
                <i className="fas fa-plus" />
                <span>Add Assignment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="assignments-table-section">
          <h2 className="table-section-title">
            <span>Current Assignments</span>
          </h2>

          {getUsersWithAssignments.length === 0 ? (
            <div className="table-empty-state">
              <i className="fas fa-inbox" />
              <p>No assignments yet</p>
              <span>Start by assigning areas to users above</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>USER NAME</th>
                    <th>ASSIGNED AREAS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {getUsersWithAssignments.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>

                      <td className="user-name-cell">
                        {user.name || user.accountcode || user.id}
                      </td>

                      <td>
                        <div className="areas-badges">
                          {user.areas.slice(0, 3).map((area, idx) => (
                            <span key={idx} className="area-badge">
                              {area}
                            </span>
                          ))}
                          {user.areas.length > 3 && (
                            <span className="area-badge-more">
                              +{user.areas.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            onClick={() => handleEditAssignments(user.id)}
                            className="btn-action btn-edit"
                            title="Edit assignments"
                          >
                            <i className="fas fa-edit" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAllAssignments(user.id)}
                            className="btn-action btn-delete"
                            title="Delete all assignments"
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && editingUser && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Assignments - {editingUser.name}</h3>
              <button type="button" className="modal-close" onClick={() => setEditModalOpen(false)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="modal-body">
              {editingUser.areas.length === 0 ? (
                <div className="modal-empty">
                  <i className="fas fa-inbox" />
                  <p>No areas assigned</p>
                </div>
              ) : (
                <div className="modal-areas">
                  {editingUser.areas.map((area, idx) => (
                    <div key={idx} className="modal-area-item">
                      <span className="modal-area-name">
                        <i className="fas fa-map-marker-alt" />
                        {area}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteFromModal(area)}
                        className="modal-delete-btn"
                        title="Remove area"
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setEditModalOpen(false)} className="btn-modal-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaAssign;