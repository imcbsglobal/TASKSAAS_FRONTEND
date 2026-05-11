// Font Awesome icons
import {
    FaBox,
    FaUniversity,
    FaMoneyBillWave,
    FaBuilding,
    FaFingerprint,
    FaCog,
    FaMapMarkerAlt,
    FaTable,
    FaChevronDown,
    FaChevronRight,
    FaUserFriends,
    FaTruck,
    FaFileAlt,
    FaChartBar,
    FaShoppingCart,
    FaUndoAlt,
    FaColumns         // ← Dashboard icon
} from 'react-icons/fa';

// Material icons
import { MdAccountBalanceWallet } from 'react-icons/md';

// Remix / Remix Icon
import { RiUserLocationLine } from 'react-icons/ri';

// Menu item types
export const MENU_TYPES = {
    SIMPLE: 'simple',
    DROPDOWN: 'dropdown'
};

// User roles for role-based menu filtering
export const USER_ROLES = {
    ADMIN: 'Admin',
    USER: 'user'
};

// Menu configuration with hierarchical structure
export const MENU_CONFIG = [

    // 0. Dashboard  ← NEW
    {
        id: 'dashboard',
        type: MENU_TYPES.SIMPLE,
        label: 'Dashboard',
        icon: FaColumns,
        route: '/dashboard',
        order: 0
    },

    // 1. Order Reports
    {
        id: 'master-suppliers',
        type: MENU_TYPES.SIMPLE,
        label: 'Order Reports',
        icon: FaTruck,
        route: '/masters/suppliers',
        order: 1
    },

    // 2. Sales Details
    {
        id: 'sales',
        type: MENU_TYPES.SIMPLE,
        label: 'Sales Details',
        icon: FaShoppingCart,
        route: '/reports/sales',
        order: 2
    },

    // 3. Sales Return
    {
        id: 'sales-return',
        type: MENU_TYPES.SIMPLE,
        label: 'Sales Return',
        icon: FaUndoAlt,
        route: '/reports/sales-return',
        order: 3
    },

    // 4. Collections
    {
        id: 'collection-report',
        type: MENU_TYPES.SIMPLE,
        label: 'Collections',
        icon: FaChartBar,
        route: '/reports/collection',
        order: 4
    },

    // 5. Statements
    {
        id: 'debtors',
        type: MENU_TYPES.SIMPLE,
        label: 'Statements',
        icon: FaMoneyBillWave,
        route: '/debtors',
        order: 5
    },

    // 6. Punch In
    {
        id: 'punch-in',
        type: MENU_TYPES.DROPDOWN,
        label: 'Punch In',
        icon: FaFingerprint,
        order: 6,
        children: [
            {
                id: 'location-capture',
                label: 'Location Capture',
                icon: FaMapMarkerAlt,
                route: '/punch-in/location'
            },
            {
                id: 'punch-in-action',
                label: 'Punch In',
                icon: FaFingerprint,
                route: '/punch-in'
            }
        ]
    },

    // 7. Master → Customers, Area
    {
        id: 'master',
        type: MENU_TYPES.DROPDOWN,
        label: 'Master',
        icon: FaUniversity,
        order: 7,
        children: [
            {
                id: 'master-debtors',
                label: 'Customers',
                icon: MdAccountBalanceWallet,
                route: '/masters/debtors'
            },
            {
                id: 'area-table',
                label: 'Area',
                icon: FaTable,
                route: '/masters/area-table'
            }
        ]
    },

    // 8. User Settings → Users, User Management
    {
        id: 'user-settings',
        type: MENU_TYPES.DROPDOWN,
        label: 'User Settings',
        icon: FaUserFriends,
        order: 8,
        children: [
            {
                id: 'users',
                label: 'Users',
                icon: FaUserFriends,
                route: '/masters/users'
            },
            {
                id: 'user-menu',
                label: 'User Management',
                icon: FaTable,
                route: '/masters/'
            }
        ]
    },

    // 9. Firm Information → Company Info, Logo, Bank QR
    {
        id: 'firm-information',
        type: MENU_TYPES.DROPDOWN,
        label: 'Firm Information',
        icon: FaBuilding,
        order: 9,
        children: [
            {
                id: 'company',
                label: 'Company Info',
                icon: FaBuilding,
                route: '/dashboard/user'
            },
            {
                id: 'settings-logo',
                label: 'Logo',
                icon: FaCog,
                route: '/settings/logo'
            },
            {
                id: 'settings-bank-qr',
                label: 'Bank QR',
                icon: FaCog,
                route: '/settings/bank-qr'
            }
        ]
    },

    // 10. Settings → Options, Developer Option, Area Assign
    {
        id: 'settings',
        type: MENU_TYPES.DROPDOWN,
        label: 'Settings',
        icon: FaCog,
        order: 10,
        children: [
            {
                id: 'settings-options',
                label: 'Options',
                icon: FaCog,
                route: '/settings/options'
            },
            {
                id: 'developer-options',
                label: 'Developer Option',
                icon: FaCog,
                route: '/settings/developer-options'
            },
            {
                id: 'area-assign',
                label: 'Area Assign',
                icon: RiUserLocationLine,
                route: '/area-assign'
            }
        ]
    }
];

// Helper function to get menu items by allowed menu IDs
export const getMenuItemsByAllowedIds = (allowedMenuIds = []) => {
    if (!allowedMenuIds || allowedMenuIds.length === 0) {
        return [];
    }

    const filterByIds = (item) => {
        const itemCopy = { ...item };
        const isAllowed = allowedMenuIds.includes(item.id);

        if (item.children) {
            const filteredChildren = item.children.filter(child =>
                allowedMenuIds.includes(child.id)
            );

            if (filteredChildren.length > 0) {
                itemCopy.children = filteredChildren;
                return itemCopy;
            }
        }

        if (isAllowed) {
            return itemCopy;
        }

        return null;
    };

    return MENU_CONFIG
        .map(filterByIds)
        .filter(item => item !== null)
        .sort((a, b) => a.order - b.order);
};

// Helper function to get route by menu ID
export const getRouteById = (menuId) => {
    for (const item of MENU_CONFIG) {
        if (item.id === menuId && item.route) {
            return item.route;
        }
        if (item.children) {
            for (const child of item.children) {
                if (child.id === menuId && child.route) {
                    return child.route;
                }
            }
        }
    }
    return null;
};

// Validate allowed menu IDs
export const isMenuIdAllowed = (menuId, allowedMenuIds = []) => {
    return allowedMenuIds.includes(menuId);
};

// Get all menu IDs (including dashboard)
export const getAllMenuIds = () => {
    const menuIds = [];

    MENU_CONFIG.forEach(item => {
        if (item.children) {
            item.children.forEach(child => {
                menuIds.push(child.id);
            });
        } else {
            menuIds.push(item.id);
        }
    });

    return menuIds;
};

// Get all routes
export const getAllRoutes = () => {
    const routes = [];

    MENU_CONFIG.forEach(item => {
        if (item.route) {
            routes.push(item.route);
        }
        if (item.children) {
            item.children.forEach(child => {
                if (child.route) {
                    routes.push(child.route);
                }
            });
        }
    });

    return routes;
};

// Less secure: filter by allowed routes
export const getMenuItemsByAllowedRoutes = (allowedRoutes = []) => {
    if (!allowedRoutes || allowedRoutes.length === 0) {
        return [];
    }

    const filterByRoutes = (item) => {
        const itemCopy = { ...item };
        const hasAllowedRoute = item.route && allowedRoutes.includes(item.route);

        if (item.children) {
            const filteredChildren = item.children.filter(child =>
                child.route && allowedRoutes.includes(child.route)
            );

            if (filteredChildren.length > 0) {
                itemCopy.children = filteredChildren;
                return itemCopy;
            }
        }

        if (hasAllowedRoute) {
            return itemCopy;
        }

        return null;
    };

    return MENU_CONFIG
        .map(filterByRoutes)
        .filter(item => item !== null)
        .sort((a, b) => a.order - b.order);
};

// Icons for chevron states
export const CHEVRON_ICONS = {
    OPEN: FaChevronDown,
    CLOSED: FaChevronRight
};

// Helper to check if a route is allowed
export const isRouteAllowed = (route, allowedRoutes = []) => {
    return allowedRoutes.includes(route);
};