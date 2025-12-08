import React, { useEffect, useState, useCallback, useRef } from 'react';
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

    // Balance caching system
    const [balanceCache, setBalanceCache] = useState({});
    const [loadingBalances, setLoadingBalances] = useState(new Set());
    const balanceCacheRef = useRef({});
    const abortControllersRef = useRef({});
    const loadBalanceTimeoutRef = useRef(null);
    const dropdownListRef = useRef(null);
    const loadedIndicesRef = useRef(new Set());

    // ----------------- EFFECTS -----------------

    useEffect(() => {
        fetchDebtorsData();
        
        // Cleanup on unmount
        return () => {
            Object.values(abortControllersRef.current).forEach(controller => {
                controller.abort();
            });
            if (loadBalanceTimeoutRef.current) {
                clearTimeout(loadBalanceTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
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
    }, [searchTerm, allData]);

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
                
                // FIXED: Calculate current balance exactly like LedgerPage
                // Current balance = opening + total debit - total credit
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

                console.log(`Balance loaded for ${accountCode}:`, balanceData);

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

    // Function to load balances for a range of accounts
    const loadBalancesForRange = useCallback((startIndex, endIndex) => {
        const accountsToLoad = filteredData.slice(startIndex, endIndex);
        
        accountsToLoad.forEach((account, index) => {
            const actualIndex = startIndex + index;
            
            // Skip if already loaded or loading
            if (loadedIndicesRef.current.has(actualIndex) || 
                balanceCacheRef.current[account.code] || 
                loadingBalances.has(account.code)) {
                return;
            }

            // Mark as loaded
            loadedIndicesRef.current.add(actualIndex);
            
            // Faster loading - 20ms between requests (reduced from 50ms)
            setTimeout(() => {
                fetchBalance(account.code);
            }, index * 20);
        });
    }, [filteredData, loadingBalances, fetchBalance]);

    // Handle scroll to load more balances
    const handleScroll = useCallback((e) => {
        const element = e.target;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;

        // Check if scrolled near bottom (within 300px for earlier loading)
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 300;

        if (isNearBottom) {
            // Calculate which accounts are now visible
            const loadedCount = loadedIndicesRef.current.size;
            const nextBatch = Math.min(loadedCount + 20, filteredData.length); // Load 20 at a time
            
            if (loadedCount < nextBatch) {
                loadBalancesForRange(loadedCount, nextBatch);
            }
        }
    }, [filteredData.length, loadBalancesForRange]);

    // Load balances for visible accounts when dropdown opens
    useEffect(() => {
        if (!isOpen || filteredData.length === 0) return;

        // Clear existing timeout
        if (loadBalanceTimeoutRef.current) {
            clearTimeout(loadBalanceTimeoutRef.current);
        }

        // Reset loaded indices when dropdown opens with new search
        loadedIndicesRef.current.clear();

        // Reduced debounce for faster initial loading
        loadBalanceTimeoutRef.current = setTimeout(() => {
            // Load ALL balances for all accounts
            loadBalancesForRange(0, filteredData.length);
        }, 100); // 100ms debounce (faster)

        return () => {
            if (loadBalanceTimeoutRef.current) {
                clearTimeout(loadBalanceTimeoutRef.current);
            }
        };
    }, [isOpen, filteredData, loadBalancesForRange]);

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
        
        // Show balance always (even if zero) - with proper sign
        return (
            <span className={`dbt-balance-amount ${balance >= 0 ? 'dbt-balance-positive' : 'dbt-balance-negative'}`}>
                {formatCurrency(balance)}
            </span>
        );
    };

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
                                                    onChange={e =>
                                                        setSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="dbt-dropdown-search-input"
                                                />
                                                {searchTerm && (
                                                    <button
                                                        className="dbt-search-clear"
                                                        onClick={() =>
                                                            setSearchTerm('')
                                                        }
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>

                                            {/* Options */}
                                            <div 
                                                className="dbt-dropdown-list"
                                                ref={dropdownListRef}
                                                onScroll={handleScroll}
                                            >
                                                {filteredData.length === 0 ? (
                                                    <div className="dbt-dropdown-empty">
                                                        {searchTerm
                                                            ? `No accounts found matching "${searchTerm}"`
                                                            : 'No accounts available'}
                                                    </div>
                                                ) : (
                                                    filteredData.map(account => (
                                                        <div
                                                            key={
                                                                account.code ||
                                                                account.id
                                                            }
                                                            className="dbt-dropdown-item"
                                                            onClick={() =>
                                                                handleSelectAccount(
                                                                    account
                                                                )
                                                            }
                                                        >
                                                            <div className="dbt-dropdown-item-main">
                                                                <div className="dbt-dropdown-item-info">
                                                                    <div className="dbt-dropdown-item-name">
                                                                        {
                                                                            account.name
                                                                        }
                                                                    </div>
                                                                    {(account.area ||
                                                                        account.place) && (
                                                                        <div className="dbt-dropdown-item-place">
                                                                            📍{' '}
                                                                            {account.area ||
                                                                                account.place}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {/* Balance Display - Always shows */}
                                                                <div className="dbt-dropdown-item-balance">
                                                                    {renderBalance(account.code)}
                                                                </div>
                                                                <button
                                                                    className="dbt-show-btn"
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        handleShowLedger(
                                                                            account
                                                                        );
                                                                    }}
                                                                >
                                                                    Show
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
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
                                                {/* Balance in selected account section - always show */}
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