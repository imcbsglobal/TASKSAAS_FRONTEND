import React, { useState, useRef, useEffect, useMemo } from 'react';
import './Report.scss';

// BatchModal Component - Enhanced with all product details
const BatchModal = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  return (
    <div className="md-modal-overlay" onClick={onClose}>
      <div className="md-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="md-modal-header">
          <h2>Product Details - {product.name}</h2>
          <button className="md-modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="md-modal-body">
          {/* Product Basic Info */}
          <div className="md-product-info">
            <div className="md-info-item">
              <span className="md-info-label">Product Code:</span>
              <span className="md-info-value">{product.code}</span>
            </div>
            <div className="md-info-item">
              <span className="md-info-label">Brand:</span>
              <span className="md-info-value">{product.brand}</span>
            </div>
            <div className="md-info-item">
              <span className="md-info-label">Category:</span>
              <span className="md-info-value">{product.product}</span>
            </div>
            <div className="md-info-item">
              <span className="md-info-label">Unit:</span>
              <span className="md-info-value">{product.unit}</span>
            </div>
            <div className="md-info-item">
              <span className="md-info-label">HSN Code:</span>
              <span className="md-info-value">{product.text6}</span>
            </div>
            <div className="md-info-item">
              <span className="md-info-label">Tax Rate:</span>
              <span className="md-info-value">{product.taxcode}%</span>
            </div>
            <div className="md-info-item">
              <span className="md-info-label">Status:</span>
              <span className={`status-badge ${product.defected === 'O' ? 'status-ok' : 'status-defected'}`}>
                {product.defected === 'O' ? '✓ OK' : '✗ Defected'}
              </span>
            </div>
          </div>

          {/* Batch Details Table */}
          <div className="md-batches-table-wrap">
            <table className="md-batches-table">
              <thead>
                <tr>
                  <th>Batch #</th>
                  <th>Barcode</th>
                  <th>MRP</th>
                  <th>Retail</th>
                  <th>D.P</th>
                  <th>CB</th>
                  <th>Net Rate</th>
                  <th>PK Shop</th>
                  <th>Cost</th>
                  <th>Quantity</th>
                  <th>Expiry</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                {product.batches && product.batches.length > 0 ? (
                  product.batches.map((batch, index) => (
                    <tr key={batch.id || index}>
                      <td>{index + 1}</td>
                      <td>{batch.barcode || '-'}</td>
                      <td>{batch.MRP && batch.MRP !== '0.00' ? batch.MRP : '-'}</td>
                      <td>{batch.RETAIL && batch.RETAIL !== '0.00' ? batch.RETAIL : '-'}</td>
                      <td>{batch['D.P'] && batch['D.P'] !== '0.00' ? batch['D.P'] : '-'}</td>
                      <td>{batch.CB && batch.CB !== '0.00' ? batch.CB : '-'}</td>
                      <td>{batch['NET RATE'] && batch['NET RATE'] !== '0.00' ? batch['NET RATE'] : '-'}</td>
                      <td>{batch['PK SHOP'] && batch['PK SHOP'] !== '0.00' ? batch['PK SHOP'] : '-'}</td>
                      <td>{batch.COST && batch.COST !== '0.00' ? batch.COST : '-'}</td>
                      <td className="md-quantity-cell">{batch.quantity || '0'}</td>
                      <td>{batch.expirydate || '-'}</td>
                      <td>{batch.modified ? `${batch.modified} ${batch.modifiedtime || ''}`.trim() : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="md-no-data">No batches available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Batch Summary */}
          {product.batches && product.batches.length > 0 && (
            <div className="md-batch-summary">
              <div className="md-summary-item">
                <span className="md-summary-label">Total Batches:</span>
                <span className="md-summary-value">{product.batches.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// TableView Component - Simplified with only basic columns
const TableView = ({ data, onViewBatches }) => (
  <div className="md-table-wrap">
    <table className="md-debtors-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Photo</th>
          <th>Code</th>
          <th>Name</th>
          <th>Product</th>
          <th>Brand</th>
          <th>Unit</th>
          <th>HSN</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row) => (
            <tr key={row.no}>
              <td>{row.no}</td>
              <td>
                {row.photo ? (
                  <img 
                    src={row.photo} 
                    alt={row.name} 
                    className="product-photo"
                  />
                ) : (
                  <div className="no-photo">📦</div>
                )}
              </td>
              <td>{row.code}</td>
              <td>{row.name}</td>
              <td>{row.product}</td>
              <td>{row.brand}</td>
              <td>{row.unit}</td>
              <td>{row.hsn}</td>
              <td>
                <button 
                  className="md-view-details-btn"
                  onClick={() => onViewBatches(row.originalProduct)}
                  title="View full details"
                >
                  👁️ View Details
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="md-no-data">
              No products found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// GridView Component - Simplified
const GridView = ({ data, onViewBatches }) => (
  <div className="md-grid-container">
    {data.length > 0 ? (
      <div className="md-grid">
        {data.map((row) => (
          <div className="md-grid-card" key={row.no}>
            <div className="md-grid-image">
              {row.photo ? (
                <img src={row.photo} alt={row.name} />
              ) : (
                <div className="md-grid-no-image">📦</div>
              )}
            </div>
            
            <div className="md-grid-content">
              <div className="md-grid-header">
                <h3 className="md-grid-title">{row.name}</h3>
                <span className="md-grid-code">#{row.code}</span>
              </div>

              <div className="md-grid-body">
                <div className="md-grid-row">
                  <span className="md-grid-label">Brand:</span>
                  <span className="md-grid-value">{row.brand}</span>
                </div>
                <div className="md-grid-row">
                  <span className="md-grid-label">Category:</span>
                  <span className="md-grid-value">{row.product}</span>
                </div>
                <div className="md-grid-row">
                  <span className="md-grid-label">Unit:</span>
                  <span className="md-grid-value">{row.unit}</span>
                </div>
                <div className="md-grid-row">
                  <span className="md-grid-label">HSN Code:</span>
                  <span className="md-grid-value">{row.hsn}</span>
                </div>
                
                <div className="md-grid-footer">
                  <button 
                    className="md-view-details-btn-grid"
                    onClick={() => onViewBatches(row.originalProduct)}
                    title="View full details"
                  >
                    👁️ View Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="md-no-data" style={{ padding: '60px 20px' }}>
        No products found
      </div>
    )}
  </div>
);

const Report = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [page, setPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [brandSearchTerm, setBrandSearchTerm] = useState('');
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    
    const brandDropdownRef = useRef(null);
    const categoryDropdownRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch('https://tasksas.com/api/product/get-product-details', {
                method: 'GET',
                headers: headers,
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized - Please login again');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && Array.isArray(result.products)) {
                const transformedData = result.products.map((product, index) => {
                    return {
                        no: index + 1,
                        code: product.code || 'N/A',
                        name: product.name || 'N/A',
                        product: product.product || 'N/A',
                        brand: product.brand || 'N/A',
                        unit: product.unit || 'N/A',
                        hsn: product.text6 || 'N/A',
                        photo: product.photos && product.photos.length > 0 ? product.photos[0].url : null,
                        originalProduct: product
                    };
                });
                setReportData(transformedData);
            } else {
                throw new Error('Invalid data format received');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const uniqueBrands = useMemo(() => {
        const brands = reportData.map(d => d.brand).filter(brand => brand && brand.trim() !== "" && brand !== 'N/A');
        return [...new Set(brands)].sort();
    }, [reportData]);

    const uniqueCategories = useMemo(() => {
        const cats = reportData.map(d => d.product).filter(cat => cat && cat.trim() !== "" && cat !== 'N/A');
        return [...new Set(cats)].sort();
    }, [reportData]);

    const filteredBrands = useMemo(() => {
        if (!brandSearchTerm.trim()) return uniqueBrands;
        const search = brandSearchTerm.toLowerCase();
        return uniqueBrands.filter(brand => brand.toLowerCase().includes(search));
    }, [uniqueBrands, brandSearchTerm]);

    const filteredCategories = useMemo(() => {
        if (!categorySearchTerm.trim()) return uniqueCategories;
        const search = categorySearchTerm.toLowerCase();
        return uniqueCategories.filter(cat => cat.toLowerCase().includes(search));
    }, [uniqueCategories, categorySearchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) {
                setIsBrandDropdownOpen(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const clearSearch = () => setSearchTerm('');

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedBrand('');
        setSelectedCategory('');
        setBrandSearchTerm('');
        setCategorySearchTerm('');
        setPage(1);
    };

    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand);
        setIsBrandDropdownOpen(false);
        setBrandSearchTerm('');
        setPage(1);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setIsCategoryDropdownOpen(false);
        setCategorySearchTerm('');
        setPage(1);
    };

    const hasActiveFilters = searchTerm || selectedBrand || selectedCategory;

    const handleViewBatches = (product) => {
        setSelectedProduct(product);
        setShowBatchModal(true);
    };

    const handleCloseBatchModal = () => {
        setShowBatchModal(false);
        setSelectedProduct(null);
    };

    const filteredData = useMemo(() => {
        let result = reportData;
        
        if (searchTerm) {
            const t = searchTerm.trim().toLowerCase();
            result = result.filter(d => 
                (d.name || "").toLowerCase().includes(t) ||
                (d.code || "").toLowerCase().includes(t) ||
                (d.brand || "").toLowerCase().includes(t)
            );
        }
        
        if (selectedBrand) result = result.filter(d => d.brand === selectedBrand);
        if (selectedCategory) result = result.filter(d => d.product === selectedCategory);
        
        // Sort by name alphabetically
        result.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        return result;
    }, [searchTerm, selectedBrand, selectedCategory, reportData]);

    const total = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

    if (page > totalPages && totalPages > 0) setPage(totalPages);

    const displayedData = useMemo(() => {
        if (total === 0) return [];
        const start = (page - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, page, rowsPerPage, total]);

    const changePage = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    };

    return (
        <div className="md-page">
            <div className="md-card">
                <div className="md-card-inner">
                    <header className="md-card-header">
                        <div className="md-header-content">
                            <div className="md-header-left">
                                <h1 className="md-title">Product Inventory Report</h1>
                                <p className="md-subtitle">View and manage product inventory details</p>
                            </div>
                            <button 
                                className="md-refresh-btn" 
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </header>

                    {loading && (
                        <div className="md-loading">
                            Loading products data...
                        </div>
                    )}

                    {error && (
                        <div className="md-error">
                            ⚠️ Error Loading Data
                            <p style={{ marginTop: "10px" }}>{error}</p>
                            <button
                                style={{
                                    marginTop: "20px",
                                    padding: "10px 20px",
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                                onClick={handleRefresh}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <BatchModal 
                                isOpen={showBatchModal} 
                                onClose={handleCloseBatchModal} 
                                product={selectedProduct}
                            />
                            
                            <div className="md-filter-container">
                                <div className="md-filter-row">
                                    <div className="md-filter-left">
                                        <div className="md-filter-item md-filter-search compact">
                                            <label htmlFor="md-search">Search</label>
                                            <div className="md-search-wrap">
                                                <span className="md-search-icon">🔍</span>
                                                <input
                                                    id="md-search"
                                                    type="search"
                                                    placeholder="Search by name, code, or brand..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                {searchTerm && (
                                                    <button
                                                        type="button"
                                                        className="md-search-clear"
                                                        onClick={clearSearch}
                                                        aria-label="Clear search"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md-filter-item md-filter-area">
                                            <label>Filter by Brand</label>
                                            <div className="md-area-dropdown-container" ref={brandDropdownRef}>
                                                <button
                                                    type="button"
                                                    className="md-area-select-button"
                                                    onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                                                >
                                                    <span className="md-area-selected">
                                                        {selectedBrand || "All Brands"}
                                                    </span>
                                                    <span className="md-area-arrow">{isBrandDropdownOpen ? "▲" : "▼"}</span>
                                                </button>
                                                
                                                {isBrandDropdownOpen && (
                                                    <div className="md-area-dropdown-menu">
                                                        <div className="md-area-search-container">
                                                            <span className="md-area-search-icon">🔍</span>
                                                            <input
                                                                type="text"
                                                                placeholder="Search brands..."
                                                                value={brandSearchTerm}
                                                                onChange={(e) => setBrandSearchTerm(e.target.value)}
                                                                className="md-area-search-input"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        
                                                        <div className="md-area-options">
                                                            <div
                                                                className={`md-area-option ${!selectedBrand ? 'active' : ''}`}
                                                                onClick={() => handleBrandSelect("")}
                                                            >
                                                                All Brands
                                                                {!selectedBrand && <span className="md-check">✓</span>}
                                                            </div>
                                                            
                                                            {filteredBrands.length > 0 ? (
                                                                filteredBrands.map(brand => (
                                                                    <div
                                                                        key={brand}
                                                                        className={`md-area-option ${selectedBrand === brand ? 'active' : ''}`}
                                                                        onClick={() => handleBrandSelect(brand)}
                                                                    >
                                                                        {brand}
                                                                        {selectedBrand === brand && <span className="md-check">✓</span>}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="md-area-no-results">
                                                                    No brands found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md-filter-item md-filter-area">
                                            <label>Filter by Product</label>
                                            <div className="md-area-dropdown-container" ref={categoryDropdownRef}>
                                                <button
                                                    type="button"
                                                    className="md-area-select-button"
                                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                                >
                                                    <span className="md-area-selected">
                                                        {selectedCategory || "All Products"}
                                                    </span>
                                                    <span className="md-area-arrow">{isCategoryDropdownOpen ? "▲" : "▼"}</span>
                                                </button>
                                                
                                                {isCategoryDropdownOpen && (
                                                    <div className="md-area-dropdown-menu">
                                                        <div className="md-area-search-container">
                                                            <span className="md-area-search-icon">🔍</span>
                                                            <input
                                                                type="text"
                                                                placeholder="Search products..."
                                                                value={categorySearchTerm}
                                                                onChange={(e) => setCategorySearchTerm(e.target.value)}
                                                                className="md-area-search-input"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        
                                                        <div className="md-area-options">
                                                            <div
                                                                className={`md-area-option ${!selectedCategory ? 'active' : ''}`}
                                                                onClick={() => handleCategorySelect("")}
                                                            >
                                                                All Products
                                                                {!selectedCategory && <span className="md-check">✓</span>}
                                                            </div>
                                                            
                                                            {filteredCategories.length > 0 ? (
                                                                filteredCategories.map(cat => (
                                                                    <div
                                                                        key={cat}
                                                                        className={`md-area-option ${selectedCategory === cat ? 'active' : ''}`}
                                                                        onClick={() => handleCategorySelect(cat)}
                                                                    >
                                                                        {cat}
                                                                        {selectedCategory === cat && <span className="md-check">✓</span>}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="md-area-no-results">
                                                                    No products found
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            className="md-clear-filters-btn"
                                            onClick={clearAllFilters}
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </div>

                                <div className="md-secondary-row">
                                    <div className="md-filter-item">
                                        <label htmlFor="view-select">View</label>
                                        <div className="md-view-selector-inline">
                                            <select
                                                id="view-select"
                                                value={viewMode}
                                                onChange={(e) => setViewMode(e.target.value)}
                                            >
                                                <option value="table">📋 Table</option>
                                                <option value="grid">🎴 Grid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="md-filter-item">
                                        <label htmlFor="rows-select">Rows</label>
                                        <div className="md-rows-selector-inline">
                                            <select
                                                id="rows-select"
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value));
                                                    setPage(1);
                                                }}
                                            >
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {viewMode === 'table' ? (
                                <TableView data={displayedData} onViewBatches={handleViewBatches} />
                            ) : (
                                <GridView data={displayedData} onViewBatches={handleViewBatches} />
                            )}

                            <div className="md-pagination">
                                <button 
                                    className="md-page-btn" 
                                    onClick={() => changePage(1)} 
                                    disabled={page === 1 || total === 0}
                                >
                                    First
                                </button>

                                <button 
                                    className="md-page-btn" 
                                    onClick={() => changePage(page - 1)} 
                                    disabled={page === 1 || total === 0}
                                >
                                    Prev
                                </button>

                                <div className="md-page-info">
                                    {total === 0 ? "No records" : `Page ${page} of ${totalPages} (${total} products)`}
                                </div>

                                <button 
                                    className="md-page-btn" 
                                    onClick={() => changePage(page + 1)} 
                                    disabled={page === totalPages || total === 0}
                                >
                                    Next
                                </button>

                                <button 
                                    className="md-page-btn" 
                                    onClick={() => changePage(totalPages)} 
                                    disabled={page === totalPages || total === 0}
                                >
                                    Last
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Report;