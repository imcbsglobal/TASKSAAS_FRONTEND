import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { SettingsApi } from '../../settings/services/settingService';
import { PunchAPI } from '../services/punchService';
import './AreaAssign.scss';

const AreaAssign = () => {
  const navigate = useNavigate();

  // Step + data state
  const [step, setStep] = useState(1); // 1 = pick user, 2 = assign areas
  const [users, setUsers] = useState([]); // will contain only Level 1 users (deduped)
  const [areas, setAreas] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAreas, setSelectedAreas] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [searchArea, setSearchArea] = useState('');

  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isDropdownOpen]);

  // Helper: detect "Level 1" stored in user.role or numeric user.level
  const isLevelOne = (user) => {
    if (!user) return false;
    // numeric level field
    if (user.level !== undefined && user.level !== null) {
      const n = Number(user.level);
      if (!isNaN(n) && n === 1) return true;
    }
    // string role like "Level 1", "level1", "1"
    const roleStr = (user.role ?? '').toString().trim().toLowerCase();
    if (!roleStr) return false;
    if (roleStr === '1') return true;
    if (/level[\s-]*1/.test(roleStr)) return true;
    return false;
  };

  // Fetch users, filter to Level 1, dedupe by id
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await SettingsApi.getUsers();
      const raw = Array.isArray(response?.users) ? response.users : Array.isArray(response) ? response : [];

      // Keep only level 1
      const level1 = raw.filter(u => isLevelOne(u));

      // Dedupe by id (first occurrence kept)
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
    } catch (err) {
      console.error('fetchUsers', err);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch areas
  const fetchAreas = async () => {
    try {
      setLoading(true);
      const res = await PunchAPI.getAreas();
      const list = (res?.areas || [])
        .filter(a => a != null)
        .map(a => ({ id: a, name: a }));
      setAreas(list);
    } catch (err) {
      console.error('fetchAreas', err);
      toast.error('Failed to fetch areas');
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user assigned areas
  const fetchUserAreas = async (userId) => {
    try {
      setLoading(true);
      const res = await PunchAPI.getUserAreas(userId);
      setSelectedAreas(res?.areas || []);
    } catch (err) {
      console.error('fetchUserAreas', err);
      setSelectedAreas([]);
    } finally {
      setLoading(false);
    }
  };

  // Select user -> goto step 2
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setIsDropdownOpen(false);
    setDropdownSearch('');
    setStep(2);
    await fetchAreas();
    await fetchUserAreas(user.id);
  };

  const handleBackToUsers = () => {
    setStep(1);
    setSelectedUser(null);
    setSelectedAreas([]);
    setSearchArea('');
  };

  // Area toggles
  const handleAreaToggle = (id) => {
    setSelectedAreas(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };
  const handleSelectAll = () => setSelectedAreas(filteredAreas.map(a => a.id));
  const handleDeselectAll = () => setSelectedAreas([]);

  // Save assignments
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
      toast.success('Assignments saved');
      handleBackToUsers();
    } catch (err) {
      console.error('save', err);
      toast.error('Failed to save assignments');
    } finally {
      setSaving(false);
    }
  };

  // Filter users for dropdown: search by id / accountcode / client_id
  const filteredDropdownUsers = useMemo(() => {
    const q = (dropdownSearch ?? '').toString().trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => {
      const candidates = [
        u.id?.toString(),
        u.accountcode?.toString(),
        u.client_id?.toString()
      ].filter(Boolean);
      return candidates.some(s => s.toLowerCase().includes(q));
    });
  }, [users, dropdownSearch]);

  // Filter areas
  const filteredAreas = useMemo(() => {
    const q = (searchArea ?? '').toString().trim().toLowerCase();
    if (!q) return areas;
    return areas.filter(a => (a.name ?? '').toLowerCase().includes(q) || (a.id ?? '').toString().toLowerCase().includes(q));
  }, [areas, searchArea]);

  // Stats
  const stats = {
    totalUsers: users.length,
    totalAreas: areas.length,
    selectedAreas: selectedAreas.length,
    assignmentProgress: areas.length ? Math.round((selectedAreas.length / areas.length) * 100) : 0
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
                  <i className="fas fa-map-marked-alt" />
                  Area Assignment
                </h1>
                <p className="area-assign__subtitle">
                  {step === 1 ? 'Step 1: Select a user' : `Step 2: Assign areas to ${selectedUser?.id}`}
                </p>
              </div>
            </div>
          </div>

          <div className="step-indicator">
            <div className={`step-indicator__item ${step >= 1 ? 'step-indicator__item--active' : ''}`}>
              <div className="step-indicator__circle">{step > 1 ? <i className="fas fa-check" /> : '1'}</div>
              <span className="step-indicator__label">Select User</span>
            </div>
            <div className="step-indicator__line" />
            <div className={`step-indicator__item ${step >= 2 ? 'step-indicator__item--active' : ''}`}>
              <div className="step-indicator__circle">2</div>
              <span className="step-indicator__label">Assign Areas</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="area-assign__content">
          {/* STEP 1 - user selection */}
          {step === 1 && (
            <div className="area-assign__step area-assign__step--users">
              <div className="step-panel">
                <div className="panel-header">
                  <h2 className="panel-header__title">
                    <i className="fas fa-users" />
                    Select User to Assign Areas
                  </h2>
                  <p className="panel-header__subtitle">Choose a Level 1 user from the dropdown to start assigning areas</p>
                </div>

                <div className="panel-content">
                  <div className="user-selection-container" style={{ alignItems: 'flex-start', gap: 18 }}>
                    <div className="user-dropdown-wrapper" style={{ width: '100%', maxWidth: 700 }}>
                      <label className="user-dropdown-label">
                        <i className="fas fa-user" />
                        Select User
                      </label>

                      <div className={`user-dropdown ${isDropdownOpen ? 'user-dropdown--open' : ''}`} ref={dropdownRef} style={{ position: 'relative' }}>
                        <div className="user-dropdown__trigger">
                          <div className="user-dropdown__input-wrapper">
                            <i className="fas fa-search user-dropdown__search-icon" />
                            <input
                              type="text"
                              placeholder="Type to search users..."
                              value={dropdownSearch}
                              onChange={(e) => {
                                setDropdownSearch(e.target.value);
                                if (!isDropdownOpen) setIsDropdownOpen(true);
                                if (listRef.current) listRef.current.scrollTop = 0;
                              }}
                              onFocus={() => setIsDropdownOpen(true)}
                              className="user-dropdown__input"
                              style={{ padding: '10px 6px', fontSize: 15 }}
                            />
                            <i
                              className={`fas fa-chevron-down user-dropdown__arrow ${isDropdownOpen ? 'user-dropdown__arrow--up' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsDropdownOpen(!isDropdownOpen);
                              }}
                            />
                          </div>
                        </div>

                        {isDropdownOpen && (
                          <div className="user-dropdown__menu" style={{ maxHeight: 360 }}>
                            {loading ? (
                              <div className="user-dropdown__loading"><div className="spinner-small" /> <span>Loading users...</span></div>
                            ) : filteredDropdownUsers.length === 0 ? (
                              <div className="user-dropdown__empty"><i className="fas fa-user-slash" /> <span>{dropdownSearch ? 'No users found' : 'No users available'}</span></div>
                            ) : (
                              <div className="user-dropdown__options" ref={listRef} style={{ overflowY: 'auto', maxHeight: 340 }}>
                                {/* SIMPLE: show only the user's id (name). No avatar, no secondary text. */}
                                {filteredDropdownUsers.map((user) => (
                                  <div
                                    key={user.id ?? Math.random()}
                                    className="user-dropdown__option"
                                    onClick={() => handleUserSelect(user)}
                                    style={{
                                      padding: '12px 16px',
                                      fontSize: 15,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      borderBottom: '1px solid rgba(0,0,0,0.04)'
                                    }}
                                  >
                                    {user.id}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Instructions (kept minimal) */}
                    <div className="selection-instructions" style={{ minWidth: 220 }}>
                      <div className="instruction-card">
                        <div className="instruction-card__icon"><i className="fas fa-info-circle" /></div>
                        <div className="instruction-card__content">
                          <h3>How to select a user:</h3>
                          <ul>
                            <li>Only Level 1 users are listed.</li>
                            <li>Type a name to filter the list.</li>
                            <li>Click a name to assign areas.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 - area assignment */}
          {step === 2 && (
            <div className="area-assign__step area-assign__step--areas">
              <div className="step-panel">
                <div className="panel-header">
                  <div className="panel-header__left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn--icon" onClick={handleBackToUsers} title="Back to user selection"><i className="fas fa-arrow-left" /></button>
                    <div>
                      <h2 className="panel-header__title"><i className="fas fa-map-pin" /> Assign Areas to {selectedUser?.id}</h2>
                      <p className="panel-header__subtitle">Select areas that this user can access for punch-in</p>
                    </div>
                  </div>
                </div>

                <div className="panel-toolbar">
                  <div className="panel-toolbar__search"><i className="fas fa-search" /><input className="search-input" value={searchArea} onChange={e => setSearchArea(e.target.value)} placeholder="Search areas by name..." /></div>
                  <div className="panel-toolbar__actions">
                    <button className="btn btn--secondary btn--sm" onClick={handleSelectAll} disabled={filteredAreas.length === 0}><i className="fas fa-check-double" /> Select All</button>
                    <button className="btn btn--secondary btn--sm" onClick={handleDeselectAll} disabled={selectedAreas.length === 0}><i className="fas fa-times" /> Clear All</button>
                  </div>
                </div>

                {selectedAreas.length > 0 && (
                  <div className="progress-bar">
                    <div className="progress-bar__track"><div className="progress-bar__fill" style={{ width: `${stats.assignmentProgress}%` }} /></div>
                    <span className="progress-bar__label">{stats.selectedAreas} of {stats.totalAreas} areas selected ({stats.assignmentProgress}%)</span>
                  </div>
                )}

                <div className="panel-content">
                  {loading ? (
                    <div className="loading-state"><div className="spinner" /><p>Loading areas...</p></div>
                  ) : filteredAreas.length === 0 ? (
                    <div className="empty-state"><i className="fas fa-map-marker-slash" /><p>No areas found</p></div>
                  ) : (
                    <div className="area-list">
                      {filteredAreas.map(area => (
                        <div key={area.id} className={`area-card ${selectedAreas.includes(area.id) ? 'area-card--selected' : ''}`} onClick={() => handleAreaToggle(area.id)}>
                          <div className="area-card__checkbox">
                            <input type="checkbox" checked={selectedAreas.includes(area.id)} onChange={() => {}} onClick={(e) => e.stopPropagation()} />
                            <span className="checkbox-custom" />
                          </div>

                          <div className="area-card__content">
                            <h3 className="area-card__name"><i className="fas fa-map-marker-alt" />{area.name}</h3>
                            <p className="area-card__code"><i className="fas fa-code" /> Code: {area.id}</p>
                          </div>

                          {selectedAreas.includes(area.id) && <div className="area-card__badge"><i className="fas fa-check" /></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        {step === 2 && (
          <div className="area-assign__footer">
            <div className="area-assign__footer-content">
              <div className="footer-info">
                <p className="footer-info__text"><strong>{selectedAreas.length}</strong> area(s) selected for <strong>{selectedUser?.id}</strong></p>
                {selectedAreas.length > 0 && <p className="footer-info__hint"><i className="fas fa-info-circle" /> Click "Save Assignments" to apply changes</p>}
              </div>
              <div className="footer-actions">
                <button className="btn btn--secondary" onClick={handleBackToUsers} disabled={saving}><i className="fas fa-arrow-left" /> Back</button>
                <button className="btn btn--primary" onClick={handleSaveAssignments} disabled={saving || selectedAreas.length === 0}>
                  {saving ? <><div className="btn-spinner" /> Saving...</> : <><i className="fas fa-save" /> Save Assignments ({selectedAreas.length})</>}
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
