import React, { useState } from "react";
import "./OrderReport.scss";

const OrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [areaSearchTerm, setAreaSearchTerm] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  // Placeholder areas for UI demonstration
  const uniqueAreas = ["North", "South", "East", "West"];
  
  const filteredAreas = areaSearchTerm.trim()
    ? uniqueAreas.filter(area => 
        area.toLowerCase().includes(areaSearchTerm.toLowerCase())
      )
    : uniqueAreas;

  const clearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedArea("");
    setAreaSearchTerm("");
    setStatusFilter("all");
    setPageSize(20);
    setPage(1);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setIsAreaDropdownOpen(false);
    setAreaSearchTerm("");
    setPage(1);
  };

  const handleAreaDropdownToggle = () => {
    if (isAreaDropdownOpen) {
      // If closing the dropdown, clear the search
      setAreaSearchTerm("");
    }
    setIsAreaDropdownOpen(!isAreaDropdownOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.or-area-dropdown-container')) {
        setIsAreaDropdownOpen(false);
        setAreaSearchTerm("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="or-page">
      <div className="or-card" role="main" aria-labelledby="or-page-title">
        <div className="or-card-inner">
          <header className="or-card-header">
            <div className="or-header-content">
              <div className="or-header-left">
                <h1 id="or-page-title" className="or-title">Order Report</h1>
                <p className="or-subtitle">Complete overview of all orders</p>
              </div>
            </div>
          </header>

          <div className="or-filter-row">
            <div className="or-filter-left">
              <div className="or-filter-item or-filter-search compact">
                <label htmlFor="or-search">Search</label>
                <div className="or-search-wrap">
                  <span className="or-search-icon">🔍</span>
                  <input
                    id="or-search"
                    type="search"
                    placeholder="Search by order no, customer, product or area..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="or-search-clear"
                      onClick={clearSearch}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="or-filter-item or-filter-area">
                <label htmlFor="area-select">Filter by Area</label>
                <div className="or-area-dropdown-container">
                  <button
                    type="button"
                    className="or-area-select-button"
                    onClick={handleAreaDropdownToggle}
                  >
                    <span className="or-area-selected">
                      {selectedArea || "All Areas"}
                    </span>
                    <span className="or-area-arrow">{isAreaDropdownOpen ? "▲" : "▼"}</span>
                  </button>
                  
                  {isAreaDropdownOpen && (
                    <div className="or-area-dropdown-menu">
                      <div className="or-area-search-container">
                        <span className="or-area-search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder="Search areas..."
                          value={areaSearchTerm}
                          onChange={(e) => setAreaSearchTerm(e.target.value)}
                          className="or-area-search-input"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div className="or-area-options">
                        <div
                          className={`or-area-option ${!selectedArea ? 'active' : ''}`}
                          onClick={() => handleAreaSelect("")}
                        >
                          All Areas
                          {!selectedArea && <span className="or-check">✓</span>}
                        </div>
                        
                        {filteredAreas.length > 0 ? (
                          filteredAreas.map(area => (
                            <div
                              key={area}
                              className={`or-area-option ${selectedArea === area ? 'active' : ''}`}
                              onClick={() => handleAreaSelect(area)}
                            >
                              {area}
                              {selectedArea === area && <span className="or-check">✓</span>}
                            </div>
                          ))
                        ) : (
                          <div className="or-area-no-results">
                            No areas found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="or-filter-item or-filter-status">
                <label>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="or-status-select"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {(searchTerm || selectedArea || statusFilter !== "all") && (
                <button
                  type="button"
                  className="or-clear-filters-btn"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="or-stats">
              <div className="or-rows-selector">
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

          <div className="or-table-wrap" role="region" aria-label="Orders table">
            <table className="or-orders-table" role="table" aria-describedby="or-desc">
              <caption id="or-desc" style={{ display: "none" }}>
                Columns: serial no, order no, date, customer, product, quantity, amount, status, area
              </caption>

              <thead>
                <tr>
                  <th scope="col" className="th-serial">No</th>
                  <th scope="col" className="th-order">Order No</th>
                  <th scope="col">Date</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Product</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Area</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="9" className="or-no-data">
                    No orders found. Connect your API to display data.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="or-pagination" role="navigation" aria-label="Pagination">
            <button className="or-page-btn" disabled>
              Prev
            </button>
            <div className="or-page-info">
              No records
            </div>
            <button className="or-page-btn" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReport;