import React, { useEffect, useState, useMemo, useCallback } from "react";
import "../styles/StoreLocationCapture.scss";
import VirtualizedCustomerList from "../components/VirtualizedCustomer";

import AddLocation from "../components/AddLocation";

import {
  IoMdArrowDropdown,
  IoMdArrowDropup,
} from "react-icons/io";
import {
  IoSearchSharp,
} from "react-icons/io5";

import { PunchAPI } from "../services/punchService";

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

const StoreLocationCapture = React.memo(() => {
  const [customers, setCustomers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const cachedData = sessionStorage.getItem('customers_data');
        
        const response = await PunchAPI.getFirms();
        const firms = response.firms || [];
        setCustomers(firms);
      } catch (err) {
        console.error("Failed to fetch firms", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!debouncedSearchTerm) return customers;
    
    return customers.filter((c) => {
      const name = (c.name || c.customerName || c.firm_name || "").toLowerCase();
      return name.includes(debouncedSearchTerm.toLowerCase());
    });
  }, [customers, debouncedSearchTerm]);

  const handleCustomerSelect = useCallback((customer) => {
    setSelectedCustomer(customer);
    setDropdownOpen(false);
    setSearchTerm("");
  }, []);

  const handleDropdownToggle = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="container">
      <div className="customer_section">
        <h2>Select Customer</h2>

        <div 
          className="drop_button" 
          onClick={handleDropdownToggle}
          aria-expanded={dropdownOpen}
        >
          {selectedCustomer?.firm_name || selectedCustomer?.customerName || "Select a customer"}
          <span style={{ marginLeft: 8, display: "inline-flex" }}>
            {dropdownOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </span>
        </div>

        {dropdownOpen && (
          <div className="dropdownOpen">
            <div className="input_section">
              <span className="search_icon"><IoSearchSharp /></span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
              />
              {isLoading && <div className="loading-spinner">Loading...</div>}
            </div>

            {filteredCustomers.length > 0 ? (
              <VirtualizedCustomerList 
                customers={filteredCustomers}
                onSelect={handleCustomerSelect}
                searchTerm={debouncedSearchTerm}
              />
            ) : (
              <div className="no-customers">No matching customers</div>
            )}
          </div>
        )}

        {selectedCustomer && (
          <AddLocation customer={selectedCustomer} />
        )}
      </div>
    </div>
  );
});

export default StoreLocationCapture;