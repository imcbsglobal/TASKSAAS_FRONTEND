import React, { memo, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
  IoMdArrowDropdown,
  IoMdArrowDropup
} from 'react-icons/io';
import {
  IoSearchSharp,
  IoLocation,
  IoChevronForward
} from 'react-icons/io5';
import { MdNotListedLocation } from 'react-icons/md';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import AddLocation from '../AddLocation';
import { useDebounce } from '../../../../hooks';
import { validateCustomer } from '../../../../utils/validators';
import { logger } from '../../../../utils/logger';
import VirtualizedCustomerList from '../VirtualizedCustomer';

const DEBOUNCE_DELAY = 300;

const ANIMATION_VARIANTS = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

// Memoized Customer Item Component
const CustomerItem = memo(({ customer, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(customer);
  }, [customer, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(customer);
    }
  }, [customer, onSelect]);

  const customerName = useMemo(() => {
    return customer.firm_name || customer.customerName || "Unnamed Customer";
  }, [customer]);

  const hasLocation = useMemo(() => {
    return Boolean(customer.latitude);
  }, [customer.latitude]);

  return (
    <div
      className="customer"
      onClick={handleClick}
      role="option"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <span className="customer-name">
        {customerName}
      </span>
      <div className="list_icons" aria-label={hasLocation ? "Location available" : "Location not available"}>
        {hasLocation ? (
          <IoLocation style={{ color: "#0bb838" }} />
        ) : (
          <MdNotListedLocation style={{ color: "red" }} />
        )}
      </div>
    </div>
  );
});

CustomerItem.propTypes = {
  customer: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
};

CustomerItem.displayName = 'CustomerItem';

// Customer Selection Step Component
const CustomerSelectionStep = memo(({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  onNext,
  isLoading,
  error
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

  // Memoized filtered customers with virtual scrolling support
  const filteredCustomers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return customers;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return customers.filter((customer) => {
      const name = (customer.name || customer.customerName || customer.firm_name || "").toLowerCase();
      return name.includes(searchLower);
    });
  }, [customers, debouncedSearchTerm]);

  const displayedCustomers = filteredCustomers;


  const handleCustomerSelect = useCallback((customer) => {
    // Immediate UI feedback
    setDropdownOpen(false);
    setSearchTerm("");

    // Debounce the actual selection to prevent lag
    requestAnimationFrame(() => {
      const validation = validateCustomer(customer);
      if (!validation.isValid) {
        logger.warn('Invalid customer selected:', validation.errors);
        return;
      }

      setSelectedCustomer(customer);
      logger.info('Customer selected:', { customerId: customer.id, customerName: customer.name || customer.firm_name });
    });
  }, [setSelectedCustomer]);

  const handleDropdownToggle = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  }, []);

  // Memoize the customer name display
  const selectedCustomerName = useMemo(() => {
    return selectedCustomer?.name || selectedCustomer?.customerName || selectedCustomer?.firm_name || "Select a customer";
  }, [selectedCustomer]);

  const canProceed = useMemo(() => {
    return selectedCustomer && selectedCustomer.latitude && selectedCustomer.longitude;
  }, [selectedCustomer]);

  return (
    <motion.div
      variants={ANIMATION_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      className="wizard_step customer_selection_step"
    >
      <h2>Select Customer</h2>

      {error && (
        <div className="error-message" role="alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="customer-dropdown" className="form-label">
          Customer *
        </label>
        <div
          id="customer-dropdown"
          className="drop_button"
          onClick={handleDropdownToggle}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          tabIndex={0}
        >
          {selectedCustomerName}
          <span className="dropdown-icon" aria-hidden="true">
            {dropdownOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </span>
        </div>

        {dropdownOpen && (
          <div className="dropdownOpen" role="listbox">
            <div className="input_section">
              <span className="search_icon" aria-hidden="true">
                <IoSearchSharp />
              </span>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
                aria-label="Search customers"
              />
            </div>

            <div className="customer-list">
              {isLoading ? (
                <div className="loading-state">
                  <LoadingSpinner size="small" />
                  <span>Loading customers...</span>
                </div>
              ) : displayedCustomers.length > 0 ? (
                <VirtualizedCustomerList
                  customers={filteredCustomers}
                  searchTerm={debouncedSearchTerm}
                  onSelect={handleCustomerSelect}
                />

              ) : (
                <div className="no-customers">
                  {searchTerm ? 'No matching customers found' : 'No customers available'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedCustomer && !selectedCustomer.latitude && (
        <div className="location-warning">
          <AddLocation customer={selectedCustomer} />
        </div>
      )}

      <div className="wizard_actions">
        <button
          className="wizard_btn primary"
          onClick={onNext}
          disabled={!canProceed || isLoading}
          aria-describedby={!canProceed ? "customer-help" : undefined}
        >
          Next <IoChevronForward aria-hidden="true" />
        </button>
        {!canProceed && (
          <div id="customer-help" className="help-text">
            Please select a customer with location data to continue
          </div>
        )}
      </div>
    </motion.div>
  );
});

CustomerSelectionStep.propTypes = {
  customers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    customerName: PropTypes.string,
    firm_name: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number
  })).isRequired,
  selectedCustomer: PropTypes.object,
  setSelectedCustomer: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

CustomerSelectionStep.displayName = 'CustomerSelectionStep';

export default CustomerSelectionStep;
