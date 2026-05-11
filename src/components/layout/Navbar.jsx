import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.scss';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/store/authSlice';
import {
    MENU_CONFIG,
    MENU_TYPES,
    CHEVRON_ICONS,
    getMenuItemsByAllowedIds,
} from '../../constants/menuConfig';
import sidebarLogo from '../../assets/sidebarlogo.jpg';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [openSubmenuId, setOpenSubmenuId] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const dispatch = useDispatch();

    const menuItems =
        user?.role?.toLowerCase() === 'admin'
            ? MENU_CONFIG
            : user?.allowedMenuIds?.length
                ? getMenuItemsByAllowedIds(user.allowedMenuIds)
                : [];

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsOpen(window.innerWidth > 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const activeParent = menuItems.find(
            item =>
                item.type === MENU_TYPES.DROPDOWN &&
                item.children?.some(child =>
                    isRouteActive(computeTargetRoute(item, child))
                )
        );
        setOpenSubmenuId(activeParent ? activeParent.id : null);
    }, [location.pathname]);

    const toggleSubmenu = (menuId) =>
        setOpenSubmenuId(prev => (prev === menuId ? null : menuId));

    const handleNavigation = (route) => {
        if (!route) return;
        navigate(route.startsWith('/') ? route : `/${route}`);
        if (isMobile) setIsOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        dispatch(logout());
        navigate('/');
    };

    const getUserInitials = (username) =>
        username ? username.charAt(0).toUpperCase() : 'U';

    const computeTargetRoute = (parent, child) => {
        if (child?.route) {
            if (child.route.startsWith('/')) return child.route;
            const base = parent?.route ? parent.route.replace(/\/$/, '') : '';
            return `${base}/${child.route}`.replace(/\/+/g, '/');
        }
        if (parent?.route) return parent.route.startsWith('/') ? parent.route : `/${parent.route}`;
        return '/';
    };

    const isRouteActive = (route) => {
        if (!route) return false;
        const target = route.startsWith('/') ? route : `/${route}`;
        return location.pathname === target;
    };

    const isDropdownActive = (item) =>
        item.children?.some(child => isRouteActive(computeTargetRoute(item, child)));

    const renderMenuItem = (item) => {
        const Icon = item.icon;

        if (item.type === MENU_TYPES.SIMPLE) {
            const to = computeTargetRoute(item, null);
            const active = isRouteActive(to);
            return (
                <li
                    key={item.id}
                    className={active ? 'nav-active' : ''}
                    onClick={() => handleNavigation(to)}
                >
                    {Icon && <Icon className="icon" />}
                    <span>{item.label}</span>
                </li>
            );
        }

        if (item.type === MENU_TYPES.DROPDOWN && item.children) {
            const dropActive = isDropdownActive(item);
            const isSubmenuOpen = openSubmenuId === item.id;
            const ChevronIcon = isSubmenuOpen ? CHEVRON_ICONS.OPEN : CHEVRON_ICONS.CLOSED;

            return (
                <li key={item.id} className={`menu-item ${dropActive ? 'active' : ''}`}>
                    <div className="menu-main" onClick={() => toggleSubmenu(item.id)}>
                        {Icon && <Icon className="icon" />}
                        <span>{item.label}</span>
                        <ChevronIcon className="chevron" />
                    </div>
                    {isSubmenuOpen && (
                        <ul className="submenu">
                            {item.children.map(child => {
                                const ChildIcon = child.icon;
                                const to = computeTargetRoute(item, child);
                                const childActive = isRouteActive(to);
                                return (
                                    <li
                                        key={child.id}
                                        className={childActive ? 'sub-active' : ''}
                                        onClick={() => handleNavigation(to)}
                                    >
                                        {ChildIcon && <ChildIcon />}
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
            <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>

                {/* ── Logo Header ── */}
                <div className="sidebar-header">
                    <img src={sidebarLogo} alt="Task SAS" className="sidebar-logo" />
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-text">TASK SAS</span>
                        <span className="sidebar-brand-sub">Management Portal</span>
                    </div>
                </div>

                {/* ── Nav Menu ── */}
                <ul className="nav-menu">
                    {menuItems.map(renderMenuItem)}
                </ul>

                {/* ── Profile pinned to bottom ── */}
                <div className="sidebar-profile">
                    <div className="profile-card">

                        <div className="profile-avatar-sidebar">
                            {getUserInitials(user?.username)}
                        </div>

                        <div className="profile-info">
                            <p className="profile-name-sidebar">{user?.username || 'Admin'}</p>
                            <p className="profile-role">{user?.role || 'Administrator'}</p>
                        </div>

                        <div
                            className="logout-icon-wrap"
                            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                            title="Sign out"
                        >
                            <svg viewBox="0 0 24 24" fill="none" className="logout-icon">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Mobile Overlay ── */}
            {isOpen && isMobile && (
                <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
            )}

            {/* ── Mobile floating toggle ── */}
            {isMobile && !isOpen && (
                <button
                    className="mobile-open-btn"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open sidebar"
                >
                    ☰
                </button>
            )}

            <style>{`
                .main-content {
                    margin-left: ${isMobile ? 0 : (isOpen ? 240 : 0)}px;
                    margin-top: 0;
                    transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </>
    );
};

export default Navbar;