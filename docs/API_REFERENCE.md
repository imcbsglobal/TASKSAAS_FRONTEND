# API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints used in the Task WebApp Frontend, with special focus on the modular Punch-In system and consolidated API client architecture.

## 🏗️ API Architecture

### Unified API Client
The application uses a single, consolidated API client (`apiClient.js`) for all HTTP requests, ensuring:
- Consistent error handling
- Automatic authentication
- Unified request/response processing
- Environment-aware configuration

```javascript
// Import the unified API client
import apiClient from '../../../services/apiClient';

// Usage example
const data = await apiClient.get('/endpoint');
const result = await apiClient.post('/endpoint', payload);
```

## 📋 API Endpoints

### 1. Punch-In System APIs

#### Get Firms/Customers
Retrieves list of all available firms/customers for punch-in selection.

```javascript
// Endpoint
GET /shop-location/firms/

// Service Method
PunchAPI.getFirms()

// Response
{
  "firms": [
    {
      "id": 1,
      "firm_name": "Customer Name",
      "latitude": 10.123456,
      "longitude": 20.654321,
      "address": "Customer Address",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}

// Usage in Components
const { getCachedCustomers, setCachedCustomers } = useCustomerCache();

const fetchCustomers = async () => {
  try {
    // Check cache first
    const cached = getCachedCustomers();
    if (cached) return cached;

    // Fetch from API
    const response = await PunchAPI.getFirms();
    const customerData = response.firms || [];
    
    // Cache the result
    setCachedCustomers(customerData);
    return customerData;
  } catch (error) {
    logger.error('Failed to fetch customers:', error);
    throw error;
  }
};
```

#### Add Shop Location
Creates a new shop location for a firm.

```javascript
// Endpoint
POST /shop-location/

// Service Method
PunchAPI.AddShopLocation({ firm_name, latitude, longitude })

// Request Payload
{
  "firm_name": "New Customer Name",
  "latitude": 10.123456,
  "longitude": 20.654321
}

// Response
{
  "id": 123,
  "firm_name": "New Customer Name",
  "latitude": 10.123456,
  "longitude": 20.654321,
  "created_at": "2023-01-01T00:00:00Z"
}

// Usage in AddLocation Component
const handleAddLocation = async (locationData) => {
  try {
    const result = await PunchAPI.AddShopLocation({
      firm_name: customer.firm_name,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });
    
    logger.info('Location added successfully:', result);
    return result;
  } catch (error) {
    logger.error('Failed to add location:', error);
    throw error;
  }
};
```

#### Get Location Table
Retrieves location records table data.

```javascript
// Endpoint
GET /shop-location/table/

// Service Method
PunchAPI.LocationTable()

// Response
{
  "locations": [
    {
      "id": 1,
      "firm_name": "Customer Name",
      "latitude": 10.123456,
      "longitude": 20.654321,
      "address": "Full Address",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total_count": 25,
  "page": 1,
  "page_size": 10
}
```

#### Submit Punch-In
Submits a complete punch-in record with photo, location, and customer data.

```javascript
// Endpoint
POST /punch-in/

// Service Method
PunchAPI.punchIn({ customerId, image, location })

// Request Payload (FormData)
{
  "customer_id": 123,
  "image": File, // Captured photo file
  "latitude": 10.123456,
  "longitude": 20.654321,
  "accuracy": 10.5,
  "timestamp": "2023-01-01T12:00:00Z"
}

// Response
{
  "id": 456,
  "customer_id": 123,
  "image_url": "https://cdn.example.com/punch-in-photos/456.jpg",
  "latitude": 10.123456,
  "longitude": 20.654321,
  "accuracy": 10.5,
  "distance_from_shop": "0.05", // km
  "timestamp": "2023-01-01T12:00:00Z",
  "status": "success"
}

// Usage in Confirmation Step
const handlePunchIn = async () => {
  try {
    const punchInData = {
      customerId: selectedCustomer.id,
      image: capturedImage.file,
      location: {
        latitude: capturedLocation.latitude,
        longitude: capturedLocation.longitude,
        accuracy: capturedLocation.accuracy,
        timestamp: capturedLocation.timestamp
      }
    };

    const result = await PunchAPI.punchIn(punchInData);
    logger.info('Punch-in successful:', result);
    
    // Reset wizard state
    resetWizard();
    showSuccessMessage('Punched in successfully!');
  } catch (error) {
    logger.error('Punch-in failed:', error);
    showErrorMessage('Punch-in failed. Please try again.');
  }
};
```

### 2. Authentication APIs

#### Login
User authentication endpoint.

```javascript
// Endpoint
POST /auth/login/

// Request Payload
{
  "username": "user@example.com",
  "password": "securepassword"
}

// Response
{
  "access_token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "employee"
  }
}
```

#### Token Refresh
Refresh expired access tokens.

```javascript
// Endpoint
POST /auth/refresh/

// Request Payload
{
  "refresh_token": "jwt_refresh_token"
}

// Response
{
  "access_token": "new_jwt_access_token"
}
```

### 3. Dashboard APIs

#### Get Dashboard Data
Retrieves dashboard statistics and data.

```javascript
// Endpoint
GET /dashboard/stats/

// Response
{
  "total_punch_ins": 150,
  "today_punch_ins": 5,
  "active_customers": 25,
  "recent_activities": [
    {
      "id": 1,
      "type": "punch_in",
      "customer_name": "Customer A",
      "timestamp": "2023-01-01T12:00:00Z"
    }
  ]
}
```

### 4. Finance APIs

#### Bank Book
```javascript
// Endpoints
GET /finance/bank-book/
POST /finance/bank-book/
PUT /finance/bank-book/{id}/
DELETE /finance/bank-book/{id}/
```

#### Cash Book
```javascript
// Endpoints
GET /finance/cash-book/
POST /finance/cash-book/
PUT /finance/cash-book/{id}/
DELETE /finance/cash-book/{id}/
```

#### Debtors
```javascript
// Endpoints
GET /finance/debtors/
POST /finance/debtors/
PUT /finance/debtors/{id}/
DELETE /finance/debtors/{id}/
```

## 🔧 API Client Configuration

### Environment Configuration
```javascript
// src/app/config.js
const config = {
  development: {
    apiBaseUrl: 'http://localhost:3001',
    timeout: 10000,
    logLevel: 'debug'
  },
  staging: {
    apiBaseUrl: 'https://staging-api.yourdomain.com',
    timeout: 15000,
    logLevel: 'warn'
  },
  production: {
    apiBaseUrl: 'https://api.yourdomain.com',
    timeout: 10000,
    logLevel: 'error'
  }
};
```

### Request Interceptors
```javascript
// Automatic token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || 
                JSON.parse(localStorage.getItem('user'))?.token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

### Response Interceptors
```javascript
// Automatic error handling and data extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

## 🔒 Authentication & Security

### Token Management
```javascript
// Token storage and retrieval
const TokenManager = {
  getToken: () => {
    return localStorage.getItem('token') || 
           JSON.parse(localStorage.getItem('user'))?.token;
  },
  
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  isTokenValid: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
};
```

### Request Security
```javascript
// CSRF protection and security headers
const securityHeaders = {
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

## 📊 Error Handling

### Error Response Format
```javascript
// Standard error response structure
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "timestamp": "2023-01-01T12:00:00Z"
  }
}
```

### Error Handling Patterns
```javascript
// Service-level error handling
const handleApiError = (error, context) => {
  const errorInfo = {
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    message: error.response?.data?.error?.message || error.message,
    context
  };
  
  logger.error('API Error:', errorInfo);
  
  // User-friendly error messages
  const userMessage = getUserFriendlyMessage(error);
  throw new Error(userMessage);
};

const getUserFriendlyMessage = (error) => {
  const status = error.response?.status;
  
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
```

## 🧪 Testing API Calls

### Mocking API Responses
```javascript
// Jest mock for testing
jest.mock('../services/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Test example
test('fetches customers successfully', async () => {
  const mockCustomers = [
    { id: 1, firm_name: 'Test Customer', latitude: 10, longitude: 20 }
  ];
  
  apiClient.get.mockResolvedValue({ firms: mockCustomers });
  
  const result = await PunchAPI.getFirms();
  
  expect(apiClient.get).toHaveBeenCalledWith('/shop-location/firms/');
  expect(result.firms).toEqual(mockCustomers);
});
```

### Integration Testing
```javascript
// Integration test with real API calls
describe('Punch-In API Integration', () => {
  test('complete punch-in flow', async () => {
    // 1. Fetch customers
    const customers = await PunchAPI.getFirms();
    expect(customers.firms).toBeDefined();
    
    // 2. Submit punch-in
    const punchInData = {
      customerId: customers.firms[0].id,
      image: mockImageFile,
      location: mockLocationData
    };
    
    const result = await PunchAPI.punchIn(punchInData);
    expect(result.status).toBe('success');
  });
});
```

## 📈 Performance Optimization

### Caching Strategy
```javascript
// Customer data caching
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const CustomerCache = {
  get: () => {
    const cached = sessionStorage.getItem('customers_cache');
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;
    
    return isExpired ? null : data;
  },
  
  set: (data) => {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem('customers_cache', JSON.stringify(cacheData));
  }
};
```

### Request Optimization
```javascript
// Debounced API calls for search
const debouncedSearch = useDebounce(async (searchTerm) => {
  if (!searchTerm.trim()) return;
  
  try {
    const results = await apiClient.get(`/search?q=${encodeURIComponent(searchTerm)}`);
    setSearchResults(results);
  } catch (error) {
    logger.error('Search failed:', error);
  }
}, 300);
```

This API documentation provides comprehensive coverage of all endpoints, authentication, error handling, and best practices for the Task WebApp Frontend application.
