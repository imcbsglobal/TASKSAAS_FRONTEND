import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../services/api';
import '../styles/InvoicePage.scss';

const InvoicePage = () => {
    const { accountCode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [invoiceDetails, setInvoiceDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Get account info from location state or use default
    const accountName = location.state?.accountName || 'Account';
    const accountData = location.state?.accountData || null;

    useEffect(() => {
        if (accountCode) {
            fetchInvoiceDetails();
        }
    }, [accountCode]);

    const fetchInvoiceDetails = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/get-invoice-details/?account_code=${accountCode}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Sort invoices by date (newest to oldest)
                const sortedData = [...response.data.data].sort((a, b) => {
                    const dateA = new Date(a.invdate || 0);
                    const dateB = new Date(b.invdate || 0);
                    return dateB - dateA;
                });
                setInvoiceDetails(sortedData);
            } else {
                setError(response.data.error || 'Failed to fetch invoice details');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch invoice details');
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

    // Calculate totals
    const totals = invoiceDetails.reduce(
        (acc, invoice) => {
            acc.netTotal += parseFloat(invoice.nettotal || 0);
            acc.paid += parseFloat(invoice.paid || 0);
            return acc;
        },
        { netTotal: 0, paid: 0 }
    );

    const totalBalance = totals.netTotal - totals.paid;

    return (
        <div className="invoice-page-root">
            <div className="inv-page">

                <div className="inv-card">
                    <div className="inv-card-inner">
                        {/* Header */}
                        <header className="inv-card-header">
                            <button className="inv-back-btn" onClick={handleBack} title="Back to Debtors">
                                ← Back
                            </button>
                            <div className="inv-header-content">
                                <div className="inv-header-left">
                                    <h1 className="inv-title">Invoice Details</h1>
                                    <p className="inv-subtitle">
                                        Account: <span className="inv-account-name">{accountName}</span> 
                                        <span className="inv-account-code"> (Code: {accountCode})</span>
                                    </p>
                                </div>
                                <button 
                                    className="inv-refresh-btn" 
                                    onClick={fetchInvoiceDetails}
                                    disabled={loading}
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                        </header>

                        {/* Summary Cards */}
                        {invoiceDetails.length > 0 && (
                            <div className="inv-summary-cards">
                                <div className="inv-summary-card">
                                    <div className="inv-summary-label">Total Invoices</div>
                                    <div className="inv-summary-value">{invoiceDetails.length}</div>
                                </div>
                                <div className="inv-summary-card inv-summary-nettotal">
                                    <div className="inv-summary-label">Total Amount</div>
                                    <div className="inv-summary-value">₹{formatCurrency(totals.netTotal)}</div>
                                </div>
                                <div className="inv-summary-card inv-summary-paid">
                                    <div className="inv-summary-label">Total Paid</div>
                                    <div className="inv-summary-value">₹{formatCurrency(totals.paid)}</div>
                                </div>
                                <div className="inv-summary-card inv-summary-balance">
                                    <div className="inv-summary-label">Balance Due</div>
                                    <div className={`inv-summary-value ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
                                        ₹{formatCurrency(Math.abs(totalBalance))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="inv-loading">
                                <div className="inv-spinner"></div>
                                <p>Loading invoice details...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="inv-error">
                                <span className="inv-error-icon">⚠️</span>
                                Error: {error}
                            </div>
                        )}

                        {/* Invoice Table */}
                        {!loading && !error && (
                            <>
                                {invoiceDetails.length === 0 ? (
                                    <div className="inv-no-data">
                                        <div className="inv-no-data-icon">📋</div>
                                        <p>No invoice entries found for this account.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="inv-table-info">
                                            <span className="inv-entries-count">
                                                Total Invoices: <strong>{invoiceDetails.length}</strong>
                                            </span>
                                        </div>

                                        <div className="inv-table-wrap">
                                            <table className="inv-invoice-table">
                                                <thead>
                                                    <tr>
                                                        <th className="inv-col-no">No</th>
                                                        <th className="inv-col-date">Date</th>
                                                        <th className="inv-col-reference">Reference</th>
                                                        <th className="inv-col-mode">Payment Mode</th>
                                                        <th className="inv-col-amount">Net Total</th>
                                                        <th className="inv-col-amount">Paid</th>
                                                        <th className="inv-col-amount">Balance</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {invoiceDetails.map((invoice, index) => {
                                                        const netTotal = parseFloat(invoice.nettotal || 0);
                                                        const paid = parseFloat(invoice.paid || 0);
                                                        const balance = netTotal - paid;
                                                        
                                                        return (
                                                            <tr key={index}>
                                                                <td data-label="No" className="inv-col-no">{index + 1}</td>
                                                                <td data-label="Date" className="inv-col-date">
                                                                    {formatDate(invoice.invdate)}
                                                                </td>
                                                                <td data-label="Reference" className="inv-col-reference">
                                                                    {invoice.bill_ref || 'N/A'}
                                                                </td>
                                                                <td data-label="Mode" className="inv-col-mode">
                                                                    <span className={`inv-mode-badge inv-mode-${(invoice.modeofpayment || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                                                        {invoice.modeofpayment || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td data-label="Net Total" className="inv-col-amount inv-amount-nettotal">
                                                                    ₹{formatCurrency(invoice.nettotal)}
                                                                </td>
                                                                <td data-label="Paid" className="inv-col-amount inv-amount-paid">
                                                                    ₹{formatCurrency(invoice.paid)}
                                                                </td>
                                                                <td data-label="Balance" className={`inv-col-amount inv-balance ${
                                                                    balance >= 0 ? 'positive' : 'negative'
                                                                }`}>
                                                                    ₹{formatCurrency(Math.abs(balance))}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="inv-totals-row">
                                                        <td colSpan="4" className="inv-totals-label">Total</td>
                                                        <td className="inv-col-amount inv-amount-nettotal inv-total" data-label="Net Total">
                                                            ₹{formatCurrency(totals.netTotal)}
                                                        </td>
                                                        <td className="inv-col-amount inv-amount-paid inv-total" data-label="Paid">
                                                            ₹{formatCurrency(totals.paid)}
                                                        </td>
                                                        <td className={`inv-col-amount inv-total ${
                                                            totalBalance >= 0 ? 'positive' : 'negative'
                                                        }`} data-label="Balance">
                                                            ₹{formatCurrency(Math.abs(totalBalance))}
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
        </div>
    );
};

export default InvoicePage;
