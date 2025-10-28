# Area Assignment Feature Documentation

## 📋 Overview

The Area Assignment page allows administrators to assign specific areas (customers/firms) to users. This ensures users only see and can punch-in to their assigned locations, improving data security and workflow efficiency.

## ✨ Features

### 1. **User Management**
- View all users in the system
- Search users by name, email, or role
- Display user information with role badges
- Visual selection with active state highlighting

### 2. **Area Assignment**
- Display all available areas/customers
- Multi-select areas for assignment
- Search areas by name or address
- View area details (name, address, coordinates)
- Grid and list view modes
- Bulk select/deselect all areas

### 3. **Progress Tracking**
- Real-time statistics dashboard
- Assignment progress bar
- Visual feedback for selections
- Assignment count display

### 4. **Responsive Design**
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Fixed footer on mobile devices

## 🎨 UI Components

### Statistics Cards
```jsx
- Total Users: Number of users in the system
- Total Areas: Number of available areas
- Assigned Areas: Currently selected areas for user
```

### User Selection Panel
- Scrollable user list
- Search functionality
- User cards with:
  - Avatar (first letter of username)
  - Username and email
  - Role badge (color-coded)
  - Active selection indicator

### Area Selection Panel
- View toggle (grid/list)
- Search functionality
- Bulk actions (Select All/Clear All)
- Progress bar
- Area cards with:
  - Custom checkbox
  - Firm name
  - Address
  - GPS coordinates
  - Selection badge

## 🔧 Technical Implementation

### Component Structure
```
AreaAssign/
├── AreaAssign.jsx          # Main component
├── AreaAssign.scss         # Responsive styles
└── Documentation           # This file
```

### State Management
```javascript
- users: Array of all users
- areas: Array of all areas/firms
- selectedUser: Currently selected user object
- selectedAreas: Array of selected area IDs
- searchUser: Search term for users
- searchArea: Search term for areas
- loading: Loading state
- saving: Save operation state
- viewMode: 'grid' or 'list'
```

### Key Functions

#### `fetchUsers()`
Fetches all users from the API using `SettingsApi.getUsers()`

#### `fetchAreas()`
Fetches all areas/firms from the API using `PunchAPI.getFirms()`

#### `fetchUserAreas(userId)`
Fetches assigned areas for a specific user

#### `handleUserSelect(user)`
Handles user selection and loads their assigned areas

#### `handleAreaToggle(areaId)`
Toggles area selection (add/remove from selectedAreas)

#### `handleSelectAll()`
Selects all filtered areas

#### `handleDeselectAll()`
Clears all area selections

#### `handleSaveAssignments()`
Saves area assignments to the backend

### API Integration

#### Required Backend Endpoints

```javascript
// Get all users
GET /get-users/
Response: {
  users: [
    {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      role: "Admin"
    }
  ]
}

// Get all areas/firms
GET /shop-location/firms/
Response: {
  firms: [
    {
      id: 1,
      firm_name: "ABC Corp",
      address: "123 Main St",
      latitude: 10.123456,
      longitude: 20.654321
    }
  ]
}

// Get user's assigned areas
GET /user-areas/{userId}/
Response: {
  user_id: 1,
  area_ids: [1, 2, 3]
}

// Update user's assigned areas
POST /user-areas/{userId}/
Body: {
  area_ids: [1, 2, 3]
}
Response: {
  success: true,
  message: "Areas assigned successfully"
}
```

## 📱 Responsive Breakpoints

```scss
$mobile: 576px      // < 576px
$tablet: 768px      // 576px - 767px
$desktop: 992px     // >= 992px
$large: 1200px      // >= 1200px
```

### Layout Changes

#### Mobile (< 576px)
- Single column layout
- Stacked panels
- Fixed footer with full-width buttons
- Reduced padding and font sizes
- Max height for panels to prevent overflow

#### Tablet (576px - 991px)
- Single column layout
- Increased spacing
- Stats in 2-column grid

#### Desktop (≥ 992px)
- Two-column layout (users | areas)
- Stats in 3-column grid
- User panel: 350px fixed width
- Area panel: Flexible width
- Optimal spacing and typography

## 🎨 SCSS Features

### Design System
```scss
// Colors
$primary-color: #3b82f6 (Blue)
$success-color: #10b981 (Green)
$danger-color: #ef4444 (Red)
$warning-color: #f59e0b (Orange)

// Shadows
$shadow-sm, $shadow-md, $shadow-lg, $shadow-xl

// Border Radius
$border-radius-sm, $border-radius-md, $border-radius-lg
```

### Mixins
```scss
@include respond-to(mobile)      // Mobile devices
@include respond-to(tablet)      // Tablets
@include respond-to(tablet-up)   // Tablet and above
@include respond-to(desktop)     // Desktop
@include respond-to(large)       // Large screens
```

### Animations
- Fade in on component mount
- Hover effects with transform
- Smooth transitions
- Loading spinner animation

## 🚀 Usage

### 1. Import Component
```javascript
import { AreaAssign } from '@features/punchin';
```

### 2. Add to Routes
```javascript
import { AreaAssign } from './features/punchin';

<Route path="/area-assign" element={<AreaAssign />} />
```

### 3. Add to Menu Config
```javascript
{
  id: 'area-assign',
  label: 'Area Assignment',
  path: '/area-assign',
  icon: 'fa-map-marked-alt',
  roles: ['Admin']
}
```

## 🔐 Security Considerations

### Role-Based Access
- Only admins should access this page
- Protected route implementation required
- Backend validation of user permissions

### Data Validation
- Validate user selection before saving
- Ensure area IDs exist in database
- Handle concurrent updates properly

## 🧪 Testing Checklist

### Functional Testing
- [ ] Load users and areas on mount
- [ ] Search users by name, email, role
- [ ] Search areas by name and address
- [ ] Select and deselect users
- [ ] Toggle area selection
- [ ] Select all/deselect all areas
- [ ] Save assignments successfully
- [ ] Display error messages on failure
- [ ] Show loading states properly

### Responsive Testing
- [ ] Mobile devices (< 576px)
- [ ] Tablets (576px - 991px)
- [ ] Desktop (≥ 992px)
- [ ] Large screens (≥ 1200px)
- [ ] Touch interactions
- [ ] Fixed footer on mobile

### UI/UX Testing
- [ ] Smooth animations and transitions
- [ ] Clear visual feedback
- [ ] Accessible keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast compliance
- [ ] Loading and empty states

## 🐛 Known Issues & TODOs

### TODOs
1. **Backend Integration**
   - Implement `getUserAreas` endpoint
   - Implement `updateUserAreas` endpoint
   - Add proper error handling and validation

2. **Features**
   - Add undo/redo functionality
   - Implement area assignment history
   - Add bulk user assignment
   - Export assignment reports
   - Add area groups/categories

3. **Performance**
   - Implement virtual scrolling for large lists
   - Add pagination for users/areas
   - Optimize re-renders with React.memo

4. **Accessibility**
   - Add ARIA labels
   - Improve keyboard navigation
   - Add focus management

## 📊 Performance Optimization

### Current Optimizations
- `useMemo` for filtered users and areas
- Debounced search inputs (if implemented)
- Optimistic UI updates
- Conditional rendering

### Future Optimizations
- Virtual scrolling for large datasets
- Lazy loading of area details
- Pagination for users and areas
- Web Workers for heavy computations

## 🎯 Best Practices

### Code Quality
- TypeScript support (future enhancement)
- PropTypes validation
- ESLint compliance
- Consistent naming conventions

### User Experience
- Immediate visual feedback
- Clear error messages
- Success confirmations
- Intuitive navigation

### Accessibility
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management

## 📚 Related Documentation

- [API Reference](../../docs/API_REFERENCE.md)
- [Menu Management Guide](../../docs/MENU_MANAGEMENT_GUIDE.md)
- [User Route Access Guide](../../docs/USER_ROUTE_ACCESS_GUIDE.md)
- [Component Guidelines](../../docs/COMPONENT_GUIDELINES.md)

## 🔗 Dependencies

```json
{
  "react": "^19.0.0-rc",
  "react-router-dom": "^6.x",
  "react-toastify": "^9.x",
  "sass": "^1.x"
}
```

## 🤝 Contributing

When modifying this component:
1. Follow the existing code style
2. Update this documentation
3. Add tests for new features
4. Ensure responsive design works
5. Update API documentation if needed

## 📝 Changelog

### Version 1.0.0 (Initial Release)
- ✅ User selection interface
- ✅ Area assignment interface
- ✅ Search functionality
- ✅ Grid and list view modes
- ✅ Responsive design
- ✅ Statistics dashboard
- ✅ Progress tracking
- ✅ Save functionality (API integration pending)

---

**Last Updated:** October 13, 2025
**Maintained By:** Development Team
**Status:** Active Development
