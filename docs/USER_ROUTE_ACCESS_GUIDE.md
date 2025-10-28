# User-Based Route Access Control Guide

## Overview
This application uses a simple user-based route access control system where each user has an array of allowed routes stored in their user object.

## User Object Structure

```javascript
{
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  role: "Admin",
  allowedRoutes: [
    "/dashboard",
    "/item-details",
    "/cash-book",
    "/bank-book",
    "/debtors",
    "/company",
    "/punch-in",
    "/punch-in/location",
    "/master/users",
    "/settings"
  ]
}
```

## Example User Configurations

### Admin User (Full Access)
```javascript
{
  id: 1,
  username: "admin_user",
  role: "Admin",
  allowedRoutes: [
    "/dashboard",
    "/item-details",
    "/cash-book",
    "/bank-book",
    "/debtors",
    "/company",
    "/punch-in",
    "/punch-in/location",
    "/master/users",
    "/settings"
  ]
}
```

### Sales Representative (Limited Access)
```javascript
{
  id: 2,
  username: "sales_rep",
  role: "Sales Rep",
  allowedRoutes: [
    "/dashboard",
    "/item-details",
    "/debtors",
    "/punch-in",
    "/punch-in/location"
  ]
}
```

### Accountant (Finance Only)
```javascript
{
  id: 3,
  username: "accountant",
  role: "Accountant",
  allowedRoutes: [
    "/dashboard",
    "/cash-book",
    "/bank-book",
    "/debtors"
  ]
}
```

### Regular User (Minimal Access)
```javascript
{
  id: 4,
  username: "regular_user",
  role: "user",
  allowedRoutes: [
    "/dashboard",
    "/punch-in",
    "/punch-in/location"
  ]
}
```

## Testing Locally

To test different user access levels, you can manually set the user in localStorage:

### Method 1: Using Browser Console
```javascript
// Set Admin user
localStorage.setItem('user', JSON.stringify({
  id: 1,
  username: "admin_user",
  role: "Admin",
  allowedRoutes: [
    "/dashboard",
    "/item-details",
    "/cash-book",
    "/bank-book",
    "/debtors",
    "/company",
    "/punch-in",
    "/punch-in/location",
    "/master/users",
    "/settings"
  ]
}));

// Reload the page to see changes
window.location.reload();
```

### Method 2: Using Application
After login, ensure your API returns the user object with the `allowedRoutes` array.

## Backend API Response Example

Your login API should return:

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Admin",
    "allowedRoutes": [
      "/dashboard",
      "/item-details",
      "/cash-book",
      "/bank-book",
      "/debtors",
      "/company",
      "/punch-in",
      "/punch-in/location",
      "/master/users",
      "/settings"
    ]
  }
}
```

## Available Routes

Here are all the routes available in the application:

| Route | Menu Label | Parent Menu | Description |
|-------|-----------|-------------|-------------|
| `/dashboard` | Dashboard | - | Main dashboard |
| `/item-details` | Item Details | - | Inventory/Items management |
| `/cash-book` | Cash Book | Bank & Cash | Cash transactions |
| `/bank-book` | Bank Book | Bank & Cash | Bank transactions |
| `/debtors` | Debtors | - | Customer debts management |
| `/company` | Company Info | - | Company information |
| `/punch-in` | Punch In | Punch In | Employee punch in/out |
| `/punch-in/location` | Location Capture | Punch In | Location tracking |
| `/master/users` | User Management | Master | User administration |
| `/settings` | Settings | Master | System settings |

## How It Works

1. **User Login**: API returns user object with `allowedRoutes` array
2. **Store User**: User object is stored in localStorage
3. **Navbar Rendering**: Navbar reads `allowedRoutes` from user object
4. **Menu Filtering**: Only menu items matching allowed routes are displayed
5. **Route Protection**: ProtectedRoute component checks if user can access route

## Fallback Behavior

If a user object doesn't have the `allowedRoutes` property, the system falls back to role-based filtering using the `role` property:

- **Admin**: Gets access to all routes
- **user**: Gets access to basic routes

## Managing User Routes

### Adding a New Route to User
```javascript
// Get current user
const user = JSON.parse(localStorage.getItem('user'));

// Add new route
user.allowedRoutes.push('/new-route');

// Save back to localStorage
localStorage.setItem('user', JSON.stringify(user));
```

### Removing a Route from User
```javascript
// Get current user
const user = JSON.parse(localStorage.getItem('user'));

// Remove route
user.allowedRoutes = user.allowedRoutes.filter(route => route !== '/route-to-remove');

// Save back to localStorage
localStorage.setItem('user', JSON.stringify(user));
```

## Database Schema Example

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  allowed_routes JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Example insert
INSERT INTO users (username, email, password_hash, role, allowed_routes) VALUES
('admin', 'admin@example.com', '$2b$10$...', 'Admin',
 '["\/dashboard", "\/item-details", "\/cash-book", "\/bank-book", "\/debtors", "\/company", "\/punch-in", "\/punch-in\/location", "\/master\/users", "\/settings"]');
```

## Troubleshooting

### Navbar is Blank
1. Check if user object exists in localStorage
2. Verify `allowedRoutes` array is present and not empty
3. Check browser console for errors
4. Ensure routes in `allowedRoutes` match exactly with routes in `MENU_CONFIG`

### User Can't Access a Route
1. Verify the route is in the user's `allowedRoutes` array
2. Check for typos in route paths (case-sensitive)
3. Ensure route path includes leading slash (e.g., `/dashboard` not `dashboard`)

### Testing Different Users
```javascript
// Quick test function in browser console
function testUserAccess(allowedRoutes) {
  const testUser = {
    id: 999,
    username: "test_user",
    role: "Test",
    allowedRoutes: allowedRoutes
  };
  localStorage.setItem('user', JSON.stringify(testUser));
  window.location.reload();
}

// Usage
testUserAccess(["/dashboard", "/item-details"]);
```

## Security Notes

⚠️ **Important**: 
- Route access control in the frontend is for UX purposes only
- Always implement proper authorization on the backend
- Never trust client-side access control for security
- Validate user permissions on every API request
