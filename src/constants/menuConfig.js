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
    FaChartBar
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
    {
        id: 'master-debtors',
        type: MENU_TYPES.SIMPLE,
        label: 'Customers',
        icon: MdAccountBalanceWallet,
        route: '/masters/debtors',
        order: 1
    },

    // -------------------------------
    // Reports (Simple Menu Item)
    // -------------------------------
    {
        id: 'reports',
        type: MENU_TYPES.SIMPLE,
        label: 'Product Details',
        icon: FaFileAlt,
        route: '/reports',
        order: 2
    },

    {
        id: 'master-suppliers',
        type: MENU_TYPES.SIMPLE,
        label: 'Order Reports',
        icon: FaTruck,
        route: '/masters/suppliers',
        order: 3
    },

    // -------------------------------
    // Collection Report (Simple Menu Item)
    // -------------------------------
    {
        id: 'collection-report',
        type: MENU_TYPES.SIMPLE,
        label: 'Collection Report',
        icon: FaChartBar,
        route: '/reports/collection',
        order: 4
    },

    {
        id: 'debtors',
        type: MENU_TYPES.SIMPLE,
        label: 'Statements',
        icon: FaMoneyBillWave,
        route: '/debtors',
        order: 5
    },

    // -------------------------------
    // Bills Receivable
    // -------------------------------
    // {
    //     id: 'bills-receivable',
    //     type: MENU_TYPES.SIMPLE,
    //     label: 'Bills Receivable',
    //     icon: FaMoneyBillWave,
    //     route: '/bills/receivable',
    //     order: 3.5
    // },

    {
        id: 'area-assign',
        type: MENU_TYPES.SIMPLE,
        label: 'Area Assign',
        icon: RiUserLocationLine,
        route: '/area-assign',
        order: 6
    },
    {
        id: 'punch-in',
        type: MENU_TYPES.DROPDOWN,
        label: 'Punch In',
        icon: FaFingerprint,
        order: 7,
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
    {
        id: 'master',
        type: MENU_TYPES.DROPDOWN,
        label: 'Masters',
        icon: FaUniversity,
        route: '/masters',
        order: 8,
        children: [
            {
                id: 'users',
                label: 'Users',
                icon: FaUserFriends,
                route: '/masters/users'
            },
            {
                id: 'area-table',
                label: 'Area Table',
                icon: FaTable,
                route: '/masters/area-table'
            }
        ]
    },
    {
        id: 'settings',
        label: 'Settings',
        type: MENU_TYPES.DROPDOWN,
        icon: FaCog,
        order: 9,
        children: [
            {
                id: 'user-menu',
                label: 'User Management',
                icon: FaTable,
                route: '/masters/'
            },
            {
                id: 'company',
                label: 'Company Info',
                icon: FaBuilding,
                route: '/dashboard/user'
            },
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

// Get all menu IDs
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