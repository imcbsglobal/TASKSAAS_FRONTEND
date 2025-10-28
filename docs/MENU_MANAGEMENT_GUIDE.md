# Menu Management Page - User Guide

## 📋 Overview

The Menu Management page allows administrators to assign menu access permissions to users by selecting specific menu items. This integrates with the secure menu ID-based access control system.

## ✨ Features

### 1. User Selection
- **Dropdown List**: Select any user from a dropdown showing username, role, and email
- **User Info Card**: Displays detailed information about the selected user
- **Real-time Loading**: Shows loading state while fetching user permissions

### 2. Menu Item Management
- **Hierarchical View**: Displays parent menus and their children
- **Checkbox Selection**: Click to toggle menu access for each item
- **Parent/Child Handling**: Select parent to toggle all children at once
- **Visual Indicators**: Shows selection count and indeterminate states

### 3. Batch Actions
- **Select All**: Grant access to all menu items at once
- **Clear All**: Remove all menu access
- **Save Permissions**: Persist changes to the database

### 4. Visual Feedback
- **Loading States**: Spinners and disabled states during operations
- **Success Messages**: Confirmation when permissions are saved
- **Error Handling**: Clear error messages if something goes wrong
- **Selection Counter**: Real-time count of selected menu items

## 🎯 How to Use

### Step 1: Select a User
1. Click on the dropdown labeled "Select User"
2. Choose a user from the list
3. Wait for their current permissions to load
4. Review the user info card showing their details

### Step 2: Manage Menu Permissions
1. **Check/Uncheck Individual Items**: Click the checkbox next to any menu item
2. **Toggle Dropdown Menus**: Click the parent checkbox to select/deselect all children
3. **View Selection Count**: See how many items are selected in the header

### Step 3: Save Changes
1. Review your selections
2. Click "Save Permissions" button
3. Wait for the success confirmation
4. Changes are now applied to the user

## 📊 Menu Item Structure

### Simple Menu Items
```
☐ Item Details
☐ Debtors
☐ Company Info
```
- Single checkbox
- Direct navigation route

### Dropdown Menus
```
☐ Bank & Cash (Dropdown) [2/2]
  ☐ Cash Book
  ☐ Bank Book
```
- Parent checkbox affects all children
- Shows count of selected children
- Indeterminate state when some children selected

## 🔧 Integration with Backend

### API Endpoints Required

#### 1. Get All Users
```javascript
GET /api/users
Response: [
  {
    id: 1,
    username: "john_doe",
    email: "john@example.com",
    role: "Admin"
  },
  ...
]
```

#### 2. Get User Permissions
```javascript
GET /api/users/:userId/permissions
Response: {
  userId: 1,
  allowedMenuIds: ["item-details", "cash-book", ...]
}
```

#### 3. Update User Permissions
```javascript
PUT /api/users/:userId/permissions
Body: {
  allowedMenuIds: ["item-details", "cash-book", ...]
}
Response: {
  success: true,
  message: "Permissions updated successfully"
}
```

### Code Integration

Replace the mock data with actual API calls:

```javascript
// In MenuManagement.jsx

// Fetch users
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  fetchUsers();
}, []);

// Load user permissions
const handleUserSelect = async (userId) => {
  if (!userId) {
    setSelectedUser(null);
    setSelectedMenuIds([]);
    return;
  }

  setLoading(true);
  const user = users.find(u => u.id === parseInt(userId));
  setSelectedUser(user);

  try {
    const response = await fetch(`/api/users/${userId}/permissions`);
    const data = await response.json();
    setSelectedMenuIds(data.allowedMenuIds || []);
  } catch (error) {
    console.error('Error loading permissions:', error);
  } finally {
    setLoading(false);
  }
};

// Save permissions
const handleSavePermissions = async () => {
  if (!selectedUser) return;
  
  setLoading(true);
  setSaveStatus('');
  
  try {
    const response = await fetch(`/api/users/${selectedUser.id}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        allowedMenuIds: selectedMenuIds
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setSaveStatus('success');
    } else {
      setSaveStatus('error');
    }
    
    setTimeout(() => setSaveStatus(''), 3000);
  } catch (error) {
    console.error('Error saving permissions:', error);
    setSaveStatus('error');
    setTimeout(() => setSaveStatus(''), 3000);
  } finally {
    setLoading(false);
  }
};
```

## 🎨 UI Components

### User Info Card
- **Background**: Gradient purple/blue
- **Content**: Username, Role, Email, Selected menu count
- **Purpose**: Quick overview of user being managed

### Menu Item Checkbox
- **Unchecked**: Gray border
- **Checked**: Blue background with white checkmark
- **Indeterminate**: Orange background (parent with some children selected)
- **Disabled**: Gray background (during loading)

### Action Buttons
- **Save Permissions**: Primary button (gradient purple)
- **Select All**: Secondary button (gray)
- **Clear All**: Secondary button (gray)

### Status Messages
- **Success**: Green background, checkmark icon
- **Error**: Red background, X icon
- **Auto-dismiss**: 3 seconds

## 🔒 Security Considerations

### 1. Route Protection
Ensure only admins can access this page:

```javascript
// In App.jsx or routes config
<Route
  path="/menu-management"
  element={
    <ProtectedRoute requiredRole="Admin">
      <MenuManagement />
    </ProtectedRoute>
  }
/>
```

### 2. API Authorization
All API calls should include authentication:

```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}
```

### 3. Backend Validation
Always validate on the backend:
- Check if requesting user is admin
- Verify menu IDs are valid
- Validate user exists
- Log all permission changes

## 📱 Responsive Design

### Desktop (> 768px)
- Full width layout
- Side-by-side buttons
- Optimal spacing

### Mobile (< 768px)
- Stacked layout
- Full-width buttons
- Reduced padding
- Optimized for touch

## 🧪 Testing

### Test Scenarios

1. **User Selection**
   - Select different users
   - Verify permissions load correctly
   - Check loading states

2. **Menu Toggle**
   - Check individual items
   - Toggle parent menus
   - Verify indeterminate states

3. **Batch Actions**
   - Click "Select All"
   - Click "Clear All"
   - Verify state updates

4. **Save Operation**
   - Save with changes
   - Verify success message
   - Check error handling

5. **Edge Cases**
   - No users available
   - Network errors
   - Invalid permissions

## 🐛 Troubleshooting

### Issue: Users not loading
**Solution**: Check API endpoint and network connection

### Issue: Permissions not saving
**Solution**: Verify authentication token and API authorization

### Issue: Checkboxes not working
**Solution**: Check if user is selected and not in loading state

### Issue: Indeterminate state not showing
**Solution**: Ensure CSS for `.indeterminate` class is loaded

## 📈 Future Enhancements

1. **Search Users**: Add search/filter for user dropdown
2. **Bulk Edit**: Select multiple users to update at once
3. **Permission Templates**: Save/load common permission sets
4. **Audit Log**: Track who changed what and when
5. **Role-based Defaults**: Auto-suggest permissions based on role
6. **Export/Import**: Export permissions to CSV/JSON

## 💡 Tips

1. **Use Dropdown Parents**: Instead of selecting all children individually, click the parent
2. **Check Selection Count**: Use the counter in the header to verify your selections
3. **Save Frequently**: Save changes before switching users to avoid losing work
4. **Review Before Saving**: Double-check permissions before clicking save

## 🔗 Related Documentation

- `docs/SECURE_MENU_ID_ACCESS.md` - Menu ID system details
- `docs/MIGRATION_GUIDE.md` - Migration from route-based to ID-based
- `docs/test-secure-menu-ids.js` - Test functions for menu IDs

---

This page provides a user-friendly interface for managing menu access permissions while maintaining the security of the ID-based system!
