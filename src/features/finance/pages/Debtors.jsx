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
    const [selectedArea, setSelectedArea] = useState('');
    const [balanceFilter, setBalanceFilter] = useState('all'); // 'all' | 'zero' | 'nonzero'
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    // Debounced search
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Virtualization states
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const dropdownListRef = useRef(null);
    const itemHeight = 80;
    const overscan = 5;

    // ----------------- EFFECTS -----------------

    useEffect(() => {
        fetchDebtorsData();
    }, []);

    // Get unique areas from all data
    const uniqueAreas = React.useMemo(() => {
        const areas = allData
            .map(d => d.area)
            .filter(area => area && area.trim() !== "");
        return [...new Set(areas)].sort();
    }, [allData]);

    // Update filtered data with debounced search, area filter, and balance filter
    useEffect(() => {
        let filtered = allData;

        if (debouncedSearchTerm.trim()) {
            const search = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                (item.name || '').toLowerCase().includes(search) ||
                (item.code || '').toLowerCase().includes(search) ||
                (item.place || '').toLowerCase().includes(search) ||
                (item.area || '').toLowerCase().includes(search)
            );
        }

        if (selectedArea) {
            filtered = filtered.filter(item => item.area === selectedArea);
        }

        if (balanceFilter === 'zero') {
            filtered = filtered.filter(item => parseFloat(item.balance ?? 0) === 0);
        } else if (balanceFilter === 'nonzero') {
            filtered = filtered.filter(item => parseFloat(item.balance ?? 0) !== 0);
        }

        setFilteredData(filtered);
        setVisibleRange({ start: 0, end: 20 });
    }, [debouncedSearchTerm, selectedArea, balanceFilter, allData]);

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
    }, [filteredData, itemHeight, overscan]);

    useEffect(() => {
        if (isOpen && filteredData.length > 0) {
            handleScroll();
        }
    }, [isOpen, filteredData, handleScroll]);

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

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedArea('');
        setBalanceFilter('all');
    };

    // ----------------- HELPERS -----------------

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const renderBalance = (account) => {
        const balance = parseFloat(account?.balance ?? 0);
        return (
            <span className={`dbt-balance-amount ${balance >= 0 ? 'dbt-balance-positive' : 'dbt-balance-negative'}`}>
                {formatCurrency(balance)}
            </span>
        );
    };

    // Virtualization values
    const visibleAccounts = filteredData.slice(visibleRange.start, visibleRange.end);
    const offsetY = visibleRange.start * itemHeight;
    const totalHeight = filteredData.length * itemHeight;

    // Live counts (based on current search + area, ignoring balance filter)
    const baseFiltered = React.useMemo(() => {
        let filtered = allData;
        if (debouncedSearchTerm.trim()) {
            const search = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                (item.name || '').toLowerCase().includes(search) ||
                (item.code || '').toLowerCase().includes(search) ||
                (item.place || '').toLowerCase().includes(search) ||
                (item.area || '').toLowerCase().includes(search)
            );
        }
        if (selectedArea) {
            filtered = filtered.filter(item => item.area === selectedArea);
        }
        return filtered;
    }, [allData, debouncedSearchTerm, selectedArea]);

    const allCount     = baseFiltered.length;
    const zeroCount    = baseFiltered.filter(item => parseFloat(item.balance ?? 0) === 0).length;
    const nonZeroCount = baseFiltered.filter(item => parseFloat(item.balance ?? 0) !== 0).length;

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

                    {error && <div className="dbt-error">⚠️ Error: {error}</div>}
                    {loading && <div className="dbt-loading">Loading debtors data...</div>}

                    {!loading && !error && (
                        <>
                            {/* Filter Section */}
                            <div className="dbt-filter-section">
                                <div className="dbt-filter-controls">
                                    <div className="dbt-filter-item">
                                        <label className="dbt-filter-label">Filter by Area</label>
                                        <select
                                            className="dbt-area-select"
                                            value={selectedArea}
                                            onChange={(e) => setSelectedArea(e.target.value)}
                                        >
                                            <option value="">All Areas</option>
                                            {uniqueAreas.map(area => (
                                                <option key={area} value={area}>{area}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {(searchTerm || selectedArea || balanceFilter !== 'all') && (
                                        <button
                                            type="button"
                                            className="dbt-clear-filters-btn"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Dropdown Section */}
                            <div className="dbt-dropdown-section">
                                <label className="dbt-dropdown-label">
                                    Select Debtor Account
                                </label>

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
                                                    {(selectedAccount.place || selectedAccount.area) && (
                                                        <>
                                                            <span className="dbt-dropdown-separator">•</span>
                                                            <span className="dbt-dropdown-place">
                                                                {selectedAccount.area || selectedAccount.place}
                                                            </span>
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

                                            {/* Search */}
                                            <div className="dbt-dropdown-search">
                                                <span className="dbt-search-icon">🔍</span>
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

                                            {/* ── Balance Filter Toggle (inside dropdown) ── */}
                                            <div className="dbt-dropdown-balance-filter">
                                                <button
                                                    type="button"
                                                    className={`dbt-bal-btn${balanceFilter === 'all' ? ' active' : ''}`}
                                                    onClick={() => setBalanceFilter('all')}
                                                >
                                                    All
                                                    <span className="dbt-bal-count">{allCount}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`dbt-bal-btn dbt-bal-btn--nonzero${balanceFilter === 'nonzero' ? ' active' : ''}`}
                                                    onClick={() => setBalanceFilter('nonzero')}
                                                >
                                                    Has Balance
                                                    <span className="dbt-bal-count">{nonZeroCount}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`dbt-bal-btn dbt-bal-btn--zero${balanceFilter === 'zero' ? ' active' : ''}`}
                                                    onClick={() => setBalanceFilter('zero')}
                                                >
                                                    Zero Balance
                                                    <span className="dbt-bal-count">{zeroCount}</span>
                                                </button>
                                            </div>
                                            {/* ─────────────────────────────────────────── */}

                                            {/* List */}
                                            {filteredData.length === 0 ? (
                                                <div className="dbt-dropdown-empty">
                                                    {searchTerm || selectedArea || balanceFilter !== 'all'
                                                        ? 'No accounts found'
                                                        : 'No accounts available'}
                                                </div>
                                            ) : (
                                                <div
                                                    className="dbt-dropdown-list"
                                                    ref={dropdownListRef}
                                                    onScroll={handleScroll}
                                                    style={{ maxHeight: '400px', overflow: 'auto' }}
                                                >
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
                                                                            {renderBalance(account)}
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
                                                <p>
                                                    <span className="label">Code:</span>{' '}
                                                    <span className="value code">{selectedAccount.code}</span>
                                                </p>
                                                <p>
                                                    <span className="label">Name:</span>{' '}
                                                    <span className="value">{selectedAccount.name}</span>
                                                </p>
                                                {(selectedAccount.area || selectedAccount.place) && (
                                                    <p>
                                                        <span className="label">
                                                            {selectedAccount.area ? 'Area' : 'Place'}:
                                                        </span>
                                                        <span className="value">
                                                            {selectedAccount.area || selectedAccount.place}
                                                        </span>
                                                    </p>
                                                )}
                                                <p>
                                                    <span className="label">Balance:</span>
                                                    <span className="value">{renderBalance(selectedAccount)}</span>
                                                </p>
                                            </div>
                                            <p className="dbt-hint">
                                                Click <strong>Show</strong> next to any account to load its ledger.
                                            </p>
                                            <button
                                                className="dbt-view-ledger-btn"
                                                onClick={() => handleShowLedger(selectedAccount)}
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
                                        <span className="highlight">{allData.length}</span>
                                        {(searchTerm || selectedArea || balanceFilter !== 'all') &&
                                            filteredData.length !== allData.length && (
                                                <>
                                                    {' '}| Filtered:{' '}
                                                    <span className="highlight">{filteredData.length}</span>
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