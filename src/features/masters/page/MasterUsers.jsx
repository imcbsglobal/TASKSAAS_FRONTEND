import React, { useMemo, useState, useEffect } from "react";
import "./MasterUsers.scss";

const MasterUsers = () => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 20;
  const [page, setPage] = useState(1);

  // API function
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch('https://tasksas.com/api/users_api/list/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Based on your API structure: { success: true, users: [...] }
      if (result.users && Array.isArray(result.users)) {
        setData(result.users);
      } else if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
      }
      
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Search logic - searches by id, role, and client_id
  const filtered = useMemo(() => {
    if (!searchTerm) return data;
    const t = searchTerm.trim().toLowerCase();
    return data.filter(
      (d) =>
        (d.id || "").toLowerCase().includes(t) ||
        (d.role || "").toLowerCase().includes(t) ||
        (d.client_id || "").toLowerCase().includes(t)
    );
  }, [data, searchTerm]);

  // Sort filtered data alphabetically by name (id field)
  const sortedData = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const nameA = (a.id || "").toLowerCase();
      const nameB = (b.id || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [filtered]);

  const total = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (page > totalPages && totalPages > 0) setPage(totalPages);

  const pageItems = useMemo(() => {
    if (total === 0) return [];
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, total]);

  const changePage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    if (!role) return "role-default";
    const roleLower = role.toLowerCase();
    const roleMap = {
      admin: "role-admin",
      administrator: "role-admin",
      manager: "role-manager",
      supervisor: "role-manager",
      staff: "role-staff",
      viewer: "role-viewer",
      operator: "role-operator",
      "level 1": "role-viewer",
      "level 2": "role-staff",
      "level 3": "role-admin"
    };
    return roleMap[roleLower] || "role-default";
  };

  return (
    <div className="mu-page">
      <div className="mu-card" role="main">
        <div className="mu-card-inner">
          <header className="mu-card-header">
            <div>
              <h1 className="mu-title">Master Users</h1>
              <p className="mu-subtitle">Manage and view all users</p>
            </div>
            <button 
              className="mu-refresh-btn" 
              onClick={fetchUsers}
              disabled={loading}
            >
              🔄 {loading ? 'Loading...' : 'Refresh'}
            </button>
          </header>

          {/* Error message */}
          {error && (
            <div className="mu-error-banner">
              <span>⚠️</span>
              <span>{error}</span>
              <button onClick={fetchUsers} className="mu-retry-btn">
                Retry
              </button>
            </div>
          )}

          {/* Search */}
          <div className="mu-filter-row">
            <div className="mu-filter-item mu-filter-search compact">
              <label htmlFor="mu-search">Search</label>
              <div className="mu-search-wrap">
                <span className="mu-search-icon">🔍</span>
                <input
                  id="mu-search"
                  type="search"
                  placeholder="Search by client ID, name, or role..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  disabled={loading}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="mu-search-clear"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="mu-stats">
              <span className="mu-stat-badge">
                Total Users: <strong>{loading ? '...' : total}</strong>
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="mu-table-wrap">
            <table className="mu-users-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>client ID</th>
                  <th>Name</th>
                  <th>User Role</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="mu-loading">
                      <div className="mu-spinner"></div>
                      <span>Loading users...</span>
                    </td>
                  </tr>
                ) : total === 0 ? (
                  <tr>
                    <td colSpan="4" className="mu-no-data">
                      <div className="mu-no-data-content">
                        <span className="mu-no-data-icon">🔭</span>
                        <p>{searchTerm ? `No results for "${searchTerm}"` : 'No users found'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((row, i) => (
                    <tr key={i}>
                      <td className="mu-sno-cell">{(page - 1) * pageSize + i + 1}</td>
                      <td className="mu-userid-cell">
                        <span className="mu-userid-badge">{row.client_id || 'N/A'}</span>
                      </td>
                      <td className="mu-name-cell">
                        <span className="mu-user-name">{row.id || 'N/A'}</span>
                      </td>
                      <td className="mu-role-cell">
                        <span className={`mu-role-badge ${getRoleBadgeClass(row.role)}`}>
                          {row.role !== null ? row.role : 'null'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mu-pagination">
            <button
              className="mu-page-btn"
              onClick={() => changePage(page - 1)}
              disabled={page === 1 || total === 0 || loading}
            >
              ← Prev
            </button>
            <div className="mu-page-info">
              {loading ? "Loading..." : total === 0 ? "No records" : `Page ${page} of ${totalPages}`}
            </div>
            <button
              className="mu-page-btn"
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages || total === 0 || loading}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterUsers;