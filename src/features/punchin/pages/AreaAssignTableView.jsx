import React, { useState, useMemo, useEffect } from "react";
import "./AreaAssignTableView.scss";

const AreaAssignTableView = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Fetch data from API
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
                    // Handle if item is a string (just area name) or object (with area and user info)
                    if (typeof item === 'string') {
                        return {
                            id: index + 1,
                            area: item,
                            user_name: null
                        };
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
                        return {
                            id: index + 1,
                            area: item,
                            user_name: null
                        };
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

    // Filter and sort data alphabetically by area
    const filteredAndSortedData = useMemo(() => {
        let filtered = data.filter(row => {
            const searchLower = searchTerm.toLowerCase();
            const area = (row.area || '').toLowerCase();
            const userName = (row.user_name || '').toLowerCase();
            return area.includes(searchLower) || userName.includes(searchLower);
        });

        // Sort alphabetically by area (A-Z)
        filtered.sort((a, b) => {
            const areaA = (a.area || '').toLowerCase();
            const areaB = (b.area || '').toLowerCase();
            return areaA.localeCompare(areaB);
        });

        return filtered;
    }, [searchTerm, data]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

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
            <div className="header-section">
                <h1 className="table-title">Area Assignments</h1>
                <div className="title-underline"></div>
                <button 
                    className="refresh-btn" 
                    onClick={fetchAreaAssignments}
                    disabled={loading}
                    style={{
                        marginLeft: '20px',
                        padding: '8px 16px',
                        background: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    🔄 {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    margin: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#dc2626'
                }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button 
                        onClick={fetchAreaAssignments}
                        style={{
                            marginLeft: 'auto',
                            padding: '6px 12px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="table-wrapper">
                <div className="table-controls">
                    <div className="search-section">
                        <label className="control-label">Search</label>
                        <div className="search-box">
                            <svg className="search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by area or user name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="rows-section">
                        <label className="control-label">Rows:</label>
                        <select 
                            value={itemsPerPage} 
                            onChange={handleItemsPerPageChange} 
                            className="rows-select"
                            disabled={loading}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                </div>

                <div className="table-scroll">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>NO</th>
                                <th>AREA</th>
                                <th>USER NAME</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
                                        <div style={{
                                            display: 'inline-block',
                                            width: '24px',
                                            height: '24px',
                                            border: '3px solid #f3f3f3',
                                            borderTop: '3px solid #4f46e5',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        <p style={{ marginTop: '10px', color: '#666' }}>Loading area assignments...</p>
                                    </td>
                                </tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map((row, index) => (
                                    <tr key={row.id || index}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{row.area || 'N/A'}</td>
                                        <td>
                                            <span style={{
                                                color: row.user_name ? '#059669' : '#9ca3af',
                                                fontStyle: row.user_name ? 'normal' : 'italic'
                                            }}>
                                                {row.user_name || 'null'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="no-results">
                                    <td colSpan="3">
                                        <div className="no-results-content">
                                            <p>{searchTerm ? `No results found for "${searchTerm}"` : 'No area assignments found'}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedData.length > 0 && !loading && (
                    <div className="pagination">
                        <button 
                            className="page-btn prev-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Previous
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
                            className="page-btn next-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AreaAssignTableView;