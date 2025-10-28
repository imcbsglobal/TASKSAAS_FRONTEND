import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../services/api';
import '../styles/Debtors.scss';

const Debtors = () => {
    const [debtorsData, setDebtorsData] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(20); // New state for page size
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        page_size: 20,
        has_next: false,
        has_previous: false
    });

    const [showLedgerModal, setShowLedgerModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [ledgerDetails, setLedgerDetails] = useState([]);
    const [invoiceDetails, setInvoiceDetails] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    // Page size options
    const pageSizeOptions = [10, 20, 50, 100];

    useEffect(() => {
        fetchDebtorsData(1); // Start with page 1
    }, []);

    // Fetch data when search term changes (with debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDebtorsData(1, searchTerm); // Reset to page 1 when searching
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Fetch data when page size changes
    useEffect(() => {
        fetchDebtorsData(1, searchTerm); // Reset to page 1 when page size changes
    }, [pageSize]);

    const fetchDebtorsData = async (page = 1, search = '') => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            // Build query parameters
            let url = `${API_BASE_URL}/get-debtors-data/?page=${page}&page_size=${pageSize}`;
            if (search.trim()) {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setDebtorsData(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setError(response.data.error || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch debtors data');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages && newPage !== pagination.current_page) {
            fetchDebtorsData(newPage, searchTerm);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageSizeChange = (e) => {
        const newPageSize = parseInt(e.target.value);
        setPageSize(newPageSize);
    };

    const fetchLedgerDetails = async (accountCode) => {
        try {
            setModalLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/get-ledger-details/?account_code=${accountCode}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setLedgerDetails(response.data.data);
            } else {
                setError(response.data.error || 'Failed to fetch ledger details');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch ledger details');
        } finally {
            setModalLoading(false);
        }
    };

    const fetchInvoiceDetails = async (accountCode) => {
        try {
            setModalLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/get-invoice-details/?account_code=${accountCode}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setInvoiceDetails(response.data.data);
            } else {
                setError(response.data.error || 'Failed to fetch invoice details');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch invoice details');
        } finally {
            setModalLoading(false);
        }
    };

    const handleLedgerEyeClick = (account) => {
        setSelectedAccount(account);
        setShowLedgerModal(true);
        fetchLedgerDetails(account.code);
    };

    const handleInvoiceEyeClick = (account) => {
        setSelectedAccount(account);
        setShowInvoiceModal(true);
        fetchInvoiceDetails(account.code);
    };

    const closeModal = () => {
        setShowLedgerModal(false);
        setShowInvoiceModal(false);
        setSelectedAccount(null);
        setLedgerDetails([]);
        setInvoiceDetails([]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0.00';
        return parseFloat(amount).toFixed(2);
    };

    // Calculate balance (debit - credit)
    const calculateBalance = (debit, credit) => {
        const debitAmount = parseFloat(debit || 0);
        const creditAmount = parseFloat(credit || 0);
        return debitAmount - creditAmount;
    };

    const renderPagination = () => {
        const { current_page, total_pages, total_records } = pagination;
        
        if (total_pages <= 1) return null;

        const maxVisiblePages = 5;
        const startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(total_pages, startPage + maxVisiblePages - 1);
        const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

        const pages = [];
        for (let i = adjustedStartPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="pagination-container">
                <div className="pagination-info">
                    Showing page {current_page} of {total_pages} 
                    {searchTerm ? ` (filtered from ${total_records} total records)` : ` (${total_records} total records)`}
                </div>
                <div className="pagination-controls">
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(1)} 
                        disabled={current_page === 1 || loading}
                    >
                        First
                    </button>
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(current_page - 1)} 
                        disabled={current_page === 1 || loading}
                    >
                        Previous
                    </button>
                    {pages.map(page => (
                        <button
                            key={page}
                            className={`pagination-btn ${page === current_page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                            disabled={loading}
                        >
                            {page}
                        </button>
                    ))}
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(current_page + 1)} 
                        disabled={current_page === total_pages || loading}
                    >
                        Next
                    </button>
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(total_pages)} 
                        disabled={current_page === total_pages || loading}
                    >
                        Last
                    </button>
                </div>
            </div>
        );
    };

    const LedgerModal = () => showLedgerModal && (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content ledger-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Ledger Details - {selectedAccount?.name}</h3>
                    <button onClick={closeModal} className="modal-close">&times;</button>
                </div>
                <div className="modal-body">
                    {modalLoading ? (
                        <div className="modal-loading">Loading ledger details...</div>
                    ) : ledgerDetails.length === 0 ? (
                        <div className="no-data">No ledger entries found for this account.</div>
                    ) : (
                        <div className="ledger-table-container">
                            <table className="ledger-details-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Particulars</th>
                                        <th>Voucher No</th>
                                        <th>Mode</th>
                                        <th>Debit</th>
                                        <th>Credit</th>
                                        <th>Narration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerDetails.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(entry.entry_date)}</td>
                                            <td className="particulars-cell">{entry.particulars || 'N/A'}</td>
                                            <td className="voucher-cell">{entry.voucher_no || 'N/A'}</td>
                                            <td className="mode-cell">{entry.entry_mode || 'N/A'}</td>
                                            <td className="currency">₹{formatCurrency(entry.debit)}</td>
                                            <td className="currency">₹{formatCurrency(entry.credit)}</td>
                                            <td className="narration-cell">{entry.narration || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const InvoiceModal = () => showInvoiceModal && (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content invoice-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Invoice Details - {selectedAccount?.name}</h3>
                    <button onClick={closeModal} className="modal-close">&times;</button>
                </div>
                <div className="modal-body">
                    {modalLoading ? (
                        <div className="modal-loading">Loading invoice details...</div>
                    ) : invoiceDetails.length === 0 ? (
                        <div className="no-data">No invoice entries found for this account.</div>
                    ) : (
                        <div className="invoice-table-container">
                            <table className="invoice-details-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Reference</th>
                                        <th>Payment Mode</th>
                                        <th>Net Total</th>
                                        <th>Paid</th>
                                        {/* <th>Balance</th> */}
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceDetails.map((invoice, index) => {
                                        const balance = parseFloat(invoice.nettotal || 0) - parseFloat(invoice.paid || 0);
                                        return (
                                            <tr key={index}>
                                                <td>{formatDate(invoice.invdate)}</td>
                                                <td className="bill-ref-cell">{invoice.bill_ref || 'N/A'}</td>
                                                <td className="payment-mode-cell">{invoice.modeofpayment || 'N/A'}</td>
                                                <td className="currency">₹{formatCurrency(invoice.nettotal)}</td>
                                                <td className="currency">₹{formatCurrency(invoice.paid)}</td>
                                                {/* <td className={`currency ${balance > 0 ? 'balance-due' : 'balance-paid'}`}>
                                                    ₹{formatCurrency(balance)}
                                                </td> */}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="all-body">
            <div className="debtors-container">
                <h2>Debtors Statement</h2>

                {/* Updated search and filter container */}
                <div className="search-filter-container">
                    <div className="search-row">
                        <div className="search-group">
                            <label htmlFor="searchInput">Search</label>
                            <input
                                id="searchInput"
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="search-group">
                            <label htmlFor="pageSize">Rows Count</label>
                            <select
                                id="pageSize"
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="page-size-select"
                                disabled={loading}
                            >
                                {pageSizeOptions.map(size => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="search-buttons">
                            {searchTerm && (
                                <button 
                                    className="clear-btn"
                                    onClick={() => setSearchTerm('')}
                                    disabled={loading}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    </div>

                    {(searchTerm || pageSize !== 20) && (
                        <div className="search-results-info">
                            {searchTerm && `Searching for: "${searchTerm}"`}
                            {searchTerm && pageSize !== 20 && ' | '}
                            {pageSize !== 20 && `Showing ${pageSize} rows per page`}
                            <span 
                                className="clear-search" 
                                onClick={() => {
                                    setSearchTerm('');
                                    setPageSize(20);
                                }}
                            >
                                Reset Filters
                            </span>
                        </div>
                    )}
                </div>

                {error && <div className="error">{error}</div>}
                {loading && <div className="loading">Loading...</div>}

                {!loading && debtorsData.length === 0 && !error && (
                    <p className="no-data">
                        {searchTerm ? `No records found matching "${searchTerm}".` : "No debtor records found."}
                    </p>
                )}

                {!loading && debtorsData.length > 0 && (
                    <>
                        <div className="table-container">
                            <div className="table-wrapper">
                                <table className="debtors-table">
                                    <thead>
                                        <tr>
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
                                        {debtorsData.map((item, index) => {
                                            const balance = calculateBalance(item.master_debit, item.master_credit);
                                            return (
                                                <tr key={`${item.code}-${index}`}>
                                                    <td className="account-code">{item.code}</td>
                                                    <td className="account-name">{item.name || 'N/A'}</td>
                                                    <td className="eye-icon-cell">
                                                        <button 
                                                            className="eye-icon-btn" 
                                                            onClick={() => handleLedgerEyeClick(item)}
                                                            title="View Ledger Details"
                                                        >
                                                            👁️
                                                        </button>
                                                    </td>
                                                    <td className="eye-icon-cell">
                                                        <button 
                                                            className="eye-icon-btn" 
                                                            onClick={() => handleInvoiceEyeClick(item)}
                                                            title="View Invoice Details"
                                                        >
                                                            👁️
                                                        </button>
                                                    </td>
                                                    <td>{item.place || 'N/A'}</td>
                                                    <td>{item.phone2 || 'N/A'}</td>
                                                    <td className="currency">₹{formatCurrency(item.opening_balance)}</td>
                                                    <td className="currency">₹{formatCurrency(item.master_debit)}</td>
                                                    <td className="currency">₹{formatCurrency(item.master_credit)}</td>
                                                    <td className={`currency balance-cell ${balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
                                                        ₹{formatCurrency(Math.abs(balance))} {balance >= 0 ? '' : ''}
                                                    </td>
                                                    <td className="opening-dept">{item.openingdepartment || 'N/A'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {renderPagination()}
                    </>
                )}
            </div>

            <LedgerModal />
            <InvoiceModal />
        </div>
    );
};

export default Debtors;