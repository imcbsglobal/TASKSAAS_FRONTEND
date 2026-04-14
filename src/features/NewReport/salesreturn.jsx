import React, { useMemo, useState, useEffect } from "react";
import "./salesreturn.scss";

// ─── Modal ────────────────────────────────────────────────────────────────────
const OrdersModal = ({ group, onClose, getStatusClass }) => {
  // Flatten all orders + items into one list of rows
  const rows = useMemo(() => {
    const result = [];
    group.orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        result.push({
          order_id: order.order_id,
          created_date: order.created_date,
          created_time: order.created_time,
          status: order.status,
          product_name: item.product_name,
          item_code: item.item_code,
          barcode: item.barcode,
          price: item.price,
          quantity: item.quantity,
          amount: item.amount,
          remark: item.remark,
        });
      });
    });
    return result;
  }, [group]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sr-modal-backdrop" onClick={onClose}>
      <div className="sr-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="sr-modal-header">
          <div className="sr-modal-title-block">
            <h2 className="sr-modal-title">{group.customer_name || "—"}</h2>
            <span className="sr-modal-subtitle">
              {group.customer_code}&nbsp;·&nbsp;{group.area}&nbsp;·&nbsp;{group.username}
              &nbsp;·&nbsp;<strong>{group.orders.length}</strong> order(s)
            </span>
          </div>
          <div className="sr-modal-header-right">
            <button className="sr-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="sr-modal-body">
          <div className="sr-modal-table-wrap">
            <table className="sr-modal-table">

              {/* Column widths — # | Order ID | Date | Product | Item Code | Barcode | Price | Qty | Amount | Status | Remark */}
              <colgroup>
                <col className="col-no" />
                <col className="col-orderid" />
                <col className="col-date" />
                <col className="col-product" />
                <col className="col-itemcode" />
                <col className="col-barcode" />
                <col className="col-price" />
                <col className="col-qty" />
                <col className="col-amount" />
                <col className="col-status" />
                <col className="col-remark" />
              </colgroup>

              <thead>
                <tr>
                  <th>No</th>
                  <th>Sales ID</th>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Item Code</th>
                  <th>Barcode</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Status</th>
                  <th>Remark</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="sr-no-data">No items found</td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="td-center">{idx + 1}</td>
                      <td className="td-orderid">{row.order_id}</td>
                      <td className="td-date-col">
                        <div>{row.created_date}</div>
                        <div className="td-time">{row.created_time}</div>
                      </td>
                      <td className="item-product-name" title={row.product_name}>
                        {row.product_name || "—"}
                      </td>
                      <td>{row.item_code}</td>
                      <td>{row.barcode}</td>
                      <td className="item-amount">
                        {row.price?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="td-center">
                        {parseFloat(row.quantity).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="item-amount">
                        {row.amount?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span className={`sr-status-badge ${getStatusClass(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        {row.remark ? (
                          <span className="remark-badge" title={row.remark}>
                            {row.remark}
                          </span>
                        ) : (
                          <span className="remark-empty">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesReturn = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalGroup, setModalGroup] = useState(null);

  const fetchSalesReturn = async () => {
    try {
      setLoading(true);
      setError(null);
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch("https://tasksas.com/api/sales-return/list", {
        method: "GET",
        headers,
      });
      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized - Please login again");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.returns)) {
        setData(result.returns);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalesReturn(); }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalGroup ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalGroup]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [areaSearchTerm, setAreaSearchTerm] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // ── Group by customer ──
  const grouped = useMemo(() => {
    const map = {};
    data.forEach((row) => {
      const key = row.customer_code || row.customer_name || "unknown";
      if (!map[key]) {
        map[key] = {
          customer_code: row.customer_code,
          customer_name: row.customer_name,
          area: row.area,
          username: row.username,
          orders: [],
        };
      }
      map[key].orders.push(row);
    });
    return Object.values(map);
  }, [data]);

  const uniqueAreas = useMemo(() => {
    const areas = grouped.map((g) => g.area).filter((a) => a && a.trim() !== "");
    return [...new Set(areas)].sort();
  }, [grouped]);

  const uniqueStatuses = useMemo(() => {
    const statuses = data.map((d) => d.status).filter((s) => s && s.trim() !== "");
    return [...new Set(statuses)].sort();
  }, [data]);

  const filteredAreas = useMemo(() => {
    if (!areaSearchTerm.trim()) return uniqueAreas;
    return uniqueAreas.filter((a) =>
      a.toLowerCase().includes(areaSearchTerm.toLowerCase())
    );
  }, [uniqueAreas, areaSearchTerm]);

  const filtered = useMemo(() => {
    let result = grouped;
    if (searchTerm) {
      const t = searchTerm.trim().toLowerCase();
      result = result.filter(
        (g) =>
          (g.customer_name || "").toLowerCase().includes(t) ||
          (g.customer_code || "").toLowerCase().includes(t) ||
          (g.area || "").toLowerCase().includes(t) ||
          (g.username || "").toLowerCase().includes(t) ||
          g.orders.some((o) => (o.order_id || "").toLowerCase().includes(t))
      );
    }
    if (selectedArea) result = result.filter((g) => g.area === selectedArea);
    if (selectedStatus)
      result = result.filter((g) =>
        g.orders.some((o) => o.status === selectedStatus)
      );
    return result.sort((a, b) => {
      const latest = (g) =>
        Math.max(
          ...g.orders.map((o) =>
            new Date(`${o.created_date}T${o.created_time}`).getTime()
          )
        );
      return latest(b) - latest(a);
    });
  }, [grouped, searchTerm, selectedArea, selectedStatus]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages && totalPages > 0) setPage(totalPages);

  const pageItems = useMemo(() => {
    if (total === 0) return [];
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize, total]);

  const getOrderTotal = (items) =>
    (items || []).reduce((sum, i) => sum + (i.amount || 0), 0);
  const getCustomerTotal = (orders) =>
    orders.reduce((sum, o) => sum + getOrderTotal(o.items), 0);

  const changePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedArea("");
    setSelectedStatus("");
    setAreaSearchTerm("");
    setPage(1);
  };
  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setIsAreaDropdownOpen(false);
    setAreaSearchTerm("");
    setPage(1);
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s.includes("upload") || s.includes("server")) return "status-uploaded";
    if (s.includes("complet")) return "status-completed";
    if (s.includes("pending")) return "status-pending";
    return "status-default";
  };

  // Close area dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".sr-area-dropdown-container"))
        setIsAreaDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasActiveFilters = searchTerm || selectedArea || selectedStatus;

  return (
    <div className="sr-page">

      {modalGroup && (
        <OrdersModal
          group={modalGroup}
          onClose={() => setModalGroup(null)}
          getStatusClass={getStatusClass}
        />
      )}

      <div className="sr-card" role="main" aria-labelledby="sr-page-title">
        <div className="sr-card-inner">

          {/* ── Header ── */}
          <header className="sr-card-header">
            <div className="sr-header-content">
              <div className="sr-header-left">
                <h1 id="sr-page-title" className="sr-title">Sales Return</h1>
                <p className="sr-subtitle">Manage and view all Sales Return records</p>
              </div>
              <button
                className="sr-refresh-btn"
                onClick={() => { setLoading(true); fetchSalesReturn(); }}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </header>

          {loading && (
            <div className="sr-loading" style={{ padding: "2rem", textAlign: "center" }}>
              Loading sales return data...
            </div>
          )}

          {error && (
            <div
              className="sr-error"
              style={{
                padding: "1rem",
                color: "#d32f2f",
                background: "#ffebee",
                borderRadius: "4px",
                margin: "1rem 0",
              }}
            >
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* ── Filter Row ── */}
              <div className="sr-filter-row">
                <div className="sr-filter-left">

                  {/* Search */}
                  <div className="sr-filter-item sr-filter-search">
                    <label htmlFor="sr-search">Search</label>
                    <div className="sr-search-wrap">
                      <span className="sr-search-icon">🔍</span>
                      <input
                        id="sr-search"
                        type="search"
                        placeholder="Search by customer, order ID, area, salesman..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          className="sr-search-clear"
                          onClick={() => { setSearchTerm(""); setPage(1); }}
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Area Dropdown */}
                  <div className="sr-filter-item sr-filter-area">
                    <label>Filter by Area</label>
                    <div className="sr-area-dropdown-container">
                      <button
                        type="button"
                        className="sr-area-select-button"
                        onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                      >
                        <span className="sr-area-selected">{selectedArea || "All Areas"}</span>
                        <span className="sr-area-arrow">{isAreaDropdownOpen ? "▲" : "▼"}</span>
                      </button>

                      {isAreaDropdownOpen && (
                        <div className="sr-area-dropdown-menu">
                          <div className="sr-area-search-container">
                            <span className="sr-area-search-icon">🔍</span>
                            <input
                              type="text"
                              placeholder="Search areas..."
                              value={areaSearchTerm}
                              onChange={(e) => setAreaSearchTerm(e.target.value)}
                              className="sr-area-search-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="sr-area-options">
                            <div
                              className={`sr-area-option ${!selectedArea ? "active" : ""}`}
                              onClick={() => handleAreaSelect("")}
                            >
                              All Areas {!selectedArea && <span className="sr-check">✓</span>}
                            </div>
                            {filteredAreas.length > 0 ? (
                              filteredAreas.map((area) => (
                                <div
                                  key={area}
                                  className={`sr-area-option ${selectedArea === area ? "active" : ""}`}
                                  onClick={() => handleAreaSelect(area)}
                                >
                                  {area} {selectedArea === area && <span className="sr-check">✓</span>}
                                </div>
                              ))
                            ) : (
                              <div className="sr-area-no-results">No areas found</div>
                            )}
                          </div>
                          {uniqueAreas.length > 10 && (
                            <div className="sr-area-count">
                              Showing {filteredAreas.length} of {uniqueAreas.length} areas
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="sr-filter-item sr-filter-status">
                    <label htmlFor="sr-status-filter">Status</label>
                    <select
                      id="sr-status-filter"
                      className="sr-select"
                      value={selectedStatus}
                      onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                    >
                      <option value="">All Statuses</option>
                      {uniqueStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sr-stats">
                  {hasActiveFilters && (
                    <button type="button" className="sr-clear-filters-btn" onClick={clearFilters}>
                      Clear All Filters
                    </button>
                  )}
                  <div className="sr-rows-selector">
                    <label htmlFor="sr-rows-select">Rows:</label>
                    <select
                      id="sr-rows-select"
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
              </div>

              {/* ── Main Table ── */}
              <div className="sr-table-wrap" role="region" aria-label="Sales Return table">
                <table className="sr-returns-table" role="table">
                  <thead>
                    <tr>
                      <th scope="col" className="th-serial">No</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Area</th>
                      <th scope="col">Salesman</th>
                      <th scope="col">Orders</th>
                      <th scope="col">Total Amount</th>
                      <th scope="col" className="th-expand">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {total === 0 ? (
                      <tr>
                        <td colSpan="7" className="sr-no-data">
                          No sales return records found
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((group, i) => {
                        const customerTotal = getCustomerTotal(group.orders);
                        return (
                          <tr key={group.customer_code || group.customer_name}>
                            <td className="td-center">{(page - 1) * pageSize + i + 1}</td>
                            <td>
                              <div className="td-customer-name">{group.customer_name || "—"}</div>
                              <div className="td-customer-code">{group.customer_code}</div>
                            </td>
                            <td>{group.area || "—"}</td>
                            <td>{group.username}</td>
                            <td className="td-center">
                              <span className="sr-order-count-badge">{group.orders.length}</span>
                            </td>
                            <td className="td-amount">
                              {customerTotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="td-center">
                              <button
                                className="sr-view-orders-btn"
                                onClick={() => setModalGroup(group)}
                              >
                                View Orders
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              <div className="sr-pagination" role="navigation" aria-label="Pagination">
                <button
                  className="sr-page-btn"
                  onClick={() => changePage(1)}
                  disabled={page === 1 || total === 0}
                >
                  First
                </button>
                <button
                  className="sr-page-btn"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1 || total === 0}
                >
                  Prev
                </button>
                <div className="sr-page-info">
                  {total === 0 ? "No records" : `Page ${page} of ${totalPages}`}
                </div>
                <button
                  className="sr-page-btn"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages || total === 0}
                >
                  Next
                </button>
                <button
                  className="sr-page-btn"
                  onClick={() => changePage(totalPages)}
                  disabled={page === totalPages || total === 0}
                >
                  Last
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReturn;