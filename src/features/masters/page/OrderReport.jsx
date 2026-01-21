import React, { useState, useEffect } from "react";
import "./OrderReport.scss";

const OrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  
  // API states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [uniqueAreas, setUniqueAreas] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("https://tasksas.com/api/item-orders/list-all", {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
        setTotalOrders(data.total_orders || 0);
        
        const areas = [...new Set(
          data.orders
            .map(order => order.area)
            .filter(area => area && area.trim() !== "")
        )].sort();
        setUniqueAreas(areas);
        
        const statuses = [...new Set(
          data.orders
            .map(order => order.status)
            .filter(status => status && status.trim() !== "")
        )].sort();
        setUniqueStatuses(statuses);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_id?.toLowerCase().includes(search) ||
        order.customer_name?.toLowerCase().includes(search) ||
        order.customer_code?.toLowerCase().includes(search) ||
        order.area?.toLowerCase().includes(search) ||
        order.username?.toLowerCase().includes(search) ||
        order.remark?.toLowerCase().includes(search) ||
        order.status?.toLowerCase().includes(search) ||
        order.items?.some(item => 
          item.product_name?.toLowerCase().includes(search)
        )
      );
    }

    if (selectedArea) {
      filtered = filtered.filter(order => order.area === selectedArea);
    }
    
    if (selectedStatus) {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    if (startDate) {
      filtered = filtered.filter(order => {
        if (!order.created_date) return false;
        const orderDate = new Date(order.created_date);
        const start = new Date(startDate);
        return orderDate >= start;
      });
    }
    
    if (endDate) {
      filtered = filtered.filter(order => {
        if (!order.created_date) return false;
        const orderDate = new Date(order.created_date);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return orderDate <= end;
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const totalFiltered = filteredOrders.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalFiltered / pageSize);

  const clearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedArea("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    setPageSize(10);
    setPage(1);
  };

  const openDetailsModal = (order) => {
    setSelectedOrderDetails(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrderDetails(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'or-status-badge';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed')) return 'or-status-badge or-status-completed';
    if (statusLower.includes('uploaded')) return 'or-status-badge or-status-uploaded';
    if (statusLower.includes('pending')) return 'or-status-badge or-status-pending';
    return 'or-status-badge';
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);
  
  const hasActiveFilters = searchTerm || selectedArea || selectedStatus || startDate || endDate;

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
              <button 
                className="or-refresh-btn"
                onClick={fetchOrders}
                disabled={loading}
              >
                🔄 {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </header>

          {loading && (
            <div className="or-loading-message" style={{ padding: "2rem", textAlign: "center" }}>
              Loading orders...
            </div>
          )}

          {error && (
            <div className="or-error-message" style={{ 
              padding: "1rem", 
              color: "#d32f2f", 
              background: "#ffebee", 
              borderRadius: "4px", 
              margin: "1rem 0" 
            }}>
              Error: {error}
              <button 
                onClick={fetchOrders} 
                style={{ 
                  marginLeft: "1rem", 
                  padding: "0.5rem 1rem", 
                  cursor: "pointer" 
                }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="or-filter-container">
                <div className="or-filter-row">
                  <div className="or-filter-left">
                    <div className="or-filter-item or-filter-search compact">
                      <label htmlFor="or-search">Search</label>
                      <div className="or-search-wrap">
                        <span className="or-search-icon">🔍</span>
                        <input
                          id="or-search"
                          type="search"
                          placeholder="Search orders..."
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

                    {/* Start Date Filter */}
                    <div className="or-filter-item or-filter-date">
                      <label htmlFor="start-date">Start Date</label>
                      <input
                        id="start-date"
                        type="date"
                        className="or-date-input"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>

                    {/* End Date Filter */}
                    <div className="or-filter-item or-filter-date">
                      <label htmlFor="end-date">End Date</label>
                      <input
                        id="end-date"
                        type="date"
                        className="or-date-input"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="or-filter-item or-filter-status">
                      <label htmlFor="status-select">Status</label>
                      <select
                        id="status-select"
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setPage(1);
                        }}
                        className="or-select-input"
                      >
                        <option value="">All Statuses</option>
                        {uniqueStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* Area Filter */}
                    <div className="or-filter-item or-filter-area">
                      <label htmlFor="area-select">Area</label>
                      <select
                        id="area-select"
                        value={selectedArea}
                        onChange={(e) => {
                          setSelectedArea(e.target.value);
                          setPage(1);
                        }}
                        className="or-select-input"
                      >
                        <option value="">All Areas</option>
                        {uniqueAreas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rows per page */}
                    <div className="or-filter-item">
                      <label htmlFor="rows-select">Rows per page</label>
                      <div className="or-rows-selector-inline">
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

                  {/* Show clear button if any filter is active */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="or-clear-filters-btn"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="or-table-wrap" role="region" aria-label="Orders table">
                <table className="or-orders-table" role="table" aria-describedby="or-desc">
                  <caption id="or-desc" style={{ display: "none" }}>
                    Columns: serial no, order no with view button, date & time, customer code, customer name, username, area, payment type, status, remark
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col" className="th-serial">No</th>
                      <th scope="col" className="th-order">Order No</th>
                      <th scope="col">Date & Time</th>
                      <th scope="col">Customer Code</th>
                      <th scope="col">Customer Name</th>
                      <th scope="col">Username</th>
                      <th scope="col">Area</th>
                      <th scope="col">Payment Type</th>
                      <th scope="col">Status</th>
                      <th scope="col">Remark</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedOrders.length > 0 ? (
                      paginatedOrders.map((order, index) => (
                        <tr key={order.order_id}>
                          <td>{startIndex + index + 1}</td>
                          <td className="or-order-no">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                              <span>{order.order_id}</span>
                              <button 
                                className="or-details-btn"
                                onClick={() => openDetailsModal(order)}
                                aria-label="View details"
                                style={{ 
                                  padding: '4px 10px',
                                  fontSize: '0.85em',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span className="or-details-icon">👁️</span>
                                View
                              </button>
                            </div>
                          </td>
                          <td>
                            {formatDate(order.created_date)}
                            {order.created_time && (
                              <>
                                <br />
                                <span style={{ fontSize: '0.9em', color: '#64748b' }}>
                                  {order.created_time}
                                </span>
                              </>
                            )}
                          </td>
                          <td className="or-customer-code">{order.customer_code || "-"}</td>
                          <td className="or-customer-name">{order.customer_name}</td>
                          <td className="or-username">{order.username || "-"}</td>
                          <td className="or-area">{order.area || "-"}</td>
                          <td>{order.payment_type || "-"}</td>
                          <td>
                            {order.status ? (
                              <span className={getStatusBadgeClass(order.status)}>
                                {order.status}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="or-remark">{order.remark || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="or-no-data">
                          {hasActiveFilters
                            ? "No orders found matching your filters."
                            : "No orders available."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="or-pagination" role="navigation" aria-label="Pagination">
                <button 
                  className="or-page-btn" 
                  disabled={page === 1 || loading}
                  onClick={() => setPage(page - 1)}
                >
                  Prev
                </button>
                <div className="or-page-info">
                  {totalFiltered > 0 ? (
                    <>
                      Showing {startIndex + 1} to {Math.min(endIndex, totalFiltered)} of {totalFiltered} records
                    </>
                  ) : (
                    "No records"
                  )}
                </div>
                <button 
                  className="or-page-btn" 
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal for Details */}
      {isModalOpen && selectedOrderDetails && (
        <div className="or-modal-overlay" onClick={closeModal}>
          <div className="or-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="or-modal-header">
              <h2 className="or-modal-title">Order Details</h2>
              <button className="or-modal-close" onClick={closeModal} aria-label="Close modal">
                ✕
              </button>
            </div>
            
            <div className="or-modal-body">
              <div className="or-modal-info-section">
                <div className="or-modal-info-grid">
                  <div className="or-modal-info-item">
                    <span className="or-modal-info-label">Order No:</span>
                    <span className="or-modal-info-value">{selectedOrderDetails.order_id}</span>
                  </div>
                  <div className="or-modal-info-item">
                    <span className="or-modal-info-label">Customer:</span>
                    <span className="or-modal-info-value">{selectedOrderDetails.customer_name}</span>
                  </div>
                </div>
              </div>

              <div className="or-modal-items-section">
                <h3 className="or-modal-section-title">
                  Order Items ({selectedOrderDetails.items.length})
                </h3>
                
                <div className="or-modal-table-wrap">
                  <table className="or-modal-items-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Product Name</th>
                        <th>Item Code</th>
                        <th>Barcode</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderDetails.items.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td className="or-product-name">{item.product_name}</td>
                          <td className="or-item-code">{item.item_code || "-"}</td>
                          <td className="or-barcode">{item.barcode || "-"}</td>
                          <td className="or-price">{formatCurrency(item.price)}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="or-amount">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="or-modal-total-row">
                        <td colSpan="6" className="or-total-label">Total Order Amount:</td>
                        <td className="or-total-amount">
                          {formatCurrency(selectedOrderDetails.items.reduce((sum, item) => sum + (item.amount || 0), 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .or-status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: 500;
          text-transform: capitalize;
          background-color: #e2e8f0;
          color: #475569;
        }

        .or-status-completed {
          background-color: #dcfce7;
          color: #166534;
        }

        .or-status-uploaded {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .or-status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }

        .text-center {
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default OrderReport;