import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../services/api';
import '../styles/Debtors.scss';

const Debtors = () => {
    const navigate = useNavigate();
    const [allData, setAllData] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    const pageSizeOptions = [10, 20, 50, 100];

    useEffect(() => {
        fetchDebtorsData();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);

    const fetchDebtorsData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            let url = `${API_BASE_URL}/get-debtors-data/?page=1&page_size=50000`;

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                const filteredData = response.data.data.filter(item => {
                    const debit = parseFloat(item.master_debit || 0);
                    const credit = parseFloat(item.master_credit || 0);
                    
                    return debit !== 0 || credit !== 0;
                });
                
                // Check what fields are available in the API response
                console.log('Total records:', filteredData.length);
                console.log('Sample record (first item):', filteredData[0]);
                console.log('All fields:', filteredData[0] ? Object.keys(filteredData[0]) : 'No data');
                
                setAllData(filteredData);
            } else {
                setError(response.data.error || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch debtors data');
        } finally {
            setLoading(false);
        }
    };

    const getDisplayData = () => {
        let filtered = allData;

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                (item.code || '').toString().toLowerCase().includes(search) ||
                (item.name || '').toString().toLowerCase().includes(search) ||
                (item.place || '').toString().toLowerCase().includes(search)
            );
        }

        // Sort alphabetically by name
        filtered = [...filtered].sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        const totalRecords = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filtered.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            totalRecords,
            totalPages
        };
    };

    const displayInfo = getDisplayData();
    const displayData = displayInfo.data;
    const totalPages = displayInfo.totalPages;
    const totalRecords = displayInfo.totalRecords;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageSizeChange = (e) => {
        const newPageSize = parseInt(e.target.value);
        setPageSize(newPageSize);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleLedgerClick = (account) => {
        // Navigate to ledger page with account code
        navigate(`/debtors/ledger/${account.code}`, {
            state: { accountName: account.name, accountData: account }
        });
    };

    const handleInvoiceClick = (account) => {
        // Navigate to invoice page with account code
        navigate(`/debtors/invoice/${account.code}`, {
            state: { accountName: account.name, accountData: account }
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0.00';
        return parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const calculateBalance = (debit, credit) => {
        const debitAmount = parseFloat(debit || 0);
        const creditAmount = parseFloat(credit || 0);
        return debitAmount - creditAmount;
    };

    return (
        <div className="dbt-page">
            <div className="dbt-card">
                <div className="dbt-card-inner">
                    <header className="dbt-card-header">
                        <div className="dbt-header-content">
                            <div className="dbt-header-left">
                                <h1 className="dbt-title">Debtors Statement</h1>
                                <p className="dbt-subtitle">Manage and view all debtor accounts</p>
                            </div>
                            <button 
                                className="dbt-refresh-btn" 
                                onClick={() => {
                                    setLoading(true);
                                    fetchDebtorsData();
                                }}
                                disabled={loading}
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </header>

                    {loading && (
                        <div className="dbt-loading">Loading debtors data...</div>
                    )}
                    
                    {error && (
                        <div className="dbt-error">Error: {error}</div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="dbt-filter-row">
                                <div className="dbt-filter-left">
                                    <div className="dbt-filter-item dbt-filter-search">
                                        <label htmlFor="dbt-search">Search</label>
                                        <div className="dbt-search-wrap">
                                            <span className="dbt-search-icon">🔍</span>
                                            <input
                                                id="dbt-search"
                                                type="text"
                                                placeholder="Search by name, code, place..."
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                                disabled={loading}
                                            />
                                            {searchTerm && (
                                                <button
                                                    type="button"
                                                    className="dbt-search-clear"
                                                    onClick={clearSearch}
                                                    aria-label="Clear search"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="dbt-stats">
                                    <div className="dbt-rows-selector">
                                        <label htmlFor="dbt-rows-select">Rows:</label>
                                        <select
                                            id="dbt-rows-select"
                                            value={pageSize}
                                            onChange={handlePageSizeChange}
                                            disabled={loading}
                                        >
                                            {pageSizeOptions.map(size => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="dbt-table-wrap">
                                <table className="dbt-debtors-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Code</th>
                                            <th>Name</th>
                                            <th>Ledger</th>
                                            <th>Invoice</th>
                                            <th>Place</th>
                                            <th>Phone</th>
                                            <th>Opening</th>
                                            <th>Debit</th>
                                            <th>Credit</th>
                                            <th>Balance</th>
                                            <th>Dept</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayData.length === 0 ? (
                                            <tr>
                                                <td colSpan="12" className="dbt-no-data">
                                                    {searchTerm ? `No records found matching "${searchTerm}".` : "No debtor records found."}
                                                </td>
                                            </tr>
                                        ) : (
                                            displayData.map((item, index) => {
                                                const balance = calculateBalance(item.master_debit, item.master_credit);
                                                const serialNo = (currentPage - 1) * pageSize + index + 1;
                                                return (
                                                    <tr key={`${item.code}-${index}`}>
                                                        <td data-label="No">{serialNo}</td>
                                                        <td data-label="Code" className="dbt-account-code">{item.code}</td>
                                                        <td data-label="Name" className="dbt-account-name">{item.name || 'N/A'}</td>
                                                        <td data-label="Ledger" className="dbt-eye-icon-cell">
                                                            <button 
                                                                className="dbt-eye-icon-btn" 
                                                                onClick={() => handleLedgerClick(item)}
                                                                title="View Ledger Details"
                                                            >
                                                                👁️
                                                            </button>
                                                        </td>
                                                        <td data-label="Invoice" className="dbt-eye-icon-cell">
                                                            <button 
                                                                className="dbt-eye-icon-btn" 
                                                                onClick={() => handleInvoiceClick(item)}
                                                                title="View Invoice Details"
                                                            >
                                                                👁️
                                                            </button>
                                                        </td>
                                                        <td data-label="Place">{item.place || '-'}</td>
                                                        <td data-label="Phone">{item.phone2 || '-'}</td>
                                                        <td data-label="Opening" className="dbt-currency">₹{formatCurrency(item.opening_balance)}</td>
                                                        <td data-label="Debit" className="dbt-currency">₹{formatCurrency(item.master_debit)}</td>
                                                        <td data-label="Credit" className="dbt-currency">₹{formatCurrency(item.master_credit)}</td>
                                                        <td data-label="Balance" className={`dbt-currency ${balance >= 0 ? 'dbt-balance-positive' : 'dbt-balance-negative'}`}>
                                                            ₹{formatCurrency(Math.abs(balance))}
                                                        </td>
                                                        <td data-label="Dept">{item.openingdepartment || '-'}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="dbt-pagination">
                                <button 
                                    className="dbt-page-btn" 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1 || loading}
                                >
                                    Prev
                                </button>
                                <div className="dbt-page-info">
                                    {totalRecords === 0 ? "No records" : `Showing ${totalRecords} records (Page ${currentPage} of ${totalPages})`}
                                </div>
                                <button 
                                    className="dbt-page-btn" 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages || loading}
                                >
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

export default Debtors;