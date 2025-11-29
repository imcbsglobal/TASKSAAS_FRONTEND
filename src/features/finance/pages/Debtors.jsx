import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../services/api';
import '../styles/Debtors.scss';

const Debtors = () => {
    const navigate = useNavigate();
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    useEffect(() => {
        fetchDebtorsData();
    }, []);

    useEffect(() => {
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            const filtered = allData.filter(item =>
                (item.name || '').toLowerCase().includes(search) ||
                (item.code || '').toLowerCase().includes(search) ||
                (item.place || '').toLowerCase().includes(search)
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(allData);
        }
    }, [searchTerm, allData]);

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
                
                // Sort alphabetically by name
                const sorted = [...filteredData].sort((a, b) => {
                    const nameA = (a.name || '').toLowerCase();
                    const nameB = (b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                
                setAllData(sorted);
                setFilteredData(sorted);
            } else {
                setError(response.data.error || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch debtors data');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAccount = (account) => {
        setSelectedAccount(account);
        setIsOpen(false);
        setSearchTerm('');
        
        // Navigate to ledger page
        navigate(`/debtors/ledger/${account.code}`, {
            state: { accountName: account.name, accountData: account }
        });
    };

    const clearSelection = () => {
        setSelectedAccount(null);
        setSearchTerm('');
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0.00';
        return parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
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
                    {/* Header */}
                    <header className="dbt-card-header">
                        <div className="dbt-header-content">
                            <div className="dbt-header-left">
                                <h1 className="dbt-title">Debtors Ledger</h1>
                                <p className="dbt-subtitle">Select an account to view ledger details</p>
                            </div>
                            <button 
                                className="dbt-refresh-btn" 
                                onClick={fetchDebtorsData}
                                disabled={loading}
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </header>

                    {/* Error State */}
                    {error && (
                        <div className="dbt-error">⚠️ Error: {error}</div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="dbt-loading">Loading debtors data...</div>
                    )}

                    {/* Dropdown Section */}
                    {!loading && !error && (
                        <div className="dbt-dropdown-section">
                            <label className="dbt-dropdown-label">Select Debtor Account</label>
                            
                            {/* Dropdown Button */}
                            <div className="dbt-dropdown-container">
                                <button
                                    className="dbt-dropdown-button"
                                    onClick={() => setIsOpen(!isOpen)}
                                    disabled={loading}
                                >
                                    <span className="dbt-dropdown-text">
                                        {selectedAccount ? (
                                            <>
                                                <span>{selectedAccount.name}</span>
                                                {selectedAccount.place && (
                                                    <>
                                                        <span className="dbt-dropdown-separator">•</span>
                                                        <span className="dbt-dropdown-place">{selectedAccount.place}</span>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            'Choose an account...'
                                        )}
                                    </span>
                                    <span className={`dbt-dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                                </button>

                                {/* Dropdown Menu */}
                                {isOpen && (
                                    <div className="dbt-dropdown-menu">
                                        {/* Search Box */}
                                        <div className="dbt-dropdown-search">
                                            <span className="dbt-search-icon">🔍</span>
                                            <input
                                                type="text"
                                                placeholder="Search by name, code, or place..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="dbt-dropdown-search-input"
                                            />
                                            {searchTerm && (
                                                <button
                                                    className="dbt-search-clear"
                                                    onClick={() => setSearchTerm('')}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        {/* Options List */}
                                        <div className="dbt-dropdown-list">
                                            {filteredData.length === 0 ? (
                                                <div className="dbt-dropdown-empty">
                                                    {searchTerm ? `No accounts found matching "${searchTerm}"` : 'No accounts available'}
                                                </div>
                                            ) : (
                                                filteredData.map((account) => (
                                                        <button
                                                            key={account.code}
                                                            className="dbt-dropdown-item"
                                                            onClick={() => handleSelectAccount(account)}
                                                        >
                                                            <div className="dbt-dropdown-item-main">
                                                                <div className="dbt-dropdown-item-info">
                                                                    <div className="dbt-dropdown-item-name">{account.name}</div>
                                                                    {account.place && (
                                                                        <div className="dbt-dropdown-item-place">📍 {account.place}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))
                                                )
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selected Account Info */}
                            {selectedAccount && (
                                <div className="dbt-selected-account">
                                    <div className="dbt-selected-account-inner">
                                        <div className="dbt-selected-account-header">
                                            <h3 className="dbt-selected-account-title">Selected Account</h3>
                                            <button
                                                className="dbt-clear-selection"
                                                onClick={clearSelection}
                                                title="Clear selection"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="dbt-selected-account-details">
                                            <p><span className="label">Code:</span> <span className="value code">{selectedAccount.code}</span></p>
                                            <p><span className="label">Name:</span> <span className="value">{selectedAccount.name}</span></p>
                                            {selectedAccount.place && (
                                                <p><span className="label">Place:</span> <span className="value">{selectedAccount.place}</span></p>
                                            )}
                                        </div>
                                        <div className="dbt-selected-account-stats">
                                            <div className="stat-card">
                                                <div className="stat-label">Debit</div>
                                                <div className="stat-value">₹{formatCurrency(selectedAccount.master_debit)}</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-label">Credit</div>
                                                <div className="stat-value">₹{formatCurrency(selectedAccount.master_credit)}</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-label">Balance</div>
                                                <div className={`stat-value ${
                                                    calculateBalance(selectedAccount.master_debit, selectedAccount.master_credit) >= 0
                                                        ? 'positive'
                                                        : 'negative'
                                                }`}>
                                                    ₹{formatCurrency(Math.abs(calculateBalance(selectedAccount.master_debit, selectedAccount.master_credit)))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stats */}
                            {allData.length > 0 && (
                                <div className="dbt-total-stats">
                                    Total Accounts: <span className="highlight">{allData.length}</span>
                                    {searchTerm && filteredData.length !== allData.length && (
                                        <> | Filtered: <span className="highlight">{filteredData.length}</span></>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Debtors;