import React, { useEffect, useMemo, useState } from 'react'
import '../styles/StoreTable.scss'
import { GoSearch } from 'react-icons/go';
import { useSelector } from 'react-redux';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';
import { PunchAPI } from '../services/punchService';
import { formatDT, formatDateApi } from '@/utils/';
import DatePickerFilter from './DatePickerFilter';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


const StatusCell = ({ initialStatus, row, onStatusUpdate }) => {
    const [status, setStatus] = useState(initialStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleChangeStatus = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setIsUpdating(true);

        try {
            // Call API to update status
            await PunchAPI.updateStatus({ "shop_id": row.original.firm_code, "status": newStatus });
            onStatusUpdate?.(row.original.id, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert to previous status on error
            setStatus(initialStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="status-cell-container">
            <select
                value={status}
                onChange={handleChangeStatus}
                disabled={isUpdating}
                className={`status-select ${status.replace(/\s+/g, '-').toLowerCase()}`}
            >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
            </select>
            {isUpdating && <span className="status-updating-indicator">Updating...</span>}
        </div>
    );
};

const StoreTable = () => {
    const [globalFilter, setGlobalFilter] = useState('')
    const [storesData, setStoresData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const userRole = useSelector((state) => state.auth?.user?.role)
    const [statusFilter, setStatusFilter] = useState('all');
    const [calendarDates, setCalendarDates] = useState([
        formatDateApi(new Date(new Date().setDate(new Date().getDate() - 6))),
        formatDateApi(new Date())
    ])

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                setLoading(true)
                const response = await PunchAPI.LocationTable(calendarDates)
                if (response?.data) {
                    setStoresData(response.data)
                }
            } catch (error) {
                console.error('Failed to fetch table data', error)
                setError(error.message || "Failed to load data")
            } finally {
                setLoading(false)
            }
        }
        fetchTableData()
    }, [calendarDates])

    const handleStatusUpdate = (id, newStatus) => {
        // Update local state to reflect the change immediately
        setStoresData(prev => prev.map(store =>
            store.id === id ? { ...store, status: newStatus } : store
        ))
    }

    // Filter data based on status filter
    const filteredData = useMemo(() => {
        if (statusFilter === 'all') {
            return storesData;
        }
        return storesData.filter(store =>
            store.status?.toLowerCase() === statusFilter.toLowerCase()
        );
    }, [storesData, statusFilter]);

    const userColumns = useMemo(() => [
        {
            header: "Store",
            accessorKey: "storeName"
        },
        {
            header: "Address",
            accessorKey: "storeLocation",
            cell: ({ getValue }) => {
                const value = getValue()
                return value && value.trim() !== "" ? value : <div style={{ "color": "red" }}>Address unavailable</div>
            }
        },
        {
            header: "Last Captured",
            accessorKey: "lastCapturedTime",
            cell: ({ getValue }) => {
                const value = getValue()
                return value ? formatDT(value) : 'N/A'
            }
        },
        {
            header: "View Location",
            cell: ({ row }) => {
                const { latitude, longitude } = row.original
                if (!latitude || !longitude) return 'N/A'

                const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
                return (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        View on Map
                    </a>
                )
            }
        },
        {
            header: "Status",
            cell: ({ row }) => {
                const { status } = row.original
                return (
                    <span className={`status-badge ${status?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`}>
                        {status || 'N/A'}
                    </span>
                )
            }
        }
    ], [])

    const adminColumns = useMemo(() => [
        {
            header: "Store",
            accessorKey: "storeName"
        },
        {
            header: "Address",
            accessorKey: "storeLocation",
            cell: ({ getValue }) => {
                const value = getValue()
                return value && value.trim() !== "" ? value : <div style={{ "color": "red" }}>Address unavailable</div>
            }
        },
        {
            header: "Last Captured",
            accessorKey: "lastCapturedTime",
            cell: ({ getValue }) => {
                const value = getValue()
                return value ? formatDT(value) : 'N/A'
            }
        },
        {
            header: "Updated By",
            accessorKey: "taskDoneBy",
            cell: ({ getValue }) => getValue() || 'N/A'
        },
        {
            header: "View Location",
            cell: ({ row }) => {
                const { latitude, longitude } = row.original
                if (!latitude || !longitude) return 'N/A'

                const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
                return (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        View on Map
                    </a>
                )
            }
        },
        {
            header: "Approval Status",
            accessorKey: "status",
            cell: ({ row }) => (
                <StatusCell
                    initialStatus={row.original.status}
                    row={row}
                    onStatusUpdate={handleStatusUpdate}
                />
            )
        },
    ], [handleStatusUpdate])

    const table = useReactTable({
        data: filteredData,  // Use filtered data instead of raw data
        columns: userRole === "Admin" ? adminColumns : userColumns,
        state: {
            globalFilter: globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: { pageSize: 10 }
        }
    })

    // if (loading) {
    //     return <div className="loading"><Skeleton /></div>
    // }

    if (loading) {
        const columnsCount = userRole === "Admin" ? 6 : 5;
        return (
            <div className="table_section">
                <h4 className="table_title">Recently Added Store Locations</h4>

                {/* Skeleton for Filters */}
                <div className="filter_search_section">
                    <Skeleton height={40} width="100%" />
                </div>

                {/* Skeleton Table */}
                <div className="table_container skeleton-loading">
                    <table>
                        <thead>
                            <tr>
                                {[...Array(columnsCount)].map((_, index) => (
                                    <th key={index}>
                                        <Skeleton height={20} width="70%" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(4)].map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {[...Array(columnsCount)].map((_, colIndex) => (
                                        <td key={colIndex}>
                                            <Skeleton height={20} width="90%" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }


    if (error) {
        return <div className="error">Error: {error}</div>
    }

    return (
        <div className='table_section'>
            <h4 className="table_title">Recently Added Store Locations</h4>
            <div className="filter_search_section">
                {/* Search Section */}
                <div className="search_section">
                    <GoSearch className="search_icon" />
                    <input
                        type="text"
                        placeholder="Search by store name or location..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="search_input"
                    />
                </div>
                {/* Filter Section */}
                <div className="filters_section">
                    <div className="filter_status">
                        <span className="filter_label">
                            Status :
                        </span>                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="status-filter-select"
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="filter_date">
                        <span className="filter_label">
                            Date:
                        </span>
                        <DatePickerFilter value={calendarDates} setCalendarDates={setCalendarDates} />
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="results_count">
                Showing {table.getFilteredRowModel().rows.length} of {storesData.length} results
            </div>

            {/* Table Container */}
            <div className="table_container">
                <table>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            data-label={cell.column.columnDef.header}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={userRole === "Admin" ? 6 : 5} className="no-data">
                                    No stores found matching your search criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            {table.getPageCount() > 1 && (
                <div className="pagination_controls">
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                    </button>
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </button>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                    >
                        {[5, 10, 20].map((size) => (
                            <option key={size} value={size}>
                                Show {size}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
}

export default StoreTable