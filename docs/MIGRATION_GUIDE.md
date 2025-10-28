# Migration Guide: Routes to Secure Menu IDs

## 🎯 Quick Overview

**Before (Less Secure):**
```javascript
allowedRoutes: ["/cash-book", "/bank-book"]
```

**After (More Secure):**
```javascript
allowedMenuIds: ["cash-book", "bank-book"]
```

## 📋 Complete Route → ID Mapping

| Old Route | New Menu ID | Menu Label |
|-----------|-------------|------------|
| `/item-details` | `item-details` | Item Details |
| `/cash-book` | `cash-book` | Cash Book |
| `/bank-book` | `bank-book` | Bank Book |
| `/debtors` | `debtors` | Debtors |
| `/company` | `company` | Company Info |
| `/punch-in` | `punch-in-action` | Punch In |
| `/punch-in/location` | `location-capture` | Location Capture |
| `/master/users` | `user-menu` | User Management |
| `/settings` | `settings` | Settings |

## 🔄 Automatic Migration (Browser)

### Quick Test Migration
Copy and paste this into your browser console:

```javascript
function migrateToSecureIds() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.allowedRoutes) {
        console.log('❌ No routes to migrate');
        return;
    }
    
    const routeToIdMap = {
        '/item-details': 'item-details',
        '/cash-book': 'cash-book',
        '/bank-book': 'bank-book',
        '/debtors': 'debtors',
        '/company': 'company',
        '/punch-in': 'punch-in-action',
        '/punch-in/location': 'location-capture',
        '/master/users': 'user-menu',
        '/settings': 'settings'
    };
    
    user.allowedMenuIds = user.allowedRoutes
        .map(route => routeToIdMap[route])
        .filter(id => id);
    
    delete user.allowedRoutes;
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('✅ Migrated!', user.allowedMenuIds);
    window.location.reload();
}

migrateToSecureIds();
```

## 🗄️ Backend Migration

### Database Update Script (SQL)

```sql
-- Add new column for menu IDs
ALTER TABLE users ADD COLUMN allowed_menu_ids JSON AFTER allowed_routes;

-- Update data: Convert routes to IDs
UPDATE users 
SET allowed_menu_ids = JSON_ARRAY(
  CASE WHEN JSON_CONTAINS(allowed_routes, '"/item-details"') THEN 'item-details' ELSE NULL END,
  CASE WHEN JSON_CONTAINS(allowed_routes, '"/cash-book"') THEN 'cash-book' ELSE NULL END,
  CASE WHEN JSON_CONTAINS(allowed_routes, '"/bank-book"') THEN 'bank-book' ELSE NULL END,
  CASE WHEN JSON_CONTAINS(allowed_routes, '"/debtors"') THEN 'debtors' ELSE NULL END,
  CASE WHEN JSON_CONTAINS(allowed_routes, '"/company"') THEN 'company' ELSE NULL END,
  CASE WHEN JSON_CONTAINS(allowed_routes, '"/punch-in"') THEN 'punch-in-action' ELSE NULL END,
  CASE WHEN JSON_CONTAINS(allowed_routes, '"/punch-in/location"') THEN 'location-capture' ELSE NULL END,
  CASE WHEN JSON_CONTAINS(allowed_routes, '"/master/users"') THEN 'user-menu' ELSE NULL END,
  CASE WHEN JSON_CONTAINS(allowed_routes, '"/settings"') THEN 'settings' ELSE NULL END
);

-- Remove NULL values from arrays
-- (Implementation depends on your SQL version)

-- Optional: Drop old column after verification
-- ALTER TABLE users DROP COLUMN allowed_routes;
```

### Backend API Migration (Node.js)

```javascript
// Migration script
const migrateUserPermissions = async () => {
  const routeToIdMap = {
    '/item-details': 'item-details',
    '/cash-book': 'cash-book',
    '/bank-book': 'bank-book',
    '/debtors': 'debtors',
    '/company': 'company',
    '/punch-in': 'punch-in-action',
    '/punch-in/location': 'location-capture',
    '/master/users': 'user-menu',
    '/settings': 'settings'
  };
  
  const users = await User.find({ allowedRoutes: { $exists: true } });
  
  for (const user of users) {
    user.allowedMenuIds = user.allowedRoutes
      .map(route => routeToIdMap[route])
      .filter(id => id);
    
    await user.save();
    console.log(`✅ Migrated user: ${user.username}`);
  }
  
  console.log(`✅ Migrated ${users.length} users`);
};

// Run migration
migrateUserPermissions();
```

### API Response Update

```javascript
// Before
app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  
  res.json({
    success: true,
    token: generateToken(user),
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      allowedRoutes: user.allowedRoutes  // ❌ Old
    }
  });
});

// After
app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  
  res.json({
    success: true,
    token: generateToken(user),
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      allowedMenuIds: user.allowedMenuIds  // ✅ New (more secure)
    }
  });
});
```

## ✅ Migration Checklist

### Frontend
- [ ] Verify `menuConfig.js` has `getMenuItemsByAllowedIds` function
- [ ] Confirm `Navbar.jsx` uses `allowedMenuIds` first, then falls back to `allowedRoutes`
- [ ] Test with new menu IDs in browser console
- [ ] Update any hardcoded permission checks

### Backend
- [ ] Add `allowed_menu_ids` column to database
- [ ] Run migration script to convert routes to IDs
- [ ] Update login API to return `allowedMenuIds`
- [ ] Update user creation/update endpoints
- [ ] Test API responses

### Testing
- [ ] Test admin user with all menu IDs
- [ ] Test regular user with limited menu IDs
- [ ] Verify dropdowns work with child menu IDs
- [ ] Check backward compatibility with old route-based users
- [ ] Test navigation functionality

## 🔍 Verification

### Check User Object
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log('Has allowedMenuIds:', !!user.allowedMenuIds);
console.log('Menu IDs:', user.allowedMenuIds);
```

### Verify Menu Rendering
```javascript
// In browser console
import { getMenuItemsByAllowedIds } from './constants/menuConfig';

const user = JSON.parse(localStorage.getItem('user'));
const items = getMenuItemsByAllowedIds(user.allowedMenuIds);
console.log('Menu Items:', items);
```

## 📊 Example Conversions

### Admin User
```javascript
// Before
{
  allowedRoutes: [
    "/item-details", "/cash-book", "/bank-book",
    "/debtors", "/company", "/punch-in",
    "/punch-in/location", "/master/users", "/settings"
  ]
}

// After
{
  allowedMenuIds: [
    "item-details", "cash-book", "bank-book",
    "debtors", "company", "punch-in-action",
    "location-capture", "user-menu", "settings"
  ]
}
```

### Sales Rep
```javascript
// Before
{
  allowedRoutes: [
    "/item-details", "/debtors",
    "/punch-in", "/punch-in/location"
  ]
}

// After
{
  allowedMenuIds: [
    "item-details", "debtors",
    "punch-in-action", "location-capture"
  ]
}
```

## 🚨 Common Issues

### Issue: Menus not showing after migration
**Solution:** Check menu ID spelling (case-sensitive)

### Issue: Dropdown parent not showing
**Solution:** You don't need parent IDs, just include child IDs

### Issue: Route navigation broken
**Solution:** Routes are still used internally, only menu filtering changed

## 🆘 Rollback Plan

If you need to rollback:

```javascript
// Backend: Keep both fields during transition
user.allowedRoutes = user.allowedRoutes;  // Keep old
user.allowedMenuIds = convertToIds(user.allowedRoutes);  // Add new

// Frontend: Already has fallback
const menuItems = user?.allowedMenuIds
    ? getMenuItemsByAllowedIds(user.allowedMenuIds)
    : user?.allowedRoutes
        ? getMenuItemsByAllowedRoutes(user.allowedRoutes)  // Fallback
        : [];
```

## 📞 Support

After migration:
1. Test all user roles
2. Verify navigation works
3. Check API responses
4. Monitor for errors

The system supports both formats during transition for zero downtime!
