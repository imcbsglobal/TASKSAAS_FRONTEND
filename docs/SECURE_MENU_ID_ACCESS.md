# Secure Menu ID-Based Access Control

## 🔐 Why Use Menu IDs Instead of Routes?

### Security Benefits

1. **Route Obfuscation**: Users never see actual route paths
2. **Reduced Attack Surface**: Attackers can't guess or enumerate routes from client-side code
3. **Easier Management**: Change routes without updating user permissions
4. **Cleaner API**: Simpler permission structure in database
5. **Better Abstraction**: Menu structure separated from routing logic

## 📊 Comparison: Routes vs Menu IDs

### ❌ Old Approach (Less Secure)
```javascript
// User object with exposed routes
{
  id: 1,
  username: "john_doe",
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
**Problems:**
- Exposes internal route structure
- Routes visible in browser developer tools
- Hard to change routes without breaking permissions
- Easier for attackers to probe the system

### ✅ New Approach (More Secure)
```javascript
// User object with abstracted menu IDs
{
  id: 1,
  username: "john_doe",
  role: "Admin",
  allowedMenuIds: [
    "item-details",
    "bank-cash",
    "cash-book",
    "bank-book",
    "debtors",
    "company",
    "punch-in",
    "location-capture",
    "punch-in-action",
    "master",
    "user-menu",
    "settings"
  ]
}
```
**Benefits:**
- Routes are mapped internally
- IDs don't reveal system structure
- Can change routes without updating permissions
- Cleaner and more maintainable

## 🎯 Available Menu IDs

| Menu ID | Label | Type | Route (Hidden from Client) |
|---------|-------|------|---------------------------|
| `item-details` | Item Details | Simple | `/item-details` |
| `bank-cash` | Bank & Cash | Dropdown | - |
| `cash-book` | Cash Book | Child | `/cash-book` |
| `bank-book` | Bank Book | Child | `/bank-book` |
| `debtors` | Debtors | Simple | `/debtors` |
| `company` | Company Info | Simple | `/company` |
| `punch-in` | Punch In | Dropdown | - |
| `location-capture` | Location Capture | Child | `/punch-in/location` |
| `punch-in-action` | Punch In | Child | `/punch-in` |
| `master` | Master | Dropdown | - |
| `user-menu` | User Management | Child | `/master/users` |
| `settings` | Settings | Child | `/settings` |

## 📝 User Configuration Examples

### Admin User (Full Access)
```javascript
{
  id: 1,
  username: "admin_user",
  role: "Admin",
  allowedMenuIds: [
    "item-details",
    "bank-cash",
    "cash-book",
    "bank-book",
    "debtors",
    "company",
    "punch-in",
    "location-capture",
    "punch-in-action",
    "master",
    "user-menu",
    "settings"
  ]
}
```

### Sales Representative
```javascript
{
  id: 2,
  username: "sales_rep",
  role: "Sales Rep",
  allowedMenuIds: [
    "item-details",
    "debtors",
    "punch-in",
    "location-capture",
    "punch-in-action"
  ]
}
```

### Accountant
```javascript
{
  id: 3,
  username: "accountant",
  role: "Accountant",
  allowedMenuIds: [
    "bank-cash",
    "cash-book",
    "bank-book",
    "debtors"
  ]
}
```

### Regular User
```javascript
{
  id: 4,
  username: "regular_user",
  role: "user",
  allowedMenuIds: [
    "punch-in",
    "location-capture",
    "punch-in-action"
  ]
}
```

## 🔧 Implementation

### Frontend (Navbar Component)
```javascript
// Navbar.jsx automatically uses allowedMenuIds if available
const menuItems = user?.allowedMenuIds
    ? getMenuItemsByAllowedIds(user.allowedMenuIds)
    : user?.allowedRoutes  // Fallback for backward compatibility
        ? getMenuItemsByAllowedRoutes(user.allowedRoutes)
        : [];
```

### Backend API Response
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Admin",
    "allowedMenuIds": [
      "item-details",
      "bank-cash",
      "cash-book",
      "bank-book",
      "debtors",
      "company",
      "punch-in",
      "location-capture",
      "punch-in-action",
      "master",
      "user-menu",
      "settings"
    ]
  }
}
```

### Database Schema
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  allowed_menu_ids JSON,  -- Store as JSON array of menu IDs
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Example insert
INSERT INTO users (username, email, password_hash, role, allowed_menu_ids) VALUES
('admin', 'admin@example.com', '$2b$10$...', 'Admin',
 '["item-details", "bank-cash", "cash-book", "bank-book", "debtors", "company", "punch-in", "location-capture", "punch-in-action", "master", "user-menu", "settings"]');
```

## 🧪 Testing

### Browser Console Test
```javascript
// Set test user with menu IDs
localStorage.setItem('user', JSON.stringify({
  id: 1,
  username: "test_admin",
  role: "Admin",
  allowedMenuIds: [
    "item-details",
    "bank-cash",
    "cash-book",
    "bank-book",
    "debtors",
    "company",
    "punch-in",
    "location-capture",
    "punch-in-action",
    "master",
    "user-menu",
    "settings"
  ]
}));
window.location.reload();
```

### Test Functions
```javascript
// Test Admin
function testSecureAdmin() {
  localStorage.setItem('user', JSON.stringify({
    id: 1,
    username: "admin_test",
    role: "Admin",
    allowedMenuIds: [
      "item-details", "bank-cash", "cash-book", "bank-book",
      "debtors", "company", "punch-in", "location-capture",
      "punch-in-action", "master", "user-menu", "settings"
    ]
  }));
  window.location.reload();
}

// Test Sales Rep
function testSecureSalesRep() {
  localStorage.setItem('user', JSON.stringify({
    id: 2,
    username: "sales_test",
    role: "Sales Rep",
    allowedMenuIds: [
      "item-details", "debtors", "punch-in",
      "location-capture", "punch-in-action"
    ]
  }));
  window.location.reload();
}

// Test Accountant
function testSecureAccountant() {
  localStorage.setItem('user', JSON.stringify({
    id: 3,
    username: "accountant_test",
    role: "Accountant",
    allowedMenuIds: [
      "bank-cash", "cash-book", "bank-book", "debtors"
    ]
  }));
  window.location.reload();
}

// Check current user
function checkUser() {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log('User:', user?.username);
  console.log('Menu IDs:', user?.allowedMenuIds);
  return user;
}
```

## 🔄 Migration from Route-Based to ID-Based

### Step 1: Update User Objects
Convert `allowedRoutes` to `allowedMenuIds`:

```javascript
// Old format
allowedRoutes: ["/cash-book", "/bank-book"]

// New format
allowedMenuIds: ["cash-book", "bank-book"]
```

### Step 2: Route to ID Mapping
| Route | Menu ID |
|-------|---------|
| `/item-details` | `item-details` |
| `/cash-book` | `cash-book` |
| `/bank-book` | `bank-book` |
| `/debtors` | `debtors` |
| `/company` | `company` |
| `/punch-in` | `punch-in-action` |
| `/punch-in/location` | `location-capture` |
| `/master/users` | `user-menu` |
| `/settings` | `settings` |

### Step 3: Update Backend API
```javascript
// Before
user.allowedRoutes = ["/cash-book", "/bank-book"];

// After
user.allowedMenuIds = ["cash-book", "bank-book"];
```

## 🛡️ Security Best Practices

### 1. Never Expose Routes in Client Code
```javascript
// ❌ BAD: Exposing routes
const routes = {
  cashBook: '/api/cash-book',
  bankBook: '/api/bank-book'
};

// ✅ GOOD: Using menu IDs
const menuIds = ['cash-book', 'bank-book'];
```

### 2. Always Validate on Backend
```javascript
// Backend route protection
app.get('/api/cash-book', authenticateUser, (req, res) => {
  // Check if user has permission for this route
  if (!hasAccessToRoute(req.user, '/api/cash-book')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  // ... handle request
});
```

### 3. Use Menu IDs for Permission Checks
```javascript
// Helper function
function hasMenuAccess(user, menuId) {
  return user.allowedMenuIds?.includes(menuId);
}

// Usage
if (hasMenuAccess(currentUser, 'cash-book')) {
  // Show cash book menu
}
```

## 📚 Helper Functions Available

```javascript
import { 
  getMenuItemsByAllowedIds,    // Get menu items by IDs
  getRouteById,                 // Get route from menu ID (internal use)
  isMenuIdAllowed,              // Check if menu ID is allowed
  getAllMenuIds                 // Get all available menu IDs
} from './constants/menuConfig';

// Usage examples
const menuItems = getMenuItemsByAllowedIds(['cash-book', 'bank-book']);
const route = getRouteById('cash-book'); // '/cash-book'
const allowed = isMenuIdAllowed('cash-book', user.allowedMenuIds);
const allIds = getAllMenuIds();
```

## 🔍 Troubleshooting

### Menu Items Not Showing
1. Check if `allowedMenuIds` exists in user object
2. Verify menu IDs match exactly (case-sensitive)
3. Check browser console for errors

### Dropdown Menu Not Appearing
1. Parent dropdown ID is not needed if you include children IDs
2. Include at least one child ID from the dropdown

### Backend Integration Issues
1. Ensure API returns `allowedMenuIds` array
2. Verify menu IDs are stored correctly in database
3. Check for typos in menu ID strings

## 📈 Benefits Summary

✅ **Enhanced Security**: Routes hidden from client  
✅ **Easier Maintenance**: Change routes without updating permissions  
✅ **Cleaner Code**: Better separation of concerns  
✅ **Flexible**: Support for both IDs and routes (backward compatible)  
✅ **Scalable**: Easy to add new menu items  
✅ **Testable**: Simple to test different permission levels  

This ID-based approach provides a more secure and maintainable solution for menu access control!
