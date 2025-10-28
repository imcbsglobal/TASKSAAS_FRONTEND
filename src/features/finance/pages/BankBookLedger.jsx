import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../services/api';
import '../styles/Debtors.scss';

const BankBookLedger = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [ledgerData, setLedgerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const { accountCode, accountName } = location.state || {};

    useEffect(() => {
        if (!accountCode) {
            setError('No account code provided');
            setLoading(false);
            return;
        }

        fetchLedgerData();
    }, [accountCode]);

    const fetchLedgerData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/get-bank-ledger-details/?account_code=${accountCode}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                // Filter data to show only last 3 days (today and 2 days back)
                const today = new Date();
                today.setHours(23, 59, 59, 999); // End of today
                
                const threeDaysAgo = new Date(today);
                threeDaysAgo.setDate(today.getDate() - 2); // 2 days before today
                threeDaysAgo.setHours(0, 0, 0, 0); // Start of that day
                
                const filteredData = response.data.data.filter(entry => {
                    const entryDate = new Date(entry.entry_date);
                    return entryDate >= threeDaysAgo && entryDate <= today;
                });
                
                // Sort by date descending (most recent first)
                filteredData.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
                
                setLedgerData(filteredData);
            } else {
                setError(response.data.error || 'Failed to fetch ledger details');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.response?.data?.error || 'Failed to fetch ledger details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0.00';
        return parseFloat(amount).toFixed(2);
    };

    const handleBackClick = () => {
        navigate(-1); // Go back to previous page
    };

    // Calculate running balance
    const calculateRunningBalance = () => {
        let runningBalance = 0;
        return ledgerData.map(entry => {
            const debit = parseFloat(entry.debit || 0);
            const credit = parseFloat(entry.credit || 0);
            runningBalance += (debit - credit);
            return {
                ...entry,
                runningBalance: runningBalance
            };
        });
    };

    const ledgerWithBalance = calculateRunningBalance();

    return (
        <div className="all-body">
            <div className="debtors-container">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <button 
                        onClick={handleBackClick}
                        style={{
                            background: '#1976d2',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '20px',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        ← Back to Bank Book
                    </button>
                    <div>
                        <h2>Bank Ledger Details - {accountName} ({accountCode})</h2>
                        <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
                            Showing last 3 days (Today and 2 days back)
                        </p>
                    </div>
                </div>

                {error && <div className="error">{error}</div>}
                {loading && <div className="loading">Loading ledger details...</div>}

                {!loading && ledgerData.length === 0 && !error && (
                    <p className="no-data">No ledger entries found for this bank account in the last 3 days.</p>
                )}

                {!loading && ledgerData.length > 0 && (
                    <div className="table-container">
                        <div className="table-wrapper">
                            <table className="debtors-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Particulars</th>
                                        <th>Voucher No</th>
                                        <th>Mode</th>
                                        <th>Debit</th>
                                        <th>Credit</th>
                                        <th>Balance</th>
                                        <th>Narration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerWithBalance.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(entry.entry_date)}</td>
                                            <td className="particulars-cell">{entry.particulars || 'N/A'}</td>
                                            <td className="voucher-cell">{entry.voucher_no || 'N/A'}</td>
                                            <td className="mode-cell">{entry.entry_mode || 'N/A'}</td>
                                            <td className="currency">₹{formatCurrency(entry.debit)}</td>
                                            <td className="currency">₹{formatCurrency(entry.credit)}</td>
                                            <td className="currency" style={{
                                                color: entry.runningBalance >= 0 ? '#4caf50' : '#f44336',
                                                fontWeight: 'bold'
                                            }}>
                                                ₹{formatCurrency(Math.abs(entry.runningBalance))}
                                                {entry.runningBalance < 0 ? ' Dr' : ' Cr'}
                                            </td>
                                            <td className="narration-cell">{entry.narration || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankBookLedger;