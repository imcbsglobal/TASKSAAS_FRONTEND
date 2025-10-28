

/**
 * Module: VirtualizedCustomerList
 * A lightweight, scroll-based virtualized customer list with memoized rows.
 * Note: The list assumes a fixed row height (50px) and requires a scrollable container (via a constrained height) for correct virtualization.
 */


import React, { useRef, useEffect, useState, useCallback } from "react";
// Icons

import { IoLocation } from "react-icons/io5";
import {
    MdNotListedLocation,
} from "react-icons/md";

const CustomerItem = React.memo(({ customer, onSelect, itemHeight }) => {
    const handleClick = useCallback(() => {
        onSelect(customer);
    }, [customer, onSelect]);

    return (
        <div
            className="customer"
            onClick={handleClick}
            style={{ height: itemHeight }}
        >
            {customer.firm_name || customer.customerName || "Unnamed Customer"}
            <div className="list_icons">
                {customer.latitude ? (
                    <IoLocation style={{ color: "#0bb838" }} />
                ) : (
                    <MdNotListedLocation style={{ color: "red" }} />
                )}
            </div>
        </div>
    );
});

const VirtualizedCustomerList = React.memo(({ customers, onSelect, searchTerm }) => {
    const containerRef = useRef(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const itemHeight = 50; // Approximate height of each customer item

    const calculateVisibleRange = useCallback(() => {
        if (!containerRef.current) return;

        const scrollTop = containerRef.current.scrollTop;
        const clientHeight = containerRef.current.clientHeight;

        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
        const end = Math.min(
            customers.length,
            start + Math.ceil(clientHeight / itemHeight) + 10
        );

        setVisibleRange({ start, end });
    }, [customers.length, itemHeight]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', calculateVisibleRange, { passive: true });
            calculateVisibleRange(); // Initial calculation

            return () => container.removeEventListener('scroll', calculateVisibleRange);
        }
    }, [calculateVisibleRange]);

    // Calculate padding to maintain scroll height
    const topPadding = visibleRange.start * itemHeight;
    const bottomPadding = Math.max(0, (customers.length - visibleRange.end) * itemHeight);

    return (
        <div
            ref={containerRef}
            className="customer-list virtualized"
            style={{ overflow: 'auto' }}
        >
            <div style={{ height: topPadding }} />
            {customers.slice(visibleRange.start, visibleRange.end).map((customer) => (
                <CustomerItem
                    key={customer.id}
                    customer={customer}
                    onSelect={onSelect}
                    itemHeight={itemHeight}
                />
            ))}
            <div style={{ height: bottomPadding }} />
        </div>
    );
});
export default VirtualizedCustomerList;