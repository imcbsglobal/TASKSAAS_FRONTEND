// API endpoints and configurations
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PUNCHIN: {
    PUNCH: '/punchin',
    LOCATIONS: '/locations',
    RECORDS: '/records',
  },
  FINANCE: {
    BANKBOOK: '/finance/bankbook',
    CASHBOOK: '/finance/cashbook',
    DEBTORS: '/finance/debtors',
  },
  DASHBOARD: {
    ADMIN: '/dashboard/admin',
    USER: '/dashboard/user',
  },
};

// Application constants
export const APP_CONFIG = {
  APP_NAME: 'Task WebApp',
  VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  PAGINATION_SIZE: 10,
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_USER: '/dashboard/user',
  PUNCHIN: '/punchin',
  LOCATION_RECORDS: '/location-records',
  STORE_LOCATION: '/store-location',
  BANKBOOK: '/bankbook',
  CASHBOOK: '/cashbook',
  DEBTORS: '/debtors',
  BANKBOOK_LEDGER: '/bankbook-ledger',
  CASHBOOK_LEDGER: '/cashbook-ledger',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'app_theme',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};
