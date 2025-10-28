# API Client Documentation

## Overview
The application now uses a single, consolidated API client for all HTTP requests. This ensures consistency, better error handling, and easier maintenance.

## Architecture

### Single API Client (`src/services/apiClient.js`)
- **Purpose**: Centralized HTTP client for all API calls
- **Features**:
  - Automatic authentication token injection
  - Unified error handling
  - Response data extraction
  - Configurable timeouts and base URLs
  - Environment-aware logging

### Configuration (`src/app/config.js`)
- Environment-specific API base URLs
- Timeout configurations
- Logging levels
- Development vs Production settings

## Usage

### Import the API Client
```javascript
import apiClient from '../../../services/apiClient';
// or from services barrel export
import { apiClient } from '../../../services';
```

### Making API Calls
```javascript
// GET request
const data = await apiClient.get('/endpoint');

// POST request
const result = await apiClient.post('/endpoint', { data });

// PUT request
const updated = await apiClient.put('/endpoint/id', { data });

// DELETE request
await apiClient.delete('/endpoint/id');
```

### Authentication
- Tokens are automatically injected from localStorage
- Supports both separate `token` storage and `user.token` object
- Automatic logout on 401 responses

### Error Handling
- Structured error responses
- Automatic 401 handling (redirects to login)
- Development logging (controlled by LOG_LEVEL)
- Consistent error format across the application

## Migration Notes

### Removed Files
- `src/services/axiosConfig.js` - Redundant, consolidated into apiClient
- Multiple axios instances - Now single instance

### Backward Compatibility
- `API_BASE_URL` export maintained for legacy code
- Existing service patterns preserved
- Gradual migration path available

## Service Structure

### Feature-Based Services
```
src/features/
  auth/services/
  finance/services/
  punchin/services/
    punchService.js ✅ Uses apiClient
  dashboard/services/
```

### Core Services
```
src/services/
  apiClient.js ✅ Main API client
  api.js ✅ Legacy URL export
  index.js ✅ Barrel exports
```

## Benefits

1. **Consistency**: All requests use same headers, interceptors, and error handling
2. **Maintainability**: Single place to configure API behavior
3. **Security**: Centralized authentication and token management
4. **Performance**: Optimized with proper timeouts and response handling
5. **Development**: Better debugging and logging capabilities

## Environment Support

### Development
- Base URL: `http://localhost:3001/api`
- Debug logging enabled
- Dev tools integration

### Production
- Base URL: From `VITE_API_BASE_URL` environment variable
- Warn-level logging only
- Optimized for performance
