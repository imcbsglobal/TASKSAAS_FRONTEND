import React, { useState, useMemo, useEffect } from "react";
import "./AreaAssignTableView.scss";

const AreaAssignTableView = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const fetchAreaAssignments = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            const response = await fetch('https://tasksas.com/api/area/list/', {
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
            console.log("📦 API Response:", result);

            if (result.areas && Array.isArray(result.areas)) {
                const formattedData = result.areas.map((item, index) => {
                    if (typeof item === 'string') {
                        return { id: index + 1, area: item, user_name: null };
                    } else {
                        return {
                            id: index + 1,
                            area: item.area || item.name || 'N/A',
                            user_name: item.user_name || item.assigned_to || item.user || null
                        };
                    }
                });
                setData(formattedData);
            } else if (Array.isArray(result)) {
                const formattedData = result.map((item, index) => {
                    if (typeof item === 'string') {
                        return { id: index + 1, area: item, user_name: null };
                    } else {
                        return {
                            id: index + 1,
                            area: item.area || item.name || 'N/A',
                            user_name: item.user_name || item.assigned_to || item.user || null
                        };
                    }
                });
                setData(formattedData);
            } else {
                setData([]);
            }

        } catch (err) {
            console.error("Error:", err);
            setError(err.message || 'Failed to load area assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAreaAssignments();
    }, []);

    const filteredAndSortedData = useMemo(() => {
        let filtered = data.filter(row => {
            const searchLower = searchTerm.toLowerCase();
            const area = (row.area || '').toLowerCase();
            const userName = (row.user_name || '').toLowerCase();
            return area.includes(searchLower) || userName.includes(searchLower);
        });

        filtered.sort((a, b) => {
            const areaA = (a.area || '').toLowerCase();
            const areaB = (b.area || '').toLowerCase();
            return areaA.localeCompare(areaB);
        });

        return filtered;
    }, [searchTerm, data]);

    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="assign-table-container">
            <div className="table-wrapper">

                {/* Header */}
                <header className="header-section">
                    <div className="header-left">
                        <h1 className="table-title">Area Assignments</h1>
                        <p className="subtitle">Manage and view all area assignments</p>
                    </div>
                    <button
                        className="refresh-btn"
                        onClick={fetchAreaAssignments}
                        disabled={loading}
                    >
                        🔄 {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="at-error-banner">
                        <span>⚠️</span>
                        <span>{error}</span>
                        <button className="at-retry-btn" onClick={fetchAreaAssignments}>
                            Retry
                        </button>
                    </div>
                )}

                {/* Table Controls */}
                {!loading && !error && (
                    <div className="table-controls">
                        <div className="search-section">
                            <label className="control-label">Search</label>
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="search"
                                    placeholder="Search by area or user name..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="rows-section">
                            <label className="control-label">Rows per page</label>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="rows-select"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="table-scroll">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Area</th>
                                <th>User Name</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="at-loading-cell">
                                        <div className="at-spinner"></div>
                                        <span className="at-loading-text">Loading area assignments...</span>
                                    </td>
                                </tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map((row, index) => (
                                    <tr key={row.id || index}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{row.area || 'N/A'}</td>
                                        <td>
                                            <span className={row.user_name ? 'at-user-assigned' : 'at-user-empty'}>
                                                {row.user_name || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="no-results">
                                    <td colSpan="3">
                                        {searchTerm
                                            ? `No results found for "${searchTerm}"`
                                            : 'No area assignments found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredAndSortedData.length > 0 && !loading && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Prev
                        </button>

                        <div className="page-numbers">
                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AreaAssignTableView;