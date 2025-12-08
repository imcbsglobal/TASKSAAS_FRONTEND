import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../services/api';
import './BillsReceivable.scss';

const BillsReceivable = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map of accountCode -> { balance: number, loading: boolean, error?: string }
  const [invoiceBalances, setInvoiceBalances] = useState({});

  // Fetch debtors from API
  useEffect(() => {
    fetchDebtors();
  }, []);

  const fetchDebtors = async () => {
    setLoading(true);
    setError(null);
    setInvoiceBalances({}); // reset invoice balances on refresh

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

      console.log('API Response:', response.data);

      const debtorsData =
        response.data.success && response.data.data ? response.data.data : [];

      const sortedAccounts = debtorsData.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );

      setAccounts(sortedAccounts);

      // Fetch invoice balances after fetching debtors
      if (sortedAccounts.length > 0) {
        fetchInvoiceBalances(sortedAccounts, token);
      }

    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch debtors'
      );
      console.error('Error fetching debtors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceBalances = async (accountsList, tokenFromDebtors) => {
    const token = tokenFromDebtors || localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found for invoice balances');
      return;
    }

    // Mark all balances as loading initially
    setInvoiceBalances((prev) => {
      const updated = { ...prev };
      accountsList.forEach((acc) => {
        if (!acc.code) return;
        updated[acc.code] = {
          ...(updated[acc.code] || {}),
          loading: true
        };
      });
      return updated;
    });

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    await Promise.allSettled(
      accountsList.map(async (account) => {
        if (!account.code) return;

        try {
          const res = await axios.get(
            `${API_BASE_URL}/get-invoice-details/?account_code=${account.code}`,
            { headers }
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

          setInvoiceBalances((prev) => ({
            ...prev,
            [account.code]: {
              balance,
              loading: false
            }
          }));
        } catch (err) {
          console.error(
            `Failed to fetch invoice details for account ${account.code}`,
            err
          );
          setInvoiceBalances((prev) => ({
            ...prev,
            [account.code]: {
              balance: 0,
              loading: false,
              error: 'Failed to fetch invoice balance'
            }
          }));
        }
      })
    );
  };

  // Text search filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return accounts;

    const search = searchTerm.toLowerCase();
    return accounts.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(search) ||
        (item.code || '').toLowerCase().includes(search) ||
        (item.place || '').toLowerCase().includes(search) ||
        (item.area || '').toLowerCase().includes(search)
    );
  }, [searchTerm, accounts]);

  // 🔥 Only keep accounts whose balance > 1
  const filteredByBalance = useMemo(() => {
    return filteredData.filter((acc) => {
      const info = invoiceBalances[acc.code];
      if (!info || info.loading || typeof info.balance !== 'number') return false;
      return info.balance > 1;
    });
  }, [filteredData, invoiceBalances]);

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setIsOpen(false);
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

                  {/* Options List */}
                  <div className="bills-dropdown-list">
                    {filteredByBalance.length === 0 ? (
                      <div className="bills-dropdown-empty">
                        {searchTerm
                          ? `No accounts with balance > 1 matching "${searchTerm}"`
                          : 'No accounts with receivable balance > 1'}
                      </div>
                    ) : (
                      filteredByBalance.map((account) => {
                        const balanceInfo = invoiceBalances[account.code] || {};
                        const isLoading = balanceInfo.loading;
                        const hasBalance =
                          typeof balanceInfo.balance === 'number';
                        const balance = hasBalance ? balanceInfo.balance : 0;

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
                                {isLoading ? (
                                  <div className="bills-dropdown-item-balance-show">
                                    Loading...
                                  </div>
                                ) : hasBalance ? (
                                  <div className="bills-dropdown-item-balance-show">
                                    {formatCurrency(balance)}
                                  </div>
                                ) : (
                                  <div className="bills-dropdown-item-balance-show">
                                    --
                                  </div>
                                )}

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
                      })
                    )}
                  </div>
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
                        {(() => {
                          const info =
                            invoiceBalances[selectedAccount.code] || null;
                          const isLoading = !info || info.loading;
                          const bal =
                            !isLoading && typeof info.balance === 'number'
                              ? info.balance
                              : 0;
                          return isLoading
                            ? 'Loading...'
                            : `₹${formatCurrency(bal)}`;
                        })()}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsReceivable;
