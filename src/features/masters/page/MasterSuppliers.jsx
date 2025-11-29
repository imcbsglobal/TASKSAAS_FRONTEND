import React, { useMemo, useState, useEffect } from "react";
import "./MasterSuppliers.scss";

const MasterSuppliers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract fetchSuppliers as a separate function
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch("https://tasksas.com/api/debtors/get-debtors/", {
        method: 'GET',
        headers: headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        // Filter only records where super_code is 'SUNCR' (sundry creditors/suppliers)
        const suppliersData = result.data.filter(item => 
          item.super_code === 'SUNCR'
        );
        setData(suppliersData);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [areaSearchTerm, setAreaSearchTerm] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  // Get unique areas from data
  const uniqueAreas = useMemo(() => {
    const areas = data
      .map(d => d.area)
      .filter(area => area && area.trim() !== "");
    return [...new Set(areas)].sort();
  }, [data]);

  // Filter areas based on search term
  const filteredAreas = useMemo(() => {
    if (!areaSearchTerm.trim()) return uniqueAreas;
    const search = areaSearchTerm.toLowerCase();
    return uniqueAreas.filter(area => 
      area.toLowerCase().includes(search)
    );
  }, [uniqueAreas, areaSearchTerm]);

  const filtered = useMemo(() => {
    let result = data;
    
    // Apply search filter
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
    
    // Apply area filter
    if (selectedArea) {
      result = result.filter(d => d.area === selectedArea);
    }
    
    // Sort alphabetically by name
    return result.sort((a, b) => {
      const nameA = (a.name || "").toString().toLowerCase();
      const nameB = (b.name || "").toString().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [data, searchTerm, selectedArea]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (page > totalPages && totalPages > 0) setPage(totalPages);

  const pageItems = useMemo(() => {
    if (total === 0) return [];
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, total]);

  const changePage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedArea("");
    setAreaSearchTerm("");
    setPage(1);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setIsAreaDropdownOpen(false);
    setAreaSearchTerm("");
    setPage(1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.ms-area-dropdown-container')) {
        setIsAreaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="ms-page">
      <div className="ms-card" role="main" aria-labelledby="ms-page-title">
        <div className="ms-card-inner">
          <header className="ms-card-header">
            <div className="ms-header-content">
              <div className="ms-header-left">
                <h1 id="ms-page-title" className="ms-title">Suppliers Master</h1>
                <p className="ms-subtitle">Complete overview of supplier accounts</p>
              </div>
              <button 
                className="ms-refresh-btn" 
                onClick={() => {
                  setLoading(true);
                  fetchSuppliers();
                }}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </header>

          {loading && (
            <div className="ms-loading" style={{ padding: "2rem", textAlign: "center" }}>
              Loading suppliers data...
            </div>
          )}
          
          {error && (
            <div className="ms-error" style={{ padding: "1rem", color: "#d32f2f", background: "#ffebee", borderRadius: "4px", margin: "1rem 0" }}>
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="ms-filter-row">
                <div className="ms-filter-left">
                  <div className="ms-filter-item ms-filter-search compact">
                    <label htmlFor="ms-search">Search</label>
                    <div className="ms-search-wrap">
                      <span className="ms-search-icon">🔍</span>
                      <input
                        id="ms-search"
                        type="search"
                        placeholder="Search by code, name, place, phone or area..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPage(1);
                        }}
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          className="ms-search-clear"
                          onClick={clearSearch}
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="ms-filter-item ms-filter-area">
                    <label htmlFor="area-select">Filter by Area</label>
                    <div className="ms-area-dropdown-container">
                      <button
                        type="button"
                        className="ms-area-select-button"
                        onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                      >
                        <span className="ms-area-selected">
                          {selectedArea || "All Areas"}
                        </span>
                        <span className="ms-area-arrow">{isAreaDropdownOpen ? "▲" : "▼"}</span>
                      </button>
                      
                      {isAreaDropdownOpen && (
                        <div className="ms-area-dropdown-menu">
                          <div className="ms-area-search-container">
                            <span className="ms-area-search-icon">🔍</span>
                            <input
                              type="text"
                              placeholder="Search areas..."
                              value={areaSearchTerm}
                              onChange={(e) => setAreaSearchTerm(e.target.value)}
                              className="ms-area-search-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          
                          <div className="ms-area-options">
                            <div
                              className={`ms-area-option ${!selectedArea ? 'active' : ''}`}
                              onClick={() => handleAreaSelect("")}
                            >
                              All Areas
                              {!selectedArea && <span className="ms-check">✓</span>}
                            </div>
                            
                            {filteredAreas.length > 0 ? (
                              filteredAreas.map(area => (
                                <div
                                  key={area}
                                  className={`ms-area-option ${selectedArea === area ? 'active' : ''}`}
                                  onClick={() => handleAreaSelect(area)}
                                >
                                  {area}
                                  {selectedArea === area && <span className="ms-check">✓</span>}
                                </div>
                              ))
                            ) : (
                              <div className="ms-area-no-results">
                                No areas found
                              </div>
                            )}
                          </div>
                          
                          {uniqueAreas.length > 10 && (
                            <div className="ms-area-count">
                              Showing {filteredAreas.length} of {uniqueAreas.length} areas
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {(searchTerm || selectedArea) && (
                    <button
                      type="button"
                      className="ms-clear-filters-btn"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>

                <div className="ms-stats">
                  <div className="ms-rows-selector">
                    <label htmlFor="rows-select">Rows:</label>
                    <select
                      id="rows-select"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="ms-table-wrap" role="region" aria-label="Suppliers table">
                <table className="ms-suppliers-table" role="table" aria-describedby="ms-desc">
                  <caption id="ms-desc" style={{ display: "none" }}>
                    Columns: serialno, code, name, place, phone, area, balance
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col" className="th-serial">No</th>
                      <th scope="col" className="th-name">Code</th>
                      <th scope="col">Name</th>
                      <th scope="col">Place</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Area</th>
                      <th scope="col">Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {total === 0 ? (
                      <tr>
                        <td colSpan="7" className="ms-no-data">No suppliers found</td>
                      </tr>
                    ) : (
                      pageItems.map((row, i) => (
                        <tr key={row.code ?? `${(page-1)*pageSize + i}`}>
                          <td data-label="serialno">{(page - 1) * pageSize + i + 1}</td>
                          <td data-label="code">{row.code}</td>
                          <td data-label="name">{row.name}</td>
                          <td data-label="place">{row.place || "-"}</td>
                          <td data-label="phone">{row.phone || "-"}</td>
                          <td data-label="area">{row.area || "-"}</td>
                          <td data-label="balance">₹{row.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="ms-pagination" role="navigation" aria-label="Pagination">
                <button className="ms-page-btn" onClick={() => changePage(page - 1)} disabled={page === 1 || total === 0}>
                  Prev
                </button>
                <div className="ms-page-info">
                  {total === 0 ? "No records" : `Page ${page} of ${totalPages}`}
                </div>
                <button className="ms-page-btn" onClick={() => changePage(page + 1)} disabled={page === totalPages || total === 0}>
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterSuppliers;