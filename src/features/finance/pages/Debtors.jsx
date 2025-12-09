import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../services/api';
import '../styles/Debtors.scss';

// Debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const Debtors = () => {
    const navigate = useNavigate();

    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    // Debounced search
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Balance caching system
    const [balanceCache, setBalanceCache] = useState({});
    const [loadingBalances, setLoadingBalances] = useState(new Set());
    const balanceCacheRef = useRef({});
    const abortControllersRef = useRef({});

    // Virtualization states
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const dropdownListRef = useRef(null);
    const itemHeight = 80; // Approximate height of each dropdown item
    const overscan = 5; // Extra items to render outside visible area

    // ----------------- EFFECTS -----------------

    useEffect(() => {
        fetchDebtorsData();
        
        // Cleanup on unmount
        return () => {
            Object.values(abortControllersRef.current).forEach(controller => {
                controller.abort();
            });
        };
    }, []);

    // Update filtered data with debounced search
    useEffect(() => {
        if (debouncedSearchTerm.trim()) {
            const search = debouncedSearchTerm.toLowerCase();
            const filtered = allData.filter(item =>
                (item.name || '').toLowerCase().includes(search) ||
                (item.code || '').toLowerCase().includes(search) ||
                (item.place || '').toLowerCase().includes(search) ||
                (item.area || '').toLowerCase().includes(search)
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(allData);
        }
        // Reset visible range when filter changes
        setVisibleRange({ start: 0, end: 20 });
    }, [debouncedSearchTerm, allData]);

    // Handle scroll for virtualization
    const handleScroll = useCallback(() => {
        if (!dropdownListRef.current) return;
        
        const scrollTop = dropdownListRef.current.scrollTop;
        const clientHeight = dropdownListRef.current.clientHeight;
        
        const visibleStart = Math.floor(scrollTop / itemHeight);
        const visibleEnd = Math.ceil((scrollTop + clientHeight) / itemHeight);
        
        const start = Math.max(0, visibleStart - overscan);
        const end = Math.min(filteredData.length, visibleEnd + overscan);
        
        setVisibleRange({ start, end });
        
        // Load balances only for visible items
        for (let i = start; i < end; i++) {
            const account = filteredData[i];
            if (account && !balanceCacheRef.current[account.code] && !loadingBalances.has(account.code)) {
                fetchBalance(account.code);
            }
        }
    }, [filteredData, itemHeight, overscan, loadingBalances]);

    // Initial load when dropdown opens
    useEffect(() => {
        if (isOpen && filteredData.length > 0) {
            handleScroll();
        }
    }, [isOpen, filteredData, handleScroll]);

    // Fetch balance for a specific account
    const fetchBalance = useCallback(async (accountCode) => {
        // Check cache first
        if (balanceCacheRef.current[accountCode]) {
            return balanceCacheRef.current[accountCode];
        }

        // Check if already loading
        if (loadingBalances.has(accountCode)) {
            return null;
        }

        try {
            // Mark as loading
            setLoadingBalances(prev => new Set(prev).add(accountCode));

            // Create abort controller for this request
            const controller = new AbortController();
            abortControllersRef.current[accountCode] = controller;

            const token = localStorage.getItem('token');
            if (!token) {
                setLoadingBalances(prev => {
                    const next = new Set(prev);
                    next.delete(accountCode);
                    return next;
                });
                return null;
            }

            const response = await axios.get(
                `${API_BASE_URL}/get-ledger-details/?account_code=${accountCode}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                }
            );

            if (response.data.success) {
                const ledgerDetails = response.data.data || [];
                
                // Calculate totals from ledger
                const totals = ledgerDetails.reduce(
                    (acc, entry) => {
                        acc.debit += parseFloat(entry.debit || 0);
                        acc.credit += parseFloat(entry.credit || 0);
                        return acc;
                    },
                    { debit: 0, credit: 0 }
                );

                // Get account info for opening balance
                const account = allData.find(acc => acc.code === accountCode);
                const openingBalance = parseFloat(account?.opening_balance || 0);
                
                // Calculate current balance
                const currentBalance = openingBalance + totals.debit - totals.credit;

                // Cache the result
                const balanceData = {
                    balance: currentBalance,
                    debit: totals.debit,
                    credit: totals.credit,
                    opening: openingBalance
                };

                balanceCacheRef.current[accountCode] = balanceData;
                setBalanceCache(prev => ({ ...prev, [accountCode]: balanceData }));

                return balanceData;
            }
        } catch (err) {
            if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                console.error(`Error fetching balance for ${accountCode}:`, err);
            }
        } finally {
            setLoadingBalances(prev => {
                const next = new Set(prev);
                next.delete(accountCode);
                return next;
            });
            delete abortControllersRef.current[accountCode];
        }

        return null;
    }, [allData, loadingBalances]);

    // ----------------- API CALLS -----------------

    const fetchDebtorsData = async () => {
        try {
            setLoading(true);
            setError('');
            setSelectedAccount(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await axios.get(
                'https://tasksas.com/api/debtors/get-debtors/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const debtorsData =
                response.data?.success && Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];

            const sorted = [...debtorsData].sort((a, b) => {
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });

            setAllData(sorted);
            setFilteredData(sorted);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    'Failed to fetch debtors data'
            );
            console.error('Error fetching debtors:', err);
        } finally {
            setLoading(false);
        }
    };

    // ----------------- HANDLERS -----------------

    const handleSelectAccount = account => {
        setSelectedAccount(account);
        setIsOpen(false);
        setSearchTerm('');
        
        // Fetch balance for selected account if not cached
        if (!balanceCacheRef.current[account.code]) {
            fetchBalance(account.code);
        }
    };

    const handleShowLedger = account => {
        if (!account) return;

        navigate(`/debtors/ledger/${account.code}`, {
            state: { accountName: account.name, accountData: account }
        });
    };

    const clearSelection = () => {
        setSelectedAccount(null);
        setSearchTerm('');
    };

    // ----------------- HELPERS -----------------

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const renderBalance = (accountCode) => {
        const cached = balanceCache[accountCode];
        const isLoading = loadingBalances.has(accountCode);

        if (isLoading) {
            return <span className="dbt-balance-loading">Loading...</span>;
        }

        if (!cached) {
            return <span className="dbt-balance-placeholder">--</span>;
        }

        const balance = cached.balance;
        
        return (
            <span className={`dbt-balance-amount ${balance >= 0 ? 'dbt-balance-positive' : 'dbt-balance-negative'}`}>
                {formatCurrency(balance)}
            </span>
        );
    };

    // Calculate virtualization values
    const visibleAccounts = filteredData.slice(visibleRange.start, visibleRange.end);
    const offsetY = visibleRange.start * itemHeight;
    const totalHeight = filteredData.length * itemHeight;

    // ----------------- RENDER -----------------

    return (
        <div className="dbt-page">
            <div className="dbt-card">
                <div className="dbt-card-inner">
                    {/* Header */}
                    <header className="dbt-card-header">
                        <div className="dbt-header-content">
                            <div className="dbt-header-left">
                                <h1 className="dbt-title">Debtors Ledger</h1>
                                <p className="dbt-subtitle">
                                    Select an account to view ledger details
                                </p>
                            </div>
                            <button
                                className="dbt-refresh-btn"
                                onClick={fetchDebtorsData}
                                disabled={loading}
                            >
                                🔄 {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                    </header>

                    {/* Error */}
                    {error && (
                        <div className="dbt-error">⚠️ Error: {error}</div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="dbt-loading">
                            Loading debtors data...
                        </div>
                    )}

                    {/* Main content */}
                    {!loading && !error && (
                        <>
                            {/* Dropdown Section */}
                            <div className="dbt-dropdown-section">
                                <label className="dbt-dropdown-label">
                                    Select Debtor Account
                                </label>

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
                                                    <span>
                                                        {selectedAccount.name}
                                                    </span>
                                                    {(selectedAccount.place ||
                                                        selectedAccount.area) && (
                                                        <>
                                                            <span className="dbt-dropdown-separator">
                                                                •
                                                            </span>
                                                            <span className="dbt-dropdown-place">
                                                                {selectedAccount.area ||
                                                                    selectedAccount.place}
                                                            </span>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                'Choose an account...'
                                            )}
                                        </span>
                                        <span
                                            className={`dbt-dropdown-arrow ${
                                                isOpen ? 'open' : ''
                                            }`}
                                        >
                                            ▼
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isOpen && (
                                        <div className="dbt-dropdown-menu">
                                            {/* Search */}
                                            <div className="dbt-dropdown-search">
                                                <span className="dbt-search-icon">
                                                    🔍
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder="Search by name, code, or place..."
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                    className="dbt-dropdown-search-input"
                                                    autoFocus
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

                                            {/* Virtualized Options List */}
                                            {filteredData.length === 0 ? (
                                                <div className="dbt-dropdown-empty">
                                                    {searchTerm
                                                        ? `No accounts found matching "${searchTerm}"`
                                                        : 'No accounts available'}
                                                </div>
                                            ) : (
                                                <div 
                                                    className="dbt-dropdown-list"
                                                    ref={dropdownListRef}
                                                    onScroll={handleScroll}
                                                    style={{ maxHeight: '400px', overflow: 'auto' }}
                                                >
                                                    {/* Virtual scrolling container */}
                                                    <div style={{ height: totalHeight, position: 'relative' }}>
                                                        <div style={{ transform: `translateY(${offsetY}px)` }}>
                                                            {visibleAccounts.map((account) => (
                                                                <div
                                                                    key={account.code || account.id}
                                                                    className="dbt-dropdown-item"
                                                                    onClick={() => handleSelectAccount(account)}
                                                                    style={{ minHeight: `${itemHeight}px` }}
                                                                >
                                                                    <div className="dbt-dropdown-item-main">
                                                                        <div className="dbt-dropdown-item-info">
                                                                            <div className="dbt-dropdown-item-name">
                                                                                {account.name}
                                                                            </div>
                                                                            {(account.area || account.place) && (
                                                                                <div className="dbt-dropdown-item-place">
                                                                                    📍 {account.area || account.place}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="dbt-dropdown-item-balance">
                                                                            {renderBalance(account.code)}
                                                                        </div>
                                                                        <button
                                                                            className="dbt-show-btn"
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                handleShowLedger(account);
                                                                            }}
                                                                        >
                                                                            Show
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Account Info */}
                                {selectedAccount && (
                                    <div className="dbt-selected-account">
                                        <div className="dbt-selected-account-inner">
                                            <div className="dbt-selected-account-header">
                                                <h3 className="dbt-selected-account-title">
                                                    Selected Account
                                                </h3>
                                                <button
                                                    className="dbt-clear-selection"
                                                    onClick={clearSelection}
                                                    title="Clear selection"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="dbt-selected-account-details">
                                                <p>
                                                    <span className="label">
                                                        Code:
                                                    </span>{' '}
                                                    <span className="value code">
                                                        {selectedAccount.code}
                                                    </span>
                                                </p>
                                                <p>
                                                    <span className="label">
                                                        Name:
                                                    </span>{' '}
                                                    <span className="value">
                                                        {selectedAccount.name}
                                                    </span>
                                                </p>
                                                {(selectedAccount.area ||
                                                    selectedAccount.place) && (
                                                    <p>
                                                        <span className="label">
                                                            {selectedAccount.area
                                                                ? 'Area'
                                                                : 'Place'}
                                                            :
                                                        </span>
                                                        <span className="value">
                                                            {selectedAccount.area ||
                                                                selectedAccount.place}
                                                        </span>
                                                    </p>
                                                )}
                                                <p>
                                                    <span className="label">Balance:</span>
                                                    <span className="value">
                                                        {renderBalance(selectedAccount.code)}
                                                    </span>
                                                </p>
                                            </div>

                                            <p className="dbt-hint">
                                                Click <strong>Show</strong> next
                                                to any account to load its
                                                ledger.
                                            </p>

                                            <button
                                                className="dbt-view-ledger-btn"
                                                onClick={() =>
                                                    handleShowLedger(
                                                        selectedAccount
                                                    )
                                                }
                                            >
                                                View Ledger Details
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Stats */}
                                {allData.length > 0 && (
                                    <div className="dbt-total-stats">
                                        Total Accounts:{' '}
                                        <span className="highlight">
                                            {allData.length}
                                        </span>
                                        {searchTerm &&
                                            filteredData.length !==
                                                allData.length && (
                                                <>
                                                    {' '}
                                                    | Filtered:{' '}
                                                    <span className="highlight">
                                                        {filteredData.length}
                                                    </span>
                                                </>
                                            )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Debtors;