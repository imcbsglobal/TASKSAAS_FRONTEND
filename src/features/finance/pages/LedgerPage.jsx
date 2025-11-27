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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Get account info from location state or use default
    const accountName = location.state?.accountName || 'Account';
    const accountData = location.state?.accountData || null;

    useEffect(() => {
        if (accountCode) {
            fetchLedgerDetails();
        }
    }, [accountCode]);

    const fetchLedgerDetails = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/get-ledger-details/?account_code=${accountCode}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Sort ledger details by date (oldest to newest)
                const sortedData = [...response.data.data].sort((a, b) => {
                    const dateA = new Date(a.entry_date || 0);
                    const dateB = new Date(b.entry_date || 0);
                    return dateA - dateB;
                });
                setLedgerDetails(sortedData);
            } else {
                setError(response.data.error || 'Failed to fetch ledger details');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch ledger details');
        } finally {
            setLoading(false);
        }
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
        if (!amount) return '0.00';
        return parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Calculate running balance
    const calculateRunningBalance = () => {
        let balance = parseFloat(accountData?.opening_balance || 0);
        return ledgerDetails.map((entry) => {
            const debit = parseFloat(entry.debit || 0);
            const credit = parseFloat(entry.credit || 0);
            balance += debit - credit;
            return { ...entry, runningBalance: balance };
        });
    };

    const ledgerWithBalance = calculateRunningBalance();

    // Calculate totals
    const totals = ledgerDetails.reduce(
        (acc, entry) => {
            acc.debit += parseFloat(entry.debit || 0);
            acc.credit += parseFloat(entry.credit || 0);
            return acc;
        },
        { debit: 0, credit: 0 }
    );

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
                                onClick={fetchLedgerDetails}
                                disabled={loading}
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </header>

                    {/* Account Summary */}
                    {accountData && (
                        <div className="ldg-summary-cards">
                            <div className="ldg-summary-card">
                                <div className="ldg-summary-label">Opening Balance</div>
                                <div className="ldg-summary-value">₹{formatCurrency(accountData.opening_balance)}</div>
                            </div>
                            <div className="ldg-summary-card ldg-summary-debit">
                                <div className="ldg-summary-label">Total Debit</div>
                                <div className="ldg-summary-value">₹{formatCurrency(accountData.master_debit)}</div>
                            </div>
                            <div className="ldg-summary-card ldg-summary-credit">
                                <div className="ldg-summary-label">Total Credit</div>
                                <div className="ldg-summary-value">₹{formatCurrency(accountData.master_credit)}</div>
                            </div>
                            <div className="ldg-summary-card ldg-summary-balance">
                                <div className="ldg-summary-label">Current Balance</div>
                                <div className={`ldg-summary-value ${
                                    (parseFloat(accountData.master_debit) - parseFloat(accountData.master_credit)) >= 0 
                                        ? 'positive' 
                                        : 'negative'
                                }`}>
                                    ₹{formatCurrency(Math.abs(
                                        parseFloat(accountData.master_debit || 0) - parseFloat(accountData.master_credit || 0)
                                    ))}
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
                            {ledgerDetails.length === 0 ? (
                                <div className="ldg-no-data">
                                    <div className="ldg-no-data-icon">📋</div>
                                    <p>No ledger entries found for this account.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="ldg-table-info">
                                        <span className="ldg-entries-count">
                                            Total Entries: <strong>{ledgerDetails.length}</strong>
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
                                                    <th className="ldg-col-narration">Narration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ledgerWithBalance.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td data-label="No" className="ldg-col-no">{index + 1}</td>
                                                        <td data-label="Date" className="ldg-col-date">
                                                            {formatDate(entry.entry_date)}
                                                        </td>
                                                        <td data-label="Particulars" className="ldg-col-particulars">
                                                            {entry.particulars || 'N/A'}
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
                                                                ? `₹${formatCurrency(entry.debit)}`
                                                                : '-'}
                                                        </td>
                                                        <td data-label="Credit" className="ldg-col-amount ldg-amount-credit">
                                                            {entry.credit && parseFloat(entry.credit) !== 0
                                                                ? `₹${formatCurrency(entry.credit)}`
                                                                : '-'}
                                                        </td>
                                                        <td data-label="Balance" className={`ldg-col-amount ldg-balance ${
                                                            entry.runningBalance >= 0 ? 'positive' : 'negative'
                                                        }`}>
                                                            ₹{formatCurrency(Math.abs(entry.runningBalance))}
                                                        </td>
                                                        <td data-label="Narration" className="ldg-col-narration">
                                                            {entry.narration || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="ldg-totals-row">
                                                    <td colSpan="5" className="ldg-totals-label">Total</td>
                                                    <td className="ldg-col-amount ldg-amount-debit ldg-total">
                                                        ₹{formatCurrency(totals.debit)}
                                                    </td>
                                                    <td className="ldg-col-amount ldg-amount-credit ldg-total">
                                                        ₹{formatCurrency(totals.credit)}
                                                    </td>
                                                    <td className={`ldg-col-amount ldg-total ${
                                                        (totals.debit - totals.credit) >= 0 ? 'positive' : 'negative'
                                                    }`}>
                                                        ₹{formatCurrency(Math.abs(totals.debit - totals.credit))}
                                                    </td>
                                                    <td></td>
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