import React, { useEffect, useMemo, useState } from 'react'
import '../styles/StoreTable.scss'
import { GoSearch } from 'react-icons/go';
import { FaEye, FaMapMarkerAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';
import { PunchAPI } from '../services/punchService';
import BaseModal from '../../../components/ui/Modal/BaseModal';
import { formatDT, timeDiff, formatDateApi } from '@/utils';
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
            await PunchAPI.updatePunchinStatus({
                "shop_id": row.original.firm_code,
                "status": newStatus,
                "id": row.original.id,
                "createdBy": row.original.created_by
            });
            onStatusUpdate?.(row.original.id, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
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

const PunchinTable = () => {
    const [globalFilter, setGlobalFilter] = useState('')
    const [storesData, setStoresData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showPhoto, setShowPhoto] = useState(false)
    const [photoUrl, setPhotoUrl] = useState('')
    const userRole = useSelector((state) => state.auth?.user?.role)
    const [statusFilter, setStatusFilter] = useState('pending');
    const [fromDate, setFromDate] = useState(formatDateApi(new Date()));
    const [toDate, setToDate] = useState(formatDateApi(new Date()));
    const [showPunchDetails, setShowPunchDetails] = useState(false);
    const [selectedPunch, setSelectedPunch] = useState(null);
    const [userFilter, setUserFilter] = useState('all');
    const [usersList, setUsersList] = useState([]);

    // ── Fetch ALL users — no role filter ──────────────────────────────────
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token =
                    localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch('https://tasksas.com/api/users_api/list/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                });
                const result = await response.json();

                // Support both { users: [...] } and plain array responses
                const users =
                    result.users && Array.isArray(result.users)
                        ? result.users
                        : Array.isArray(result)
                        ? result
                        : [];

                // ✅ No role filter — ALL users included
                setUsersList(users);
            } catch (err) {
                console.error('Failed to fetch users list', err);
            }
        };
        fetchUsers();
    }, []);

    // ── Fetch punch-in table data ──────────────────────────────────────────
    useEffect(() => {
        const fetchTableData = async () => {
            try {
                setLoading(true)
                const response = await PunchAPI.getPunchinTable([fromDate, toDate])
                if (response?.data) {
                    setStoresData(response.data)
                } else {
                    console.warn("No data received from API")
                    setError("No Punch in Data available")
                }
            } catch (error) {
                console.error('Failed to fetch table data', error)
                setError(error.message || "Failed to load data")
            } finally {
                setLoading(false)
            }
        }
        fetchTableData()
    }, [fromDate, toDate])

    const handleStatusUpdate = (id, newStatus) => {
        setStoresData(prev =>
            prev.map(store => store.id === id ? { ...store, status: newStatus } : store)
        )
    }

    // ── Filter by status AND user ──────────────────────────────────────────
    // u.id in your API is the username string (e.g. "ARUN", "NAUFAL")
    // which directly matches store.created_by
    const filteredData = useMemo(() => {
        let data = storesData;

        if (statusFilter !== 'all') {
            data = data.filter(
                (store) => store.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        if (userFilter !== 'all') {
            data = data.filter(
                (store) => store.created_by === userFilter
            );
        }

        return data;
    }, [storesData, statusFilter, userFilter]);

    const userColumns = useMemo(() => [
        {
            header: "Store",
            accessorKey: "firm_name",
            cell: ({ row }) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {row.original.firm_name}
                        {row.original.latitude && row.original.longitude && (
                            <a
                                href={`https://www.google.com/maps?q=${row.original.latitude},${row.original.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}
                                title="View Store Location"
                            >
                                <FaMapMarkerAlt size={14} />
                            </a>
                        )}
                    </div>
                    {row.original.firm_location && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Address: {row.original.firm_location}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Punch Details",
            cell: ({ row }) => (
                <div
                    style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => { setSelectedPunch(row.original); setShowPunchDetails(true); }}
                >
                    <FaEye size={20} color="#2563eb" />
                </div>
            )
        },
        {
            header: "Current Location",
            accessorKey: "current_location",
            cell: ({ row }) => {
                const location = row.original.current_location;
                const coords = location ? location.split(',') : null;
                const hasValidCoords = coords && coords.length === 2;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ maxWidth: '180px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                            {location || 'N/A'}
                        </div>
                        {hasValidCoords && (
                            <a
                                href={`https://www.google.com/maps?q=${coords[0].trim()},${coords[1].trim()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                title="View Current Location on Map"
                            >
                                <FaMapMarkerAlt size={16} />
                            </a>
                        )}
                    </div>
                );
            }
        },
        {
            header: "Punch In Status",
            accessorKey: "punchin_status",
            cell: ({ row }) => {
                const punchinStatus = row.original.punchin_status;
                let bgColor = '#dbeafe', textColor = '#1e40af';
                if (punchinStatus?.toLowerCase() === 'manual') { bgColor = '#fef3c7'; textColor = '#92400e'; }
                else if (punchinStatus?.toLowerCase() === 'mismatch location') { bgColor = '#fee2e2'; textColor = '#ef4444'; }
                return (
                    <div style={{ padding: '4px 8px', borderRadius: '4px', display: 'inline-block', backgroundColor: bgColor, color: textColor, fontWeight: '500', fontSize: '13px' }}>
                        {punchinStatus || 'N/A'}
                    </div>
                );
            }
        },
        {
            header: "Punch In Location",
            cell: ({ row }) => {
                const { latitude, longitude } = row.original
                if (!latitude || !longitude) return 'N/A'
                return (
                    <a href={`https://www.google.com/maps?q=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer">
                        View on Map
                    </a>
                )
            }
        },
        {
            header: "Photo",
            cell: ({ row }) => (
                <div className='punchin-image' onClick={(e) => { setShowPhoto(prev => !prev); setPhotoUrl(e.target.src); }}>
                    <img src={row.original.photo_url} alt="404" />
                </div>
            )
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
            header: "Updated By",
            accessorKey: "created_by",
            cell: ({ getValue }) => getValue() || 'N/A'
        },
        {
            header: "Store",
            accessorKey: "firm_name",
            cell: ({ row }) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {row.original.firm_name}
                        {row.original.latitude && row.original.longitude && (
                            <a
                                href={`https://www.google.com/maps?q=${row.original.latitude},${row.original.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}
                                title="View Store Location"
                            >
                                <FaMapMarkerAlt size={14} />
                            </a>
                        )}
                    </div>
                    {row.original.firm_location && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Address: {row.original.firm_location}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Punch Details",
            cell: ({ row }) => (
                <div
                    style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => { setSelectedPunch(row.original); setShowPunchDetails(true); }}
                >
                    <FaEye size={20} color="#2563eb" />
                </div>
            )
        },
        {
            header: "Current Location",
            accessorKey: "current_location",
            cell: ({ row }) => {
                const location = row.original.current_location;
                const coords = location ? location.split(',') : null;
                const hasValidCoords = coords && coords.length === 2;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ maxWidth: '180px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                            {location || 'N/A'}
                        </div>
                        {hasValidCoords && (
                            <a
                                href={`https://www.google.com/maps?q=${coords[0].trim()},${coords[1].trim()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                title="View Current Location on Map"
                            >
                                <FaMapMarkerAlt size={16} />
                            </a>
                        )}
                    </div>
                );
            }
        },
        {
            header: "Punch In Status",
            accessorKey: "punchin_status",
            cell: ({ row }) => {
                const punchinStatus = row.original.punchin_status;
                let bgColor = '#dbeafe', textColor = '#1e40af';
                if (punchinStatus?.toLowerCase() === 'manual') { bgColor = '#fef3c7'; textColor = '#92400e'; }
                else if (punchinStatus?.toLowerCase() === 'mismatch location') { bgColor = '#fee2e2'; textColor = '#ef4444'; }
                return (
                    <div style={{ padding: '4px 8px', borderRadius: '4px', display: 'inline-block', backgroundColor: bgColor, color: textColor, fontWeight: '500', fontSize: '13px' }}>
                        {punchinStatus || 'N/A'}
                    </div>
                );
            }
        },
        {
            header: "View Location",
            cell: ({ row }) => {
                const { latitude, longitude } = row.original
                if (!latitude || !longitude) return 'N/A'
                return (
                    <a href={`https://www.google.com/maps?q=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer">
                        View on Map
                    </a>
                )
            }
        },
        {
            header: "Photo",
            cell: ({ row }) => (
                <div className='punchin-image' onClick={(e) => { setShowPhoto(prev => !prev); setPhotoUrl(e.target.src); }}>
                    <img src={row.original.photo_url} alt="404" />
                </div>
            )
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
        data: filteredData,
        columns: userRole === "Admin" ? adminColumns : userColumns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: { pagination: { pageSize: 10 } }
    })

    if (loading) {
        const columnsCount = userRole === "Admin" ? 8 : 7;
        return (
            <div className="table_section">
                <h4 className="table_title">Punch-in Table</h4>
                <div className="filter_search_section">
                    <Skeleton height={40} width="100%" />
                </div>
                <div className="table_container skeleton-loading">
                    <table>
                        <thead>
                            <tr>
                                {[...Array(columnsCount)].map((_, i) => (
                                    <th key={i}><Skeleton height={20} width="70%" /></th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(4)].map((_, r) => (
                                <tr key={r}>
                                    {[...Array(columnsCount)].map((_, c) => (
                                        <td key={c}><Skeleton height={20} width="90%" /></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (error) return <div className="error">Error: {error}</div>

    return (
        <div className='table_section'>
            <h4 className="table_title">Punch-in Table</h4>

            <div className="filter_search_section">
                {/* Search */}
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

                <div className="filters_section">

                    {/* Status Filter */}
                    <div className="filter_status">
                        <span className="filter_label">Status:</span>
                        <select
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

                    {/* ── User Filter — ALL users, u.id matches store.created_by ── */}
                    <div className="filter_status">
                        <span className="filter_label">User:</span>
                        <select
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            className="status-filter-select"
                        >
                            <option value="all">All Users</option>
                            {usersList.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* ──────────────────────────────────────────────────────── */}

                    {/* Date Filters */}
                    <div className="filter_date_inputs">
                        <div className="date_input_group">
                            <span className="filter_label">From:</span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="search_input date_field"
                            />
                        </div>
                        <div className="date_input_group">
                            <span className="filter_label">To:</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="search_input date_field"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="results_count">
                Showing {table.getFilteredRowModel().rows.length} of {storesData.length} results
            </div>

            {/* Table */}
            <div className="table_container">
                <table>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                                        <td key={cell.id} data-label={cell.column.columnDef.header}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={userRole === "Admin" ? 8 : 7} className="no-data">
                                    No stores found matching your search criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
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
                        {[10, 50, 100].map((size) => (
                            <option key={size} value={size}>Show {size}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Photo Modal */}
            {showPhoto && (
                <BaseModal
                    isOpen={showPhoto}
                    onClose={() => setShowPhoto(prev => !prev)}
                    children={
                        <div className='photo-model-container'>
                            <img src={photoUrl} alt="" />
                        </div>
                    }
                />
            )}

            {/* Punch Details Modal */}
            {showPunchDetails && selectedPunch && (
                <BaseModal
                    isOpen={showPunchDetails}
                    onClose={() => { setShowPunchDetails(false); setSelectedPunch(null); }}
                    children={
                        <div className="punch-details-content" style={{ padding: '20px' }}>
                            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                                Punch Details
                            </h3>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Punch In Time:</strong>{' '}
                                {selectedPunch.punchin_time ? formatDT(selectedPunch.punchin_time) : 'N/A'}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Punch Out Time:</strong>{' '}
                                {selectedPunch.punchout_time ? formatDT(selectedPunch.punchout_time) : 'N/A'}
                            </div>
                            <div>
                                <strong>Duration:</strong>{' '}
                                {timeDiff(selectedPunch.punchin_time, selectedPunch.punchout_time) || 'N/A'}
                            </div>
                        </div>
                    }
                />
            )}
        </div>
    )
}

export default PunchinTable