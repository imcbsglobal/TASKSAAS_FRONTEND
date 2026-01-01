import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../services/api';
import './BillsReceivable.scss';

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

const BillsReceivable = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Balance caching system
  const [balanceCache, setBalanceCache] = useState({});
  const [loadingBalances, setLoadingBalances] = useState(new Set());
  const balanceCacheRef = useRef({});
  const abortControllersRef = useRef({});

  // Fetch debtors from API
  useEffect(() => {
    fetchDebtors();
    
    // Cleanup on unmount
    return () => {
      Object.values(abortControllersRef.current).forEach(controller => {
        controller.abort();
      });
    };
  }, []);

  const fetchDebtors = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/debtors/get-debtors/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const debtorsData =
        response.data.success && response.data.data ? response.data.data : [];

      const sortedAccounts = debtorsData.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );

      setAccounts(sortedAccounts);

    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch debtors'
      );
      console.error('Error fetching debtors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoice balance for a single account
  const fetchInvoiceBalance = useCallback(async (accountCode) => {
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

      const res = await axios.get(
        `${API_BASE_URL}/get-invoice-details/?account_code=${accountCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        }
      );

      let balance = 0;
      if (res.data.success && Array.isArray(res.data.data)) {
        const totals = res.data.data.reduce(
          (acc, invoice) => {
            acc.netTotal += parseFloat(invoice.nettotal || 0);
            acc.paid += parseFloat(invoice.paid || 0);
            return acc;
          },
          { netTotal: 0, paid: 0 }
        );
        balance = totals.netTotal - totals.paid;
      }

      const balanceData = { balance };
      
      balanceCacheRef.current[accountCode] = balanceData;
      setBalanceCache(prev => ({ ...prev, [accountCode]: balanceData }));

      return balanceData;

    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error(
          `Failed to fetch invoice details for account ${accountCode}`,
          err
        );
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
  }, [loadingBalances]);

  // Text search filter - DON'T filter by balance, show all accounts
  const filteredData = useMemo(() => {
    let filtered = accounts;
    
    // Apply text search only
    if (debouncedSearchTerm.trim()) {
      const search = debouncedSearchTerm.toLowerCase();
      filtered = accounts.filter(
        (item) =>
          (item.name || '').toLowerCase().includes(search) ||
          (item.code || '').toLowerCase().includes(search) ||
          (item.place || '').toLowerCase().includes(search) ||
          (item.area || '').toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [debouncedSearchTerm, accounts]);

  // Initial load when dropdown opens - load ALL accounts aggressively
  useEffect(() => {
    if (isOpen && accounts.length > 0) {
      // Load ALL accounts in parallel batches
      const batchSize = 50; // Larger batch size
      let currentBatch = 0;
      
      const loadNextBatch = () => {
        const start = currentBatch * batchSize;
        const end = Math.min(start + batchSize, accounts.length);
        
        if (start >= accounts.length) return;
        
        const batch = accounts.slice(start, end);
        batch.forEach(account => {
          if (!balanceCacheRef.current[account.code] && !loadingBalances.has(account.code)) {
            fetchInvoiceBalance(account.code);
          }
        });
        
        currentBatch++;
        
        // Continue loading next batch
        if (end < accounts.length) {
          setTimeout(loadNextBatch, 10); // Very fast loading
        }
      };
      
      loadNextBatch();
    }
  }, [isOpen, accounts.length, loadingBalances, fetchInvoiceBalance]);

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setIsOpen(false);
    
    // Fetch balance for selected account if not cached
    if (!balanceCacheRef.current[account.code]) {
      fetchInvoiceBalance(account.code);
    }
  };

  const handleShowInvoice = (account) => {
    navigate(`/bills/receivable/invoice/${account.code}`, {
      state: {
        accountName: account.name,
        accountData: account
      }
    });
  };

  const clearSelection = () => {
    setSelectedAccount(null);
    setSearchTerm('');
  };

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
      return <span className="bills-balance-loading">Loading...</span>;
    }

    if (!cached) {
      return <span className="bills-balance-placeholder">--</span>;
    }

    const balance = cached.balance;
    
    return (
      <span className={`bills-balance-amount ${balance >= 0 ? 'bills-balance-positive' : 'bills-balance-negative'}`}>
        {formatCurrency(balance)}
      </span>
    );
  };

  // Count accounts with balance > 0 (only from loaded balances)
  const accountsWithBalance = useMemo(() => {
    return Object.entries(balanceCache).filter(([_, data]) => data.balance > 0).length;
  }, [balanceCache]);

  return (
    <div className="bills-page">
      <div className="bills-card">
        <div className="bills-card-inner">
          {/* Header */}
          <header className="bills-card-header">
            <div className="bills-header-content">
              <div className="bills-header-left">
                <h1 className="bills-title">Bills Receivable</h1>
                <p className="bills-subtitle">
                  Select an account to view invoice details
                </p>
              </div>
              <button
                className="bills-refresh-btn"
                onClick={fetchDebtors}
                disabled={loading}
              >
                🔄 {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </header>

          {/* Dropdown Section */}
          <div className="bills-dropdown-section">
            <label className="bills-dropdown-label">
              Select Customer Account
            </label>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  color: '#c33'
                }}
              >
                Error: {error}
              </div>
            )}

            {/* Dropdown Button */}
            <div className="bills-dropdown-container">
              <button
                className="bills-dropdown-button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
              >
                <span className="bills-dropdown-text">
                  {loading ? (
                    'Loading accounts...'
                  ) : selectedAccount ? (
                    <>
                      <span>{selectedAccount.name}</span>
                      {selectedAccount.area && (
                        <>
                          <span className="bills-dropdown-separator">•</span>
                          <span className="bills-dropdown-place">
                            {selectedAccount.area}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    'Choose an account...'
                  )}
                </span>
                <span
                  className={`bills-dropdown-arrow ${isOpen ? 'open' : ''}`}
                >
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {isOpen && !loading && (
                <div className="bills-dropdown-menu">
                  {/* Search Box */}
                  <div className="bills-dropdown-search">
                    <span className="bills-search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by name, code, or place..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bills-dropdown-search-input"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        className="bills-search-clear"
                        onClick={() => setSearchTerm('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Loading Progress */}
                  {loadingBalances.size > 0 && (
                    <div style={{
                      padding: '8px 16px',
                      background: '#f0f9ff',
                      borderBottom: '1px solid #e0e7ff',
                      fontSize: '12px',
                      color: '#1e40af',
                      textAlign: 'center'
                    }}>
                      Loading balances... ({Object.keys(balanceCache).length}/{accounts.length})
                    </div>
                  )}

                  {/* Options List - Show all, no virtualization */}
                  {filteredData.length === 0 ? (
                    <div className="bills-dropdown-empty">
                      {searchTerm
                        ? `No accounts matching "${searchTerm}"`
                        : 'No accounts available'}
                    </div>
                  ) : (
                    <div 
                      className="bills-dropdown-list"
                      style={{ maxHeight: '400px', overflow: 'auto' }}
                    >
                      {filteredData.map((account) => {
                        const cached = balanceCache[account.code];
                        const isLoadingBalance = loadingBalances.has(account.code);
                        const balance = cached ? cached.balance : null;

                        // Hide accounts with balance = 0 after loaded
                        if (cached && balance <= 0) {
                          return null;
                        }

                        return (
                          <div
                            key={account.code || account.id}
                            className="bills-dropdown-item"
                            onClick={() => handleSelectAccount(account)}
                          >
                            <div className="bills-dropdown-item-main">
                              <div className="bills-dropdown-item-info">
                                <div className="bills-dropdown-item-name">
                                  {account.name}
                                </div>
                                {account.area && (
                                  <div className="bills-dropdown-item-place">
                                    📍 {account.area}
                                  </div>
                                )}
                              </div>
                              <div className="bills-dropdown-item-right">
                                <div className="bills-dropdown-item-balance-show">
                                  {renderBalance(account.code)}
                                </div>

                                <button
                                  className="bills-show-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowInvoice(account);
                                  }}
                                >
                                  Show
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Account Info */}
            {selectedAccount && (
              <div className="bills-selected-account">
                <div className="bills-selected-account-inner">
                  <div className="bills-selected-account-header">
                    <h3 className="bills-selected-account-title">
                      Selected Account
                    </h3>
                    <button
                      className="bills-clear-selection"
                      onClick={clearSelection}
                      title="Clear selection"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="bills-selected-account-details">
                    <p>
                      <span className="label">Code:</span>
                      <span className="value code">
                        {selectedAccount.code}
                      </span>
                    </p>
                    <p>
                      <span className="label">Name:</span>
                      <span className="value">{selectedAccount.name}</span>
                    </p>
                    {selectedAccount.area && (
                      <p>
                        <span className="label">Area:</span>
                        <span className="value">{selectedAccount.area}</span>
                      </p>
                    )}
                    {selectedAccount.place && (
                      <p>
                        <span className="label">Place:</span>
                        <span className="value">{selectedAccount.place}</span>
                      </p>
                    )}
                    <p>
                      <span className="label">Balance:</span>
                      <span className="value">
                        ₹{renderBalance(selectedAccount.code)}
                      </span>
                    </p>
                  </div>
                  <button
                    className="bills-view-invoice-btn"
                    onClick={() => handleShowInvoice(selectedAccount)}
                  >
                    View Invoice Details
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bills-total-stats">
              Total Accounts:{' '}
              <span className="highlight">{accounts.length}</span>
              {searchTerm && filteredData.length !== accounts.length && (
                <>
                  {' '}
                  | Filtered:{' '}
                  <span className="highlight">{filteredData.length}</span>
                </>
              )}
              {accountsWithBalance > 0 && (
                <>
                  {' '}
                  | With Balance:{' '}
                  <span className="highlight">{accountsWithBalance}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsReceivable;