import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.scss';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/store/authSlice';
import {
    MENU_CONFIG,
    MENU_TYPES,
    CHEVRON_ICONS,
    getMenuItemsByAllowedIds,
    getMenuItemsByAllowedRoutes
} from '../../constants/menuConfig';
import { NavLink } from 'react-router-dom';
/**
 * Navbar Component - Scalable Navigation with Secure Menu ID-Based Access
 * 
 * Features:
 * - Dynamic menu rendering from centralized configuration (menuConfig.js)
 * - Secure ID-based menu filtering (users get menu IDs, not actual routes)
 * - Hierarchical dropdown support with recursive rendering
 * - Mobile-responsive design with collapsible sidebar
 * - Consistent icon and routing management
 * 
 * Configuration:
 * - Menu items are defined in src/constants/menuConfig.js
 * - User access controlled via allowedMenuIds array (more secure than routes)
 * - Routes are mapped internally and hidden from client
 * - Supports both simple and dropdown menu types
 * 
 * Secure User Object Structure:
 * {
 *   id: 1,
 *   username: "john_doe",
 *   role: "Admin",
 *   allowedMenuIds: ["item-details", "bank-cash", "cash-book", "bank-book", ...]
 * }
 * 
 * Legacy support: Still accepts allowedRoutes for backward compatibility
 */
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState({});

    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const dispatch = useDispatch();

    // Get menu items based on user's allowed menu IDs (Secure approach)
    const menuItems =
        user?.role?.toLowerCase() === "admin"
            ? MENU_CONFIG
            : user?.allowedMenuIds?.length
                ? getMenuItemsByAllowedIds(user.allowedMenuIds)
                : [];

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            // Keep sidebar open on desktop, closed on mobile by default
            if (window.innerWidth > 768) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSidebar = () => {
        // Only allow toggle on mobile devices
        if (isMobile) {
            setIsOpen(!isOpen);
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleSubmenu = (menuId) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    // Navigate safely; route should be an absolute path like '/masters/debtors' or special key 'company'
    const handleNavigation = (route) => {
        if (!route) return;

        if (route === 'company') {
            if (user?.role === 'Admin') {
                navigate('/dashboard/admin');
            } else {
                navigate('/dashboard/user');
            }
        } else {
            // If route is a relative path accidentally provided, normalize it
            const target = route.startsWith('/') ? route : `/${route}`;
            navigate(target);
        }

        // Close sidebar on mobile after navigation
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        dispatch(logout())
        navigate('/');
    };

    // Get user initials for avatar
    const getUserInitials = (username) => {
        if (!username) return 'U';
        return username.charAt(0).toUpperCase();
    };

    // Helper to compute final target URL for a menu item / child
    const computeTargetRoute = (parent, child) => {
        // If child provided and has route
        if (child && child.route) {
            // Absolute route -> use as-is
            if (child.route.startsWith('/')) {
                return child.route;
            }
            // Relative child route -> join with parent (ensure single slash)
            const parentRoute = (parent && parent.route) ? parent.route.replace(/\/$/, '') : '';
            return `${parentRoute}/${child.route}`.replace(/\/+/g, '/');
        }

        // If child not provided, use parent.route (if available)
        if (parent && parent.route) {
            return parent.route.startsWith('/') ? parent.route : `/${parent.route}`;
        }

        // fallback
        return '/';
    };

    // Render menu items recursively
    const renderMenuItem = (item) => {
        const IconComponent = item.icon;
        const ChevronIcon = openSubmenus[item.id] ? CHEVRON_ICONS.OPEN : CHEVRON_ICONS.CLOSED;
        const isSubmenuOpen = openSubmenus[item.id];

        if (item.type === MENU_TYPES.SIMPLE) {
            const to = computeTargetRoute(item, null);
            return (
                <li key={item.id} onClick={() => handleNavigation(to)}>
                    {IconComponent && <IconComponent className="icon" />}
                    <span>{item.label}</span>
                </li>
            );
        }

        if (item.type === MENU_TYPES.DROPDOWN && item.children) {
            return (
                <li key={item.id} className={`menu-item ${isSubmenuOpen ? 'active' : ''}`}>
                    <div className="menu-main" onClick={() => toggleSubmenu(item.id)}>
                        {IconComponent && <IconComponent className="icon" />}
                        <span>{item.label}</span>
                        <ChevronIcon className="chevron" />
                    </div>
                    {isSubmenuOpen && (
                        <ul className="submenu">
                            {item.children.map(child => {
                                const ChildIcon = child.icon;
                                const to = computeTargetRoute(item, child);
                                return (
                                    <li key={child.id} onClick={() => handleNavigation(to)}>
                                        {ChildIcon && <ChildIcon style={{ marginRight: '8px' }} />}
                                        <span>{child.label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </li>
            );
        }

        return null;
    };

    return (
        <>

            <div className={`navbar-container-${isMobile ? 'mob' : 'desk'} `}>
                {/* Top Navbar with Profile Dropdown */}
                <div className="top-navbar">
                    <div className="profile-dropdown" ref={dropdownRef}>
                        <button
                            className="profile-button"
                            onClick={toggleDropdown}
                            aria-label="User menu"
                        >
                            <div className="profile-avatar">
                                {getUserInitials(user?.username)}
                            </div>
                            <svg
                                className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                            >
                                <path d="M6 8L2 4h8l-4 4z" fill="currentColor" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <div className="user-avatar">
                                        {getUserInitials(user?.username)}
                                    </div>
                                    <div className="user-info">
                                        <p className="username">{user?.username}</p>
                                        <p className="user-role">{user?.role}</p>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button
                                    className="logout-button"
                                    onClick={handleLogout}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <polyline
                                            points="16,17 21,12 16,7"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <line
                                            x1="21"
                                            y1="12"
                                            x2="9"
                                            y2="12"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Toggle button that appears when sidebar is collapsed (Mobile only) */}
                {isMobile && (
                    <button
                        className={`sidebar-toggle ${!isOpen ? 'show' : ''}`}
                        onClick={toggleSidebar}
                        aria-label="Open sidebar"
                    >
                        <FaBars />
                    </button>
                )}
            </div>

            {/* Side Navbar */}
            <div className={`sidebar ${!isOpen && isMobile ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    {isMobile && (
                        <button
                            className="toggle-btn"
                            onClick={toggleSidebar}
                            aria-label="Close sidebar"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <ul className="nav-menu">
                    {menuItems.map(renderMenuItem)}
                </ul>
            </div>

            {/* Overlay to close sidebar when clicking outside on mobile */}
            {isOpen && isMobile && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        zIndex: 999
                    }}
                />
            )}
        </>
    );
};

export default Navbar;
