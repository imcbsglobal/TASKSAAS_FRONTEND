import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../services/api';
import '../styles/LedgerPage.scss';

const LedgerPage = () => {
    const { accountCode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [ledgerDetails, setLedgerDetails] = useState([]);
    const [filteredLedgerDetails, setFilteredLedgerDetails] = useState([]);
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Date filter states
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    // Get account info from location state (will be null on refresh)
    const accountName = location.state?.accountName || accountInfo?.name || 'Account';
    const accountData = location.state?.accountData || null;

    useEffect(() => {
        if (accountCode) {
            fetchAccountAndLedger();
        }
    }, []);

    useEffect(() => {
        applyDateFilter();
    }, [ledgerDetails, fromDate, toDate]);

    const fetchAccountAndLedger = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch both account info and ledger details
            const [accountResponse, ledgerResponse] = await Promise.all([
                axios.get('https://tasksas.com/api/debtors/get-debtors/', { headers }),
                axios.get(`${API_BASE_URL}/get-ledger-details/?account_code=${accountCode}`, { headers })
            ]);

            // Get account info
            if (accountResponse.data.success && accountResponse.data.data) {
                const account = accountResponse.data.data.find(acc => acc.code === accountCode);
                if (account) {
                    console.log('Found account info:', account);
                    setAccountInfo(account);
                }
            }

            // Get and sort ledger details
            if (ledgerResponse.data.success) {
                const sortedData = [...ledgerResponse.data.data].sort((a, b) => {
                    const dateA = new Date(a.entry_date || 0);
                    const dateB = new Date(b.entry_date || 0);
                    return dateA - dateB;
                });
                console.log('Ledger entries:', sortedData.length);
                setLedgerDetails(sortedData);
            } else {
                setError(ledgerResponse.data.error || 'Failed to fetch ledger details');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch data');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyDateFilter = () => {
        if (!fromDate && !toDate) {
            setFilteredLedgerDetails(ledgerDetails);
            return;
        }

        const filtered = ledgerDetails.filter(entry => {
            const entryDate = new Date(entry.entry_date);
            
            if (fromDate && toDate) {
                const from = new Date(fromDate);
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                return entryDate >= from && entryDate <= to;
            } else if (fromDate) {
                const from = new Date(fromDate);
                return entryDate >= from;
            } else if (toDate) {
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                return entryDate <= to;
            }
            
            return true;
        });

        setFilteredLedgerDetails(filtered);
    };

    const handleClearFilter = () => {
        setFromDate('');
        setToDate('');
    };

    const handleBack = () => {
        navigate('/debtors');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Calculate totals from ALL ledger entries
    const allLedgerTotals = ledgerDetails.reduce(
        (acc, entry) => {
            acc.debit += parseFloat(entry.debit || 0);
            acc.credit += parseFloat(entry.credit || 0);
            return acc;
        },
        { debit: 0, credit: 0 }
    );

    console.log('All ledger totals calculated:', allLedgerTotals);

    // Get opening balance
    const openingBalance = parseFloat(
        accountData?.opening_balance || 
        accountInfo?.opening_balance || 
        0
    );

    // Total debit and credit - use passed data first, fallback to calculated
    const totalDebit = accountData?.master_debit || allLedgerTotals.debit;
    const totalCredit = accountData?.master_credit || allLedgerTotals.credit;

    console.log('Summary values:', {
        openingBalance,
        totalDebit,
        totalCredit,
        fromAccountData: !!accountData?.master_debit,
        fromCalculation: !accountData?.master_debit
    });

    // FIXED: Current balance = opening + debit - credit (simple debit-credit logic)
    const currentBalance = openingBalance + totalDebit - totalCredit;

    // Calculate running balance for each row
    const calculateRunningBalances = (entries) => {
        let runningBalance = openingBalance;
        
        return entries.map((entry) => {
            const debit = parseFloat(entry.debit || 0);
            const credit = parseFloat(entry.credit || 0);
            // FIXED: Balance = previous balance + debit - credit
            runningBalance = runningBalance + debit - credit;
            
            return {
                ...entry,
                runningBalance: runningBalance
            };
        });
    };

    // Get entries with running balances
    const entriesWithBalance = calculateRunningBalances(filteredLedgerDetails);

    // Totals over FILTERED rows
    const filteredTotals = filteredLedgerDetails.reduce(
        (acc, entry) => {
            acc.debit += parseFloat(entry.debit || 0);
            acc.credit += parseFloat(entry.credit || 0);
            return acc;
        },
        { debit: 0, credit: 0 }
    );

    // FIXED: Final balance = opening + filtered debit - filtered credit
    const finalBalance = openingBalance + filteredTotals.debit - filteredTotals.credit;

    return (
        <div className="ldg-page">
            <div className="ldg-card">
                <div className="ldg-card-inner">
                    {/* Header */}
                    <header className="ldg-card-header">
                        <button className="ldg-back-btn" onClick={handleBack} title="Back to Debtors">
                            ← Back
                        </button>
                        <div className="ldg-header-content">
                            <div className="ldg-header-left">
                                <h1 className="ldg-title">Ledger Details</h1>
                                <p className="ldg-subtitle">
                                    Account: <span className="ldg-account-name">{accountName}</span> 
                                    <span className="ldg-account-code"> (Code: {accountCode})</span>
                                </p>
                            </div>
                            <button 
                                className="ldg-refresh-btn" 
                                onClick={fetchAccountAndLedger}
                                disabled={loading}
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </header>

                    {/* Date Filter */}
                    <div className="ldg-date-filter">
                        <div className="ldg-filter-title">
                            📅 Filter by Date Range
                        </div>
                        <div className="ldg-filter-controls">
                            <div className="ldg-filter-group">
                                <label htmlFor="fromDate" className="ldg-filter-label">From Date</label>
                                <input
                                    type="date"
                                    id="fromDate"
                                    className="ldg-date-input"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                            <div className="ldg-filter-group">
                                <label htmlFor="toDate" className="ldg-filter-label">To Date</label>
                                <input
                                    type="date"
                                    id="toDate"
                                    className="ldg-date-input"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                            <button 
                                className="ldg-clear-filter-btn"
                                onClick={handleClearFilter}
                                disabled={!fromDate && !toDate}
                            >
                                Clear Filter
                            </button>
                        </div>
                        {(fromDate || toDate) && (
                            <div className="ldg-filter-info">
                                Showing {filteredLedgerDetails.length} of {ledgerDetails.length} entries
                            </div>
                        )}
                    </div>

                    {/* Account Summary - Always show if we have data */}
                    {ledgerDetails.length > 0 && (
                        <div className="ldg-summary-cards">
                            <div className="ldg-summary-card">
                                <div className="ldg-summary-label">Opening Balance</div>
                                <div className={`ldg-summary-value ${openingBalance < 0 ? 'negative' : ''}`}>
                                    ₹{formatCurrency(openingBalance)}
                                </div>
                            </div>
                            <div className="ldg-summary-card ldg-summary-debit">
                                <div className="ldg-summary-label">Total Debit</div>
                                <div className="ldg-summary-value">
                                    ₹{formatCurrency(totalDebit)}
                                </div>
                            </div>
                            <div className="ldg-summary-card ldg-summary-credit">
                                <div className="ldg-summary-label">Total Credit</div>
                                <div className="ldg-summary-value">
                                    ₹{formatCurrency(totalCredit)}
                                </div>
                            </div>
                            <div className="ldg-summary-card ldg-summary-balance">
                                <div className="ldg-summary-label">Current Balance</div>
                                <div className={`ldg-summary-value ${currentBalance < 0 ? 'negative' : ''}`}>
                                    ₹{formatCurrency(currentBalance)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="ldg-loading">
                            <div className="ldg-spinner"></div>
                            <p>Loading ledger details...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="ldg-error">
                            <span className="ldg-error-icon">⚠️</span>
                            Error: {error}
                        </div>
                    )}

                    {/* Ledger Table */}
                    {!loading && !error && (
                        <>
                            {filteredLedgerDetails.length === 0 ? (
                                <div className="ldg-no-data">
                                    <div className="ldg-no-data-icon">📋</div>
                                    <p>
                                        {ledgerDetails.length === 0 
                                            ? 'No ledger entries found for this account.'
                                            : 'No entries found for the selected date range.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="ldg-table-info">
                                        <span className="ldg-entries-count">
                                            Total Entries: <strong>{filteredLedgerDetails.length}</strong>
                                        </span>
                                    </div>

                                    <div className="ldg-table-wrap">
                                        <table className="ldg-ledger-table">
                                            <thead>
                                                <tr>
                                                    <th className="ldg-col-no">No</th>
                                                    <th className="ldg-col-date">Date</th>
                                                    <th className="ldg-col-particulars">Particulars</th>
                                                    <th className="ldg-col-voucher">Voucher No</th>
                                                    <th className="ldg-col-mode">Mode</th>
                                                    <th className="ldg-col-amount">Debit</th>
                                                    <th className="ldg-col-amount">Credit</th>
                                                    <th className="ldg-col-amount">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entriesWithBalance.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td data-label="No" className="ldg-col-no">{index + 1}</td>
                                                        <td data-label="Date" className="ldg-col-date">
                                                            {formatDate(entry.entry_date)}
                                                        </td>
                                                        <td data-label="Particulars" className="ldg-col-particulars">
                                                            <div className="ldg-particulars-main">
                                                                {entry.particulars || 'N/A'}
                                                            </div>
                                                            {entry.narration && (
                                                                <div className="ldg-narration-text">
                                                                    {entry.narration}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td data-label="Voucher" className="ldg-col-voucher">
                                                            {entry.voucher_no || 'N/A'}
                                                        </td>
                                                        <td data-label="Mode" className="ldg-col-mode">
                                                            <span className={`ldg-mode-badge ldg-mode-${(entry.entry_mode || '').toLowerCase()}`}>
                                                                {entry.entry_mode || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td data-label="Debit" className="ldg-col-amount ldg-amount-debit">
                                                            {entry.debit && parseFloat(entry.debit) !== 0
                                                                ? formatCurrency(entry.debit)
                                                                : '-'}
                                                        </td>
                                                        <td data-label="Credit" className="ldg-col-amount ldg-amount-credit">
                                                            {entry.credit && parseFloat(entry.credit) !== 0
                                                                ? formatCurrency(entry.credit)
                                                                : '-'}
                                                        </td>
                                                        <td
                                                            data-label="Balance"
                                                            className={`ldg-col-amount ldg-balance ${
                                                                entry.runningBalance < 0 ? 'negative' : ''
                                                            }`}
                                                        >
                                                            {formatCurrency(entry.runningBalance)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="ldg-totals-row">
                                                    <td colSpan="5" className="ldg-totals-label">Total</td>
                                                    <td className="ldg-col-amount ldg-amount-debit ldg-total">
                                                        {formatCurrency(filteredTotals.debit)}
                                                    </td>
                                                    <td className="ldg-col-amount ldg-amount-credit ldg-total">
                                                        {formatCurrency(filteredTotals.credit)}
                                                    </td>
                                                    <td className={`ldg-col-amount ldg-total ${
                                                        finalBalance < 0 ? 'negative' : 'positive'
                                                    }`}>
                                                        ₹{formatCurrency(finalBalance)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LedgerPage;