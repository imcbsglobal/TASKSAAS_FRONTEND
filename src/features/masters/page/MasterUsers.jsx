import React, { useMemo, useState, useEffect } from "react";
import "./MasterUsers.scss";

const MasterUsers = () => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const pageSize = 10;
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
      let users = [];
      if (result.users && Array.isArray(result.users)) {
        users = result.users;
      } else if (Array.isArray(result)) {
        users = result;
      }
      
      // Filter to only include Level 1 and Level 3 users (excluding null/undefined roles)
      const filteredUsers = users.filter(user => {
        if (!user.role) return false;
        const roleLower = user.role.toLowerCase().trim();
        return roleLower === 'level 1' || roleLower === 'level 3';
      });
      
      setData(filteredUsers);
      
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

  // Function to format role display
  const formatRole = (role) => {
    if (!role) return 'N/A';
    const roleLower = role.toLowerCase().trim();
    
    if (roleLower === 'level 3') return 'Administrator';
    if (roleLower === 'level 1') return 'User';
    
    // Return original role for other cases
    return role;
  };

  // Search and role filter logic
  const filtered = useMemo(() => {
    let result = data;

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((d) => {
        const roleLower = (d.role || "").toLowerCase().trim();
        return roleLower === roleFilter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const t = searchTerm.trim().toLowerCase();
      result = result.filter(
        (d) =>
          (d.id || "").toLowerCase().includes(t) ||
          (d.role || "").toLowerCase().includes(t) ||
          formatRole(d.role).toLowerCase().includes(t)
      );
    }

    return result;
  }, [data, searchTerm, roleFilter]);

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
    const roleLower = role.toLowerCase().trim();
    const roleMap = {
      "level 1": "role-viewer",
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
              <p className="mu-subtitle">Manage users</p>
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

          {/* Search and Filter Row */}
          <div className="mu-filter-row">
            <div className="mu-filter-item mu-filter-search compact">
              <label htmlFor="mu-search">Search</label>
              <div className="mu-search-wrap">
                <span className="mu-search-icon">🔍</span>
                <input
                  id="mu-search"
                  type="search"
                  placeholder="Search by name or role..."
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

            <div className="mu-filter-item mu-filter-role">
              <label htmlFor="mu-role-filter">Filter by Role</label>
              <div className="mu-select-wrap">
                <select
                  id="mu-role-filter"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  disabled={loading}
                  className="mu-role-select"
                >
                  <option value="all">All Roles</option>
                  <option value="level 1">Users</option>
                  <option value="level 3">Administrators</option>
                </select>
                <span className="mu-select-arrow">▼</span>
              </div>
            </div>

            <div className="mu-stats">
              <span className="mu-stat-badge">
                Total: <strong>{loading ? '...' : total}</strong>
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="mu-table-wrap">
            <table className="mu-users-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>User Role</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="mu-loading">
                      <div className="mu-spinner"></div>
                      <span>Loading users...</span>
                    </td>
                  </tr>
                ) : total === 0 ? (
                  <tr>
                    <td colSpan="3" className="mu-no-data">
                      <div className="mu-no-data-content">
                        <span className="mu-no-data-icon">🔭</span>
                        <p>
                          {searchTerm 
                            ? `No results for "${searchTerm}"` 
                            : roleFilter === "all" 
                              ? 'No Level 1 or Level 3 users found' 
                              : `No ${formatRole(roleFilter)}s found`
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((row, i) => (
                    <tr key={i}>
                      <td className="mu-sno-cell">{(page - 1) * pageSize + i + 1}</td>
                      <td className="mu-name-cell">
                        <span className="mu-user-name">{row.id || 'N/A'}</span>
                      </td>
                      <td className="mu-role-cell">
                        <span className={`mu-role-badge ${getRoleBadgeClass(row.role)}`}>
                          {formatRole(row.role)}
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