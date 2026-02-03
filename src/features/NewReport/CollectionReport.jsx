import React, { useState, useMemo, useEffect } from 'react';
import './CollectionReport.scss';

const CollectionReport = () => {
    const getToday = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMode, setSelectedMode] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCreatedBy, setSelectedCreatedBy] = useState('');
    const [fromDate, setFromDate] = useState(getToday());
    const [toDate, setToDate] = useState(getToday());
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [collectionData, setCollectionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
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

            const response = await fetch('https://tasksas.com/api/collection/list/', {
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

            console.log('API Response - Total records:', result.data?.length || 0);
            console.log('Full API Response:', result);

            if (result.success && Array.isArray(result.data)) {
                // Log all cheque entries to debug
                const chequeEntries = result.data.filter(item =>
                    item.type && item.type.toLowerCase() === 'cheque'
                );
                console.log('=== CHEQUE ENTRIES DEBUG ===');
                console.log('Total Cheque Entries:', chequeEntries.length);
                chequeEntries.forEach((item, index) => {
                    console.log(`Cheque ${index + 1}:`, {
                        id: item.id,
                        code: item.code,
                        name: item.name,
                        type: item.type,
                        cheque_number: item.cheque_number,
                        cheque_no: item.cheque_no,
                        chequeNumber: item.chequeNumber,
                        chequeNo: item.chequeNo,
                        allKeys: Object.keys(item)
                    });
                });
                console.log('=== END CHEQUE DEBUG ===');

                const transformedData = result.data.map((item) => ({
                    id: item.id,
                    code: item.code || 'N/A',
                    name: item.name || 'N/A',
                    place: item.place || '-',
                    phone: item.phone || '-',
                    amount: parseFloat(item.amount) || 0,
                    type: item.type || 'Cash',
                    cheque_number: item.cheque_number || item.cheque_no || item.chequeNumber || item.chequeNo || '',
                    created_date: item.created_date || 'N/A',
                    created_time: item.created_time || '-',
                    created_by: item.created_by || '-', // Placeholder for future API field
                    status: item.status || '-'
                }));
                setCollectionData(transformedData);
            } else {
                throw new Error('Invalid data format received');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching collection data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const clearSearch = () => setSearchTerm('');

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedMode('');
        setSelectedStatus('');
        setSelectedCreatedBy('');
        setFromDate('');
        setToDate('');
        setPage(1);
    };

    const hasActiveFilters = searchTerm || selectedMode || selectedStatus || selectedCreatedBy || fromDate || toDate;

    const filteredData = useMemo(() => {
        let result = collectionData;

        if (searchTerm) {
            const t = searchTerm.trim().toLowerCase();
            result = result.filter(d =>
                (d.name || "").toLowerCase().includes(t) ||
                (d.code || "").toLowerCase().includes(t) ||
                (d.place || "").toLowerCase().includes(t) ||
                (d.phone || "").toLowerCase().includes(t)
            );
        }

        if (selectedMode) {
            result = result.filter(d => d.type === selectedMode);
        }

        if (selectedStatus) {
            result = result.filter(d => d.status === selectedStatus);
        }

        if (selectedCreatedBy) {
            result = result.filter(d => (d.created_by || "").toLowerCase().includes(selectedCreatedBy.toLowerCase().trim()));
        }

        if (fromDate) {
            result = result.filter(d => d.created_date >= fromDate);
        }

        if (toDate) {
            result = result.filter(d => d.created_date <= toDate);
        }

        return result;
    }, [searchTerm, selectedMode, selectedStatus, selectedCreatedBy, fromDate, toDate, collectionData]);

    const total = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

    const displayedData = useMemo(() => {
        if (total === 0) return [];
        const start = (page - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, page, rowsPerPage, total]);

    const changePage = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    };

    // Get unique payment modes from data
    const uniqueModes = useMemo(() => {
        const modes = collectionData.map(d => d.type).filter(type => type && type.trim() !== "");
        return [...new Set(modes)].sort();
    }, [collectionData]);

    // Get unique statuses from data
    const uniqueStatuses = useMemo(() => {
        const statuses = collectionData.map(d => d.status).filter(status => status && status.trim() !== "" && status !== "-");
        return [...new Set(statuses)].sort();
    }, [collectionData]);



    return (
        <div className="cr-page">
            <div className="cr-card">
                <div className="cr-card-inner">
                    <header className="cr-card-header">
                        <div className="cr-header-content">
                            <div className="cr-header-left">
                                <h1 className="cr-title">Collection Report</h1>
                                <p className="cr-subtitle">Daily collection summary and payment tracking</p>
                            </div>
                            <button
                                className="cr-refresh-btn"
                                onClick={handleRefresh}
                                disabled={isRefreshing || loading}
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </header>

                    {loading && (
                        <div className="cr-loading">
                            Loading collection data...
                        </div>
                    )}

                    {error && (
                        <div className="cr-error">
                            ⚠️ Error Loading Data
                            <p style={{ marginTop: "10px" }}>{error}</p>
                            <button
                                style={{
                                    marginTop: "20px",
                                    padding: "10px 20px",
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                                onClick={handleRefresh}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="cr-filter-container">
                                <div className="cr-filter-row">
                                    <div className="cr-filter-left">
                                        <div className="cr-filter-item cr-filter-search compact">
                                            <label htmlFor="cr-search">Search</label>
                                            <div className="cr-search-wrap">
                                                <span className="cr-search-icon">🔍</span>
                                                <input
                                                    id="cr-search"
                                                    type="search"
                                                    placeholder="Search by name, code, place, or phone..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                {searchTerm && (
                                                    <button
                                                        type="button"
                                                        className="cr-search-clear"
                                                        onClick={clearSearch}
                                                        aria-label="Clear search"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="cr-filter-item">
                                            <label htmlFor="from-date">From Date</label>
                                            <input
                                                id="from-date"
                                                type="date"
                                                value={fromDate}
                                                onChange={(e) => setFromDate(e.target.value)}
                                                className="cr-date-input"
                                            />
                                        </div>

                                        <div className="cr-filter-item">
                                            <label htmlFor="to-date">To Date</label>
                                            <input
                                                id="to-date"
                                                type="date"
                                                value={toDate}
                                                onChange={(e) => setToDate(e.target.value)}
                                                className="cr-date-input"
                                            />
                                        </div>

                                        <div className="cr-filter-item">
                                            <label htmlFor="payment-mode">Type</label>
                                            <select
                                                id="payment-mode"
                                                value={selectedMode}
                                                onChange={(e) => setSelectedMode(e.target.value)}
                                                className="cr-select-input"
                                            >
                                                <option value="">All Types</option>
                                                {uniqueModes.map(mode => (
                                                    <option key={mode} value={mode}>{mode}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="cr-filter-item">
                                            <label htmlFor="status-filter">Status</label>
                                            <select
                                                id="status-filter"
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="cr-select-input"
                                            >
                                                <option value="">All Statuses</option>
                                                {uniqueStatuses.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="cr-filter-item">
                                            <label htmlFor="created-by-filter">Created By</label>
                                            <input
                                                id="created-by-filter"
                                                type="text"
                                                placeholder="Search user..."
                                                value={selectedCreatedBy}
                                                onChange={(e) => setSelectedCreatedBy(e.target.value)}
                                                className="cr-date-input"
                                            />
                                        </div>

                                        <div className="cr-filter-item">
                                            <label htmlFor="rows-select">Rows per page</label>
                                            <div className="cr-rows-selector-inline">
                                                <select
                                                    id="rows-select"
                                                    value={rowsPerPage}
                                                    onChange={(e) => {
                                                        setRowsPerPage(Number(e.target.value));
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

                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            className="cr-clear-filters-btn"
                                            onClick={clearAllFilters}
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="cr-table-wrap">
                                <table className="cr-collection-table">
                                    <thead>
                                        <tr>
                                            <th>SNO</th>
                                            <th>Code</th>
                                            <th>Created Date & Time</th>
                                            <th>Created By</th>
                                            <th>Name</th>
                                            <th>Place</th>
                                            <th>Phone</th>
                                            <th>Type</th>
                                            <th className="right">Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedData.length > 0 ? (
                                            displayedData.map((row, index) => (
                                                <tr key={row.id}>
                                                    <td>
                                                        <span style={{
                                                            fontWeight: '700',
                                                            fontSize: '14px',
                                                            color: '#64748b'
                                                        }}>
                                                            {(page - 1) * rowsPerPage + index + 1}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            fontFamily: 'monospace',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            color: '#334155'
                                                        }}>
                                                            {row.code}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            <span style={{
                                                                fontSize: '13px',
                                                                fontWeight: '500',
                                                                color: '#334155'
                                                            }}>
                                                                {row.created_date}
                                                            </span>
                                                            <span style={{
                                                                fontFamily: 'monospace',
                                                                fontSize: '12px',
                                                                color: '#64748b'
                                                            }}>
                                                                {row.created_time}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            fontSize: '13px',
                                                            color: '#64748b',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            {row.created_by}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: '600' }}>{row.name}</span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                                                            {row.place}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            fontFamily: 'monospace',
                                                            fontSize: '13px'
                                                        }}>
                                                            {row.phone}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <span style={{
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                color: '#334155'
                                                            }}>
                                                                {row.type}
                                                            </span>
                                                            {row.type && row.type.toLowerCase() === 'cheque' && row.cheque_number && (
                                                                <span style={{
                                                                    fontSize: '11px',
                                                                    color: '#64748b',
                                                                    fontFamily: 'monospace',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    Ch. No: {row.cheque_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="right">
                                                        {row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        <span className={`cr-status-badge ${row.status.toLowerCase().includes('uploaded') ? 'cr-status-success' :
                                                            row.status.toLowerCase().includes('pending') ? 'cr-status-pending' :
                                                                'cr-status-default'
                                                            }`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="10" className="cr-no-data">
                                                    No collections found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="cr-pagination">
                                <button
                                    className="cr-page-btn"
                                    onClick={() => changePage(1)}
                                    disabled={page === 1 || total === 0}
                                >
                                    First
                                </button>

                                <button
                                    className="cr-page-btn"
                                    onClick={() => changePage(page - 1)}
                                    disabled={page === 1 || total === 0}
                                >
                                    Prev
                                </button>

                                <div className="cr-page-info">
                                    {total === 0 ? "No records" : `Page ${page} of ${totalPages} (${total} records)`}
                                </div>

                                <button
                                    className="cr-page-btn"
                                    onClick={() => changePage(page + 1)}
                                    disabled={page === totalPages || total === 0}
                                >
                                    Next
                                </button>

                                <button
                                    className="cr-page-btn"
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

export default CollectionReport;