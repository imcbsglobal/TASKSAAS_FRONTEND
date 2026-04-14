import React, { useMemo, useState, useEffect } from "react";
import "./sales.scss";

// ─── Modal ────────────────────────────────────────────────────────────────────
const OrdersModal = ({ group, onClose, getStatusClass }) => {
  // Flatten all orders + items into one list of rows
  const rows = useMemo(() => {
    const result = [];
    group.orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        result.push({
          sales_id: order.sales_id,
          created_date: order.created_date,
          created_time: order.created_time,
          status: order.status,
          payment_type: order.payment_type,
          remark: order.remark,
          product_name: item.product_name,
          item_code: item.item_code,
          barcode: item.barcode,
          price: item.price,
          quantity: item.quantity,
          amount: item.amount,
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
    <div className="sl-modal-backdrop" onClick={onClose}>
      <div className="sl-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="sl-modal-header">
          <div className="sl-modal-title-block">
            <h2 className="sl-modal-title">{group.customer_name || "—"}</h2>
            <span className="sl-modal-subtitle">
              {group.customer_code}&nbsp;·&nbsp;{group.area}&nbsp;·&nbsp;{group.username}
              &nbsp;·&nbsp;<strong>{group.orders.length}</strong> order(s)
            </span>
          </div>
          <div className="sl-modal-header-right">
            <button className="sl-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="sl-modal-body">
          <div className="sl-modal-table-wrap">
            <table className="sl-modal-table">

              {/* Column widths */}
              <colgroup>
                <col className="col-no" />
                <col className="col-salesid" />
                <col className="col-date" />
                <col className="col-payment" />
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
                  <th>Payment</th>
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
                    <td colSpan="12" className="sl-no-data">No items found</td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="td-center">{idx + 1}</td>
                      <td className="td-salesid">{row.sales_id}</td>
                      <td className="td-date-col">
                        <div>{row.created_date}</div>
                        <div className="td-time">{row.created_time}</div>
                      </td>
                      <td>{row.payment_type}</td>
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
                        <span className={`sl-status-badge ${getStatusClass(row.status)}`}>
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
const Sales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalGroup, setModalGroup] = useState(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch("https://tasksas.com/api/sales/list-all", {
        method: "GET",
        headers,
      });
      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized - Please login again");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.sales)) {
        setData(result.sales);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalGroup ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalGroup]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [areaSearchTerm, setAreaSearchTerm] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // ── Group by customer (same logic as SalesReturn) ──
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

  const uniquePaymentTypes = useMemo(() => {
    const types = data.map((d) => d.payment_type).filter((t) => t && t.trim() !== "");
    return [...new Set(types)].sort();
  }, [data]);

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
          g.orders.some((o) => (o.sales_id || "").toLowerCase().includes(t))
      );
    }
    if (selectedArea) result = result.filter((g) => g.area === selectedArea);
    if (selectedPaymentType)
      result = result.filter((g) =>
        g.orders.some((o) => o.payment_type === selectedPaymentType)
      );
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
  }, [grouped, searchTerm, selectedArea, selectedPaymentType, selectedStatus]);

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
    setSelectedPaymentType("");
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
      if (!e.target.closest(".sl-area-dropdown-container"))
        setIsAreaDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasActiveFilters = searchTerm || selectedArea || selectedPaymentType || selectedStatus;

  return (
    <div className="sl-page">

      {modalGroup && (
        <OrdersModal
          group={modalGroup}
          onClose={() => setModalGroup(null)}
          getStatusClass={getStatusClass}
        />
      )}

      <div className="sl-card" role="main" aria-labelledby="sl-page-title">
        <div className="sl-card-inner">

          {/* ── Header ── */}
          <header className="sl-card-header">
            <div className="sl-header-content">
              <div className="sl-header-left">
                <h1 id="sl-page-title" className="sl-title">Sales</h1>
                <p className="sl-subtitle">Manage and view all Sales records</p>
              </div>
              <button
                className="sl-refresh-btn"
                onClick={() => { setLoading(true); fetchSales(); }}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </header>

          {loading && (
            <div className="sl-loading" style={{ padding: "2rem", textAlign: "center" }}>
              Loading sales data...
            </div>
          )}

          {error && (
            <div
              className="sl-error"
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
              <div className="sl-filter-row">
                <div className="sl-filter-left">

                  {/* Search */}
                  <div className="sl-filter-item sl-filter-search">
                    <label htmlFor="sl-search">Search</label>
                    <div className="sl-search-wrap">
                      <span className="sl-search-icon">🔍</span>
                      <input
                        id="sl-search"
                        type="search"
                        placeholder="Search by customer, sales ID, area, salesman..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          className="sl-search-clear"
                          onClick={() => { setSearchTerm(""); setPage(1); }}
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Area Dropdown */}
                  <div className="sl-filter-item sl-filter-area">
                    <label>Filter by Area</label>
                    <div className="sl-area-dropdown-container">
                      <button
                        type="button"
                        className="sl-area-select-button"
                        onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                      >
                        <span className="sl-area-selected">{selectedArea || "All Areas"}</span>
                        <span className="sl-area-arrow">{isAreaDropdownOpen ? "▲" : "▼"}</span>
                      </button>

                      {isAreaDropdownOpen && (
                        <div className="sl-area-dropdown-menu">
                          <div className="sl-area-search-container">
                            <span className="sl-area-search-icon">🔍</span>
                            <input
                              type="text"
                              placeholder="Search areas..."
                              value={areaSearchTerm}
                              onChange={(e) => setAreaSearchTerm(e.target.value)}
                              className="sl-area-search-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="sl-area-options">
                            <div
                              className={`sl-area-option ${!selectedArea ? "active" : ""}`}
                              onClick={() => handleAreaSelect("")}
                            >
                              All Areas {!selectedArea && <span className="sl-check">✓</span>}
                            </div>
                            {filteredAreas.length > 0 ? (
                              filteredAreas.map((area) => (
                                <div
                                  key={area}
                                  className={`sl-area-option ${selectedArea === area ? "active" : ""}`}
                                  onClick={() => handleAreaSelect(area)}
                                >
                                  {area} {selectedArea === area && <span className="sl-check">✓</span>}
                                </div>
                              ))
                            ) : (
                              <div className="sl-area-no-results">No areas found</div>
                            )}
                          </div>
                          {uniqueAreas.length > 10 && (
                            <div className="sl-area-count">
                              Showing {filteredAreas.length} of {uniqueAreas.length} areas
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Type Filter */}
                  <div className="sl-filter-item sl-filter-payment">
                    <label htmlFor="sl-payment-filter">Payment Type</label>
                    <select
                      id="sl-payment-filter"
                      className="sl-select"
                      value={selectedPaymentType}
                      onChange={(e) => { setSelectedPaymentType(e.target.value); setPage(1); }}
                    >
                      <option value="">All Types</option>
                      {uniquePaymentTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="sl-filter-item sl-filter-status">
                    <label htmlFor="sl-status-filter">Status</label>
                    <select
                      id="sl-status-filter"
                      className="sl-select"
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

                <div className="sl-stats">
                  {hasActiveFilters && (
                    <button type="button" className="sl-clear-filters-btn" onClick={clearFilters}>
                      Clear All Filters
                    </button>
                  )}
                  <div className="sl-rows-selector">
                    <label htmlFor="sl-rows-select">Rows:</label>
                    <select
                      id="sl-rows-select"
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
              <div className="sl-table-wrap" role="region" aria-label="Sales table">
                <table className="sl-sales-table" role="table">
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
                        <td colSpan="7" className="sl-no-data">
                          No sales records found
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
                              <span className="sl-order-count-badge">{group.orders.length}</span>
                            </td>
                            <td className="td-amount">
                              {customerTotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="td-center">
                              <button
                                className="sl-view-orders-btn"
                                onClick={() => setModalGroup(group)}
                              >
                                View Sales
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
              <div className="sl-pagination" role="navigation" aria-label="Pagination">
                <button
                  className="sl-page-btn"
                  onClick={() => changePage(1)}
                  disabled={page === 1 || total === 0}
                >
                  First
                </button>
                <button
                  className="sl-page-btn"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1 || total === 0}
                >
                  Prev
                </button>
                <div className="sl-page-info">
                  {total === 0 ? "No records" : `Page ${page} of ${totalPages}`}
                </div>
                <button
                  className="sl-page-btn"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages || total === 0}
                >
                  Next
                </button>
                <button
                  className="sl-page-btn"
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

export default Sales;