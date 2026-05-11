import React, { useMemo, useState, useEffect, useRef } from "react";
import "./masterDebtors.scss";

const MasterDebtors = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDebtors = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch("https://tasksas.com/api/debtors/get-debtors/", {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized - Please login again');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const debtoData = result.data.filter(item => item.super_code === 'DEBTO');
        setData(debtoData);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching debtors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDebtors(); }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("greater_than_1");
  const [areaSearchTerm, setAreaSearchTerm] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [goToPage, setGoToPage] = useState("");
  const goToRef = useRef(null);

  const uniqueAreas = useMemo(() => {
    const areas = data.map(d => d.area).filter(a => a && a.trim() !== "");
    return [...new Set(areas)].sort();
  }, [data]);

  const filteredAreas = useMemo(() => {
    if (!areaSearchTerm.trim()) return uniqueAreas;
    const search = areaSearchTerm.toLowerCase();
    return uniqueAreas.filter(a => a.toLowerCase().includes(search));
  }, [uniqueAreas, areaSearchTerm]);

  const filtered = useMemo(() => {
    let result = data;
    if (searchTerm) {
      const t = searchTerm.trim().toLowerCase();
      result = result.filter(d =>
        (d.code || "").toString().toLowerCase().includes(t) ||
        (d.name || "").toString().toLowerCase().includes(t) ||
        (d.place || "").toString().toLowerCase().includes(t) ||
        (d.phone || "").toString().toLowerCase().includes(t) ||
        (d.area || "").toString().toLowerCase().includes(t)
      );
    }
    if (selectedArea) result = result.filter(d => d.area === selectedArea);
    if (balanceFilter === "greater_than_1") result = result.filter(d => (d.balance || 0) > 1);
    return result.sort((a, b) =>
      (a.name || "").toString().toLowerCase().localeCompare((b.name || "").toString().toLowerCase())
    );
  }, [data, searchTerm, selectedArea, balanceFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages && totalPages > 0) setPage(totalPages);

  const pageItems = useMemo(() => {
    if (total === 0) return [];
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, total]);

  const changePage = (p) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    setPage(clamped);
  };

  const clearSearch = () => { setSearchTerm(""); setPage(1); };
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedArea("");
    setBalanceFilter("all");
    setAreaSearchTerm("");
    setPage(1);
  };
  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setIsAreaDropdownOpen(false);
    setAreaSearchTerm("");
    setPage(1);
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const num = parseInt(goToPage, 10);
    if (!isNaN(num)) { changePage(num); setGoToPage(""); }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.mdb-area-dropdown-container')) setIsAreaDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build visible page number buttons
  const pageButtons = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, page]);
    for (let i = page - 1; i <= page + 1; i++) if (i > 0 && i <= totalPages) pages.add(i);
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    let prev = null;
    for (const p of sorted) {
      if (prev !== null && p - prev > 1) result.push('...');
      result.push(p);
      prev = p;
    }
    return result;
  }, [page, totalPages]);

  const hasActiveFilters = searchTerm || selectedArea;

  return (
    <div className="mdb-page">
      <div className="mdb-outer">
        <div className="mdb-card">

          {/* ── Page Header ── */}
          <div className="mdb-page-header">
            <div className="mdb-page-identity">
              <h1 className="mdb-title">Customer Statement</h1>
              <p className="mdb-subtitle">Manage and view all customers</p>
            </div>
            <div className="mdb-header-actions">
              <button
                className="mdb-refresh-btn"
                onClick={() => { setLoading(true); fetchDebtors(); }}
                disabled={loading}
              >
                <span className="mdb-refresh-icon">↺</span>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="mdb-loading">
              <span className="mdb-spinner" />
              Loading customers…
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="mdb-error">
              ⚠ {error}
              <button
                onClick={fetchDebtors}
                style={{ marginLeft: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Main Content ── */}
          {!loading && !error && (
            <>
              {/* ── Toolbar / Filters ── */}
              <div className="mdb-toolbar">
                <div className="mdb-toolbar-filters">
                  <div className="mdb-filters-left">

                    {/* Search */}
                    <div className="mdb-filter-item">
                      <label htmlFor="mdb-search">Search</label>
                      <div className="mdb-search-wrap">
                        <span className="mdb-search-icon">🔍</span>
                        <input
                          id="mdb-search"
                          type="search"
                          placeholder="Search name, code, place, phone…"
                          value={searchTerm}
                          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                        {searchTerm && (
                          <button type="button" className="mdb-search-clear" onClick={clearSearch} aria-label="Clear search">
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Area dropdown */}
                    <div className="mdb-filter-item mdb-filter-area">
                      <label>Area</label>
                      <div className="mdb-area-dropdown-container">
                        <button
                          type="button"
                          className="mdb-area-select-button"
                          onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                        >
                          <span className="mdb-area-selected">{selectedArea || "All Areas"}</span>
                          <span className="mdb-area-arrow">{isAreaDropdownOpen ? "▲" : "▼"}</span>
                        </button>

                        {isAreaDropdownOpen && (
                          <div className="mdb-area-dropdown-menu">
                            <div className="mdb-area-search-container">
                              <span className="mdb-area-search-icon">⌕</span>
                              <input
                                type="text"
                                placeholder="Search areas…"
                                value={areaSearchTerm}
                                onChange={(e) => setAreaSearchTerm(e.target.value)}
                                className="mdb-area-search-input"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="mdb-area-options">
                              <div
                                className={`mdb-area-option ${!selectedArea ? 'active' : ''}`}
                                onClick={() => handleAreaSelect("")}
                              >
                                All Areas
                                {!selectedArea && <span className="mdb-check">✓</span>}
                              </div>
                              {filteredAreas.length > 0 ? (
                                filteredAreas.map(area => (
                                  <div
                                    key={area}
                                    className={`mdb-area-option ${selectedArea === area ? 'active' : ''}`}
                                    onClick={() => handleAreaSelect(area)}
                                  >
                                    {area}
                                    {selectedArea === area && <span className="mdb-check">✓</span>}
                                  </div>
                                ))
                              ) : (
                                <div className="mdb-area-no-results">No areas found</div>
                              )}
                            </div>
                            {uniqueAreas.length > 10 && (
                              <div className="mdb-area-count">
                                Showing {filteredAreas.length} of {uniqueAreas.length} areas
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Balance filter */}
                    <div className="mdb-filter-item">
                      <label htmlFor="mdb-balance">Balance</label>
                      <select
                        id="mdb-balance"
                        className="mdb-balance-select"
                        value={balanceFilter}
                        onChange={(e) => { setBalanceFilter(e.target.value); setPage(1); }}
                      >
                        <option value="all">All Customers</option>
                        <option value="greater_than_1">Balance Only</option>
                      </select>
                    </div>

                    {/* Active filter chips */}
                    {searchTerm && (
                      <span className="mdb-chip">
                        "{searchTerm.length > 12 ? searchTerm.slice(0, 12) + "…" : searchTerm}"
                        <button onClick={clearSearch}>✕</button>
                      </span>
                    )}
                    {selectedArea && (
                      <span className="mdb-chip">
                        {selectedArea}
                        <button onClick={() => { setSelectedArea(""); setPage(1); }}>✕</button>
                      </span>
                    )}
                  </div>

                  {/* Rows per page (right side) */}
                  <div className="mdb-toolbar-right">
                    <div className="mdb-filter-item">
                      <label htmlFor="mdb-rows">Rows per page</label>
                      <select
                        id="mdb-rows"
                        className="mdb-rows-select"
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear All Filters */}
                  {hasActiveFilters && (
                    <button type="button" className="mdb-clear-btn" onClick={clearFilters}>
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>

              {/* ── Content ── */}
              <div className="mdb-content">
                <div className="mdb-results-bar">
                  <span className="mdb-results-count">
                    Showing <strong>{pageItems.length}</strong> of <strong>{total}</strong> customers
                  </span>
                </div>

                <div className="mdb-table-wrap" role="region" aria-label="Debtors table">
                  <table className="mdb-table" role="table">
                    <thead>
                      <tr>
                        <th scope="col" className="col-no">#</th>
                        <th scope="col">Code</th>
                        <th scope="col">Name</th>
                        <th scope="col">Place</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Area</th>
                        <th scope="col" className="col-balance">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {total === 0 ? (
                        <tr>
                          <td colSpan="7" className="mdb-no-data">
                            <span className="mdb-empty-icon">◎</span>
                            <span>No customers found</span>
                          </td>
                        </tr>
                      ) : (
                        pageItems.map((row, i) => {
                          const rowNum = (page - 1) * pageSize + i + 1;
                          return (
                            <tr key={row.code ?? rowNum}>
                              <td className="col-no">
                                <span className="mdb-row-num">{rowNum}</span>
                              </td>
                              <td className="col-code">{row.code}</td>
                              <td className="col-name">{row.name}</td>
                              <td>{row.place || "—"}</td>
                              <td>{row.phone || "—"}</td>
                              <td>
                                {row.area
                                  ? <span className="mdb-area-badge">{row.area}</span>
                                  : "—"}
                              </td>
                              <td className="col-balance">
                                {row.balance?.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination ── */}
                <div className="mdb-pagination">
                  <div className="mdb-page-nav">
                    <button
                      className="mdb-page-btn mdb-page-edge"
                      onClick={() => changePage(1)}
                      disabled={page === 1 || total === 0}
                      title="First page"
                    >«</button>
                    <button
                      className="mdb-page-btn"
                      onClick={() => changePage(page - 1)}
                      disabled={page === 1 || total === 0}
                    >‹</button>

                    {pageButtons.map((btn, idx) =>
                      btn === '...'
                        ? <span key={`ellipsis-${idx}`} className="mdb-page-ellipsis">…</span>
                        : <button
                            key={btn}
                            className={`mdb-page-btn mdb-page-num ${page === btn ? 'active' : ''}`}
                            onClick={() => changePage(btn)}
                          >{btn}</button>
                    )}

                    <button
                      className="mdb-page-btn"
                      onClick={() => changePage(page + 1)}
                      disabled={page === totalPages || total === 0}
                    >›</button>
                    <button
                      className="mdb-page-btn mdb-page-edge"
                      onClick={() => changePage(totalPages)}
                      disabled={page === totalPages || total === 0}
                      title="Last page"
                    >»</button>
                  </div>

                  <form className="mdb-goto" onSubmit={handleGoToPage}>
                    <label className="mdb-goto-label">Go to</label>
                    <input
                      ref={goToRef}
                      type="number"
                      min="1"
                      max={totalPages}
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      placeholder={page}
                      className="mdb-goto-input"
                    />
                    <button type="submit" className="mdb-goto-btn">→</button>
                  </form>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default MasterDebtors;