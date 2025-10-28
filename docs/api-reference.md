---
**Title:** Task WebApp Frontend - API Reference  
**Description:** Complete backend API endpoint documentation with request/response examples  
**Last Updated:** October 2, 2025  
**Status:** Production Ready
---

# API Reference

## Table of Contents

- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [Punch-In Management](#punch-in-management)
- [Customer Management](#customer-management)
- [Financial Management](#financial-management)
- [Dashboard & Analytics](#dashboard--analytics)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [See Also](#see-also)

---

## Base Configuration

### API Base URL

```
Development:  http://localhost:3001/api
Staging:      https://staging-api.taskwebapp.com/api
Production:   https://api.taskwebapp.com/api
```

### Request Headers

All authenticated requests must include:

```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "timestamp": "2025-10-02T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* additional error details */ },
  "timestamp": "2025-10-02T10:30:00.000Z"
}
```

---

## Authentication

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePassword123!",
  "accountcode": "ACC001",
  "client_id": "CLIENT123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_123",
      "username": "john_doe",
      "role": "user",
      "client_id": "CLIENT123",
      "accountcode": "ACC001",
      "email": "john@example.com",
      "full_name": "John Doe"
    },
    "expires_in": 3600
  },
  "message": "Login successful"
}
```

**Error Responses:**

`401 Unauthorized` - Invalid credentials
```json
{
  "success": false,
  "error": "Invalid username or password",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

`403 Forbidden` - Account disabled
```json
{
  "success": false,
  "error": "Account has been disabled",
  "code": "AUTH_ACCOUNT_DISABLED"
}
```

**Example Usage:**
```javascript
import apiClient from './services/apiClient';

const login = async (credentials) => {
  try {
    const response = await apiClient.post('/login', credentials);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### Logout

Invalidate JWT token (optional, token can expire naturally).

**Endpoint:** `POST /logout`

**Headers:**
```http
Authorization: Bearer {jwt_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Refresh Token

Refresh JWT token before expiration.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

---

## Punch-In Management

### Get Active Punch-In

Retrieve current active punch-in session for the authenticated user.

**Endpoint:** `GET /punch-in/active`

**Headers:**
```http
Authorization: Bearer {jwt_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "punchin_id": "punch_456",
    "customer": {
      "id": "cust_789",
      "firm_name": "ABC Corp",
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "punch_in_time": "2025-10-02T09:00:00.000Z",
    "location": {
      "latitude": 12.9720,
      "longitude": 77.5950
    },
    "photo_url": "https://storage.example.com/photos/punch_456.jpg",
    "distance_from_customer": "45m",
    "status": "active"
  }
}
```

**Response:** `404 Not Found` (No active punch-in)
```json
{
  "success": false,
  "error": "No active punch-in found",
  "code": "PUNCH_NOT_FOUND"
}
```

### Create Punch-In

Submit a new punch-in record.

**Endpoint:** `POST /punch-in`

**Headers:**
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer_id": "cust_789",
  "location": {
    "latitude": 12.9720,
    "longitude": 77.5950,
    "accuracy": 10
  },
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2025-10-02T09:00:00.000Z",
  "distance_from_customer": 45,
  "device_info": {
    "platform": "android",
    "model": "SM-G998B",
    "os_version": "13"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "punchin_id": "punch_456",
    "punch_in_time": "2025-10-02T09:00:00.000Z",
    "customer": {
      "id": "cust_789",
      "firm_name": "ABC Corp"
    },
    "location": {
      "latitude": 12.9720,
      "longitude": 77.5950
    },
    "photo_url": "https://storage.example.com/photos/punch_456.jpg",
    "distance_validated": true,
    "status": "active"
  },
  "message": "Punch-in recorded successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Location validation failed",
  "code": "PUNCH_LOCATION_TOO_FAR",
  "details": {
    "distance": 150,
    "max_allowed": 100,
    "message": "You must be within 100 meters of the customer location"
  }
}
```

### Create Punch-Out

Submit punch-out for an active session.

**Endpoint:** `POST /punch-out/{punchin_id}`

**Headers:**
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "timestamp": "2025-10-02T17:00:00.000Z",
  "notes": "Completed all assigned tasks"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "punchin_id": "punch_456",
    "punch_in_time": "2025-10-02T09:00:00.000Z",
    "punch_out_time": "2025-10-02T17:00:00.000Z",
    "duration_hours": 8,
    "duration_minutes": 0,
    "status": "completed"
  },
  "message": "Punch-out recorded successfully"
}
```

### Get Punch-In History

Retrieve punch-in history with filters.

**Endpoint:** `GET /punch-in/history`

**Query Parameters:**
```
?start_date=2025-10-01
&end_date=2025-10-31
&status=completed
&customer_id=cust_789
&page=1
&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "punchin_id": "punch_456",
        "customer": {
          "id": "cust_789",
          "firm_name": "ABC Corp"
        },
        "punch_in_time": "2025-10-02T09:00:00.000Z",
        "punch_out_time": "2025-10-02T17:00:00.000Z",
        "duration_hours": 8,
        "distance_from_customer": "45m",
        "status": "completed"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

---

## Customer Management

### Get Customer List

Retrieve list of customers assigned to the user.

**Endpoint:** `GET /customers`

**Headers:**
```http
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
```
?search=ABC
&page=1
&limit=50
&has_location=true
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "cust_789",
        "firm_name": "ABC Corp",
        "contact_person": "Jane Smith",
        "phone": "+91-9876543210",
        "email": "jane@abccorp.com",
        "address": "123 Main Street, Bangalore",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "has_location": true,
        "status": "active"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 50,
      "pages": 1
    }
  }
}
```

### Get Customer Details

Retrieve detailed information for a specific customer.

**Endpoint:** `GET /customers/{customer_id}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cust_789",
    "firm_name": "ABC Corp",
    "contact_person": "Jane Smith",
    "phone": "+91-9876543210",
    "email": "jane@abccorp.com",
    "address": "123 Main Street, Bangalore",
    "city": "Bangalore",
    "state": "Karnataka",
    "postal_code": "560001",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "location_radius": 100,
    "has_location": true,
    "status": "active",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2025-09-01T14:30:00.000Z"
  }
}
```

---

## Financial Management

### Cash Book Entries

**Get Cash Book:** `GET /finance/cashbook`

**Query Parameters:**
```
?start_date=2025-10-01
&end_date=2025-10-31
&type=receipt|payment
&page=1
&limit=50
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "cb_123",
        "date": "2025-10-02",
        "type": "receipt",
        "amount": 5000.00,
        "description": "Cash sales",
        "category": "sales",
        "balance": 15000.00,
        "created_by": "usr_123",
        "created_at": "2025-10-02T10:30:00.000Z"
      }
    ],
    "summary": {
      "opening_balance": 10000.00,
      "total_receipts": 25000.00,
      "total_payments": 20000.00,
      "closing_balance": 15000.00
    },
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 50,
      "pages": 3
    }
  }
}
```

**Create Cash Book Entry:** `POST /finance/cashbook`

**Request Body:**
```json
{
  "date": "2025-10-02",
  "type": "receipt",
  "amount": 5000.00,
  "description": "Cash sales",
  "category": "sales"
}
```

### Bank Book Entries

**Get Bank Book:** `GET /finance/bankbook`

**Response:** Similar structure to Cash Book

### Debtors

**Get Debtors List:** `GET /finance/debtors`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "debtors": [
      {
        "id": "debt_456",
        "customer": {
          "id": "cust_789",
          "firm_name": "ABC Corp"
        },
        "total_outstanding": 50000.00,
        "aging": {
          "current": 10000.00,
          "30_days": 15000.00,
          "60_days": 15000.00,
          "90_days_plus": 10000.00
        },
        "last_payment_date": "2025-09-15",
        "last_payment_amount": 5000.00,
        "status": "overdue"
      }
    ],
    "summary": {
      "total_debtors": 25,
      "total_outstanding": 500000.00,
      "overdue_amount": 200000.00
    }
  }
}
```

---

## Dashboard & Analytics

### Admin Dashboard

**Endpoint:** `GET /dashboard/admin`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "active_users": 42,
      "active_punch_ins": 38,
      "completed_today": 4,
      "total_customers": 150
    },
    "attendance": {
      "present": 38,
      "absent": 4,
      "on_leave": 0,
      "late": 2
    },
    "financial_summary": {
      "cash_balance": 150000.00,
      "bank_balance": 500000.00,
      "total_outstanding": 300000.00,
      "today_collections": 25000.00
    },
    "recent_activity": [
      {
        "type": "punch_in",
        "user": "John Doe",
        "customer": "ABC Corp",
        "timestamp": "2025-10-02T09:00:00.000Z"
      }
    ]
  }
}
```

### User Dashboard

**Endpoint:** `GET /dashboard/user`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "today": {
      "punch_in_time": "2025-10-02T09:00:00.000Z",
      "duration": "8h 15m",
      "customer": "ABC Corp",
      "status": "active"
    },
    "this_month": {
      "total_days_worked": 18,
      "total_hours": 144,
      "average_hours_per_day": 8,
      "customers_visited": 12
    },
    "recent_punch_ins": [
      {
        "date": "2025-10-01",
        "customer": "XYZ Ltd",
        "punch_in": "09:00",
        "punch_out": "17:00",
        "hours": 8
      }
    ]
  }
}
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid username/password |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT token has expired |
| `AUTH_TOKEN_INVALID` | 401 | JWT token is malformed |
| `AUTH_UNAUTHORIZED` | 403 | User lacks required permissions |
| `PUNCH_NOT_FOUND` | 404 | Punch-in record not found |
| `PUNCH_ALREADY_ACTIVE` | 409 | User already has active punch-in |
| `PUNCH_LOCATION_TOO_FAR` | 400 | Location outside allowed radius |
| `CUSTOMER_NOT_FOUND` | 404 | Customer record not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `SERVER_ERROR` | 500 | Internal server error |

### Example Error Handling

```javascript
import apiClient from './services/apiClient';
import { toast } from 'react-toastify';

const handleApiCall = async () => {
  try {
    const response = await apiClient.get('/punch-in/active');
    return response.data;
  } catch (error) {
    // Error is already intercepted by apiClient
    if (error.code === 'PUNCH_NOT_FOUND') {
      // Handle no active punch-in
      return null;
    } else if (error.code === 'AUTH_TOKEN_EXPIRED') {
      // Redirect to login
      window.location.href = '/login';
    } else {
      // Show generic error
      toast.error(error.error || 'An error occurred');
    }
    throw error;
  }
};
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated Users:** 1000 requests per hour
- **Anonymous:** 100 requests per hour

Rate limit headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1696248000
```

When rate limit is exceeded:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600
}
```

---

## See Also

- [Architecture](./architecture.md) - System architecture
- [Development Guide](./development.md) - API client usage
- [Security](./security.md) - Authentication & authorization
- [Troubleshooting](./troubleshooting.md) - Common API issues
