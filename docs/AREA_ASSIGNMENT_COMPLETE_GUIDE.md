# 🗺️ Area Assignment System - Complete Guide

## Overview

The Area Assignment System consists of two main pages that work together to manage user access to specific geographical areas/customers:

1. **Area Assignment Page** - Assign areas to users (Step-by-step wizard)
2. **View Assigned Areas Page** - View current assignments and history

---

## 📋 Table of Contents

- [Page 1: Area Assignment](#page-1-area-assignment)
- [Page 2: View Assigned Areas](#page-2-view-assigned-areas)
- [API Requirements](#api-requirements)
- [Database Schema](#database-schema)
- [Integration Guide](#integration-guide)
- [Testing Guide](#testing-guide)

---

## Page 1: Area Assignment

### 🎯 Purpose
Admin users can assign specific areas/customers to individual users in a two-step wizard process.

### ✨ Features

#### Step 1: Select User
- Grid view of all users
- Search by username, email, or role
- Large clickable user cards with:
  - User avatar
  - Username and email
  - Role badge (color-coded)
  - Arrow indicator
- Responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)

#### Step 2: Assign Areas
- Grid or list view toggle
- Search areas by name or address
- Multi-select with checkboxes
- Real-time progress bar
- Select All / Clear All buttons
- Statistics dashboard showing:
  - Selected user info
  - Total areas available
  - Selected areas count
  - Assignment progress percentage

### 🎨 UI Components

```
┌──────────────────────────────────────────────────────┐
│  📍 Area Assignment           [View Assignments →]   │
│  Step 1: Select a user to assign areas              │
│                                                      │
│  ┌────────┐ ━━━━━━ ┌────────┐                      │
│  │   1 ✓  │ ──────  │   2    │  (Step Indicator)    │
│  └────────┘         └────────┘                      │
└──────────────────────────────────────────────────────┘

STEP 1: User Selection
┌──────────────────────────────────────────────────────┐
│  🔍 [Search users by name, email, or role...]       │
├──────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │     JD     │  │     JS     │  │     MW     │    │
│  │ John Doe   │  │ Jane Smith │  │ Mike Wilson│    │
│  │ john@...   │  │ jane@...   │  │ mike@...   │    │
│  │ [ADMIN]    │  │ [USER]     │  │ [SALES]    │    │
│  │     →      │  │     →      │  │     →      │    │
│  └────────────┘  └────────────┘  └────────────┘    │
└──────────────────────────────────────────────────────┘

STEP 2: Area Assignment
┌──────────────────────────────────────────────────────┐
│  ← John Doe | [⊞] [≡]              [Select All]     │
│  🔍 [Search areas...]                [Clear All]     │
│  ━━━━━━━━━━━━━━░░░░ 25/150 (17%)                   │
├──────────────────────────────────────────────────────┤
│  ☑ ABC Corp          ☐ XYZ Ltd        ☑ DEF Inc     │
│  📍 123 Main St      📍 456 Oak Ave   📍 789 Pine    │
│  📌 10.1, 20.6       📌 10.2, 20.7    📌 10.3, 20.8  │
└──────────────────────────────────────────────────────┘
│  25 area(s) selected for John Doe                    │
│  [Back]                     [💾 Save Assignments]    │
└──────────────────────────────────────────────────────┘
```

### 🔧 Technical Details

**File:** `src/features/punchin/pages/AreaAssign.jsx`
**Styles:** `src/features/punchin/pages/AreaAssign.scss`

**State Management:**
```javascript
- step: 1 or 2 (wizard step)
- users: Array of all users
- areas: Array of all areas
- selectedUser: Currently selected user object
- selectedAreas: Array of selected area IDs
- searchUser: Search term for users (step 1)
- searchArea: Search term for areas (step 2)
- loading: Loading state
- saving: Save operation state
- viewMode: 'grid' or 'list'
```

**Key Functions:**
- `handleUserSelect(user)` - Select user and move to step 2
- `handleBackToUsers()` - Go back to step 1
- `handleAreaToggle(areaId)` - Toggle area selection
- `handleSelectAll()` - Select all filtered areas
- `handleDeselectAll()` - Clear all selections
- `handleSaveAssignments()` - Save assignments to backend

---

## Page 2: View Assigned Areas

### 🎯 Purpose
View current area assignments for all users and track assignment history.

### ✨ Features

#### User Selection Sidebar
- Scrollable list of all users
- Search functionality
- Active user highlighting
- Shows user role and email

#### User Info Banner
- Large user avatar
- Username and email
- Role badge
- Statistics:
  - Number of assigned areas
  - Number of history records

#### Two Tabs

##### Tab 1: Current Assignments
- Grid or list view toggle
- Search assigned areas
- "Modify Assignments" button (redirects to assignment page)
- Area cards with:
  - Firm name
  - Address
  - GPS coordinates
  - Assignment date
  - Remove button (with confirmation)
- Empty state with "Assign Areas" button

##### Tab 2: Assignment History
- Timeline view of all changes
- Shows:
  - Action type (Added/Removed/Updated)
  - Area name and address
  - Timestamp
  - Who made the change
  - Optional notes
- Color-coded action badges:
  - Green for Added/Assigned
  - Red for Removed/Unassigned
  - Yellow for Updated/Modified

### 🎨 UI Components

```
┌──────────────────────────────────────────────────────┐
│  ← View Area Assignments      [+ New Assignment]     │
│  View and manage user area assignments and history   │
└──────────────────────────────────────────────────────┘

┌─────────────┬────────────────────────────────────────┐
│  Users      │  User Info Banner                      │
│  🔍 Search  │  ┌──────────────────────────────────┐  │
│             │  │  JD  John Doe                    │  │
│ ┌─────────┐ │  │      john@company.com            │  │
│ │ ● John  │ │  │      [ADMIN]                     │  │
│ │   Doe   │ │  │      📍 25 Areas  📋 12 History  │  │
│ └─────────┘ │  └──────────────────────────────────┘  │
│             │                                         │
│   Jane S.   │  [Current Assignments] [History]       │
│             │                                         │
│   Mike W.   │  🔍 [Search...]  [Modify] [⊞] [≡]     │
│             │  ┌──────────────────────────────────┐  │
│             │  │  🏢 ABC Corp              ✕      │  │
│             │  │  📍 123 Main Street              │  │
│             │  │  📌 10.123, 20.654               │  │
│             │  │  🕐 Assigned: Jan 15, 2025       │  │
│             │  └──────────────────────────────────┘  │
└─────────────┴────────────────────────────────────────┘

HISTORY TAB:
┌──────────────────────────────────────────────────────┐
│  Assignment History Timeline                         │
├──────────────────────────────────────────────────────┤
│  ●─── [Added] ────────────────── Jan 15, 2025 10:30  │
│  │    ABC Corp                                       │
│  │    📍 123 Main Street                             │
│  │    👤 By: Admin User                              │
│  │                                                   │
│  ●─── [Removed] ──────────────── Jan 10, 2025 14:20  │
│  │    XYZ Limited                                    │
│  │    📍 456 Oak Avenue                              │
│  │    👤 By: System Admin                            │
└──────────────────────────────────────────────────────┘
```

### 🔧 Technical Details

**File:** `src/features/punchin/pages/AreaAssignView.jsx`
**Styles:** `src/features/punchin/pages/AreaAssignView.scss`

**State Management:**
```javascript
- users: Array of all users
- selectedUser: Currently selected user
- userAreas: Array of user's assigned areas (with details)
- assignmentHistory: Array of history records
- searchUser: Search term for users
- searchArea: Search term for areas
- loading: Loading state for areas
- historyLoading: Loading state for history
- activeTab: 'current' or 'history'
- viewMode: 'grid' or 'list'
```

**Key Functions:**
- `handleUserSelect(user)` - Select user and load data
- `fetchUserAssignedAreas Details(userId)` - Get detailed area info
- `fetchAssignmentHistory(userId)` - Get history timeline
- `handleRemoveArea(areaId)` - Remove single area assignment
- `formatDate(dateString)` - Format timestamps
- `getActionBadgeClass(action)` - Get badge color class

---

## 🔌 API Requirements

### Backend Endpoints

#### 1. Get User Areas (IDs only)
```http
GET /user-areas/:userId/
```
**Response:**
```json
{
  "user_id": 1,
  "area_ids": [1, 2, 3, 5, 8]
}
```

#### 2. Get User Assigned Areas (Full Details)
```http
GET /user-areas/:userId/details/
```
**Response:**
```json
{
  "user_id": 1,
  "areas": [
    {
      "id": 1,
      "firm_name": "ABC Corp",
      "address": "123 Main Street, City",
      "latitude": 10.123456,
      "longitude": 20.654321,
      "assigned_at": "2025-01-15T10:30:00Z"
    },
    ...
  ]
}
```

#### 3. Get User Area History
```http
GET /user-areas/:userId/history/
```
**Response:**
```json
{
  "user_id": 1,
  "history": [
    {
      "id": 1,
      "action": "added",
      "area_name": "ABC Corp",
      "area_address": "123 Main Street",
      "created_at": "2025-01-15T10:30:00Z",
      "assigned_by": "Admin User",
      "notes": "Initial assignment"
    },
    {
      "id": 2,
      "action": "removed",
      "area_name": "XYZ Ltd",
      "area_address": "456 Oak Avenue",
      "created_at": "2025-01-10T14:20:00Z",
      "assigned_by": "System Admin",
      "notes": "User transferred"
    },
    ...
  ]
}
```

#### 4. Update User Areas
```http
POST /user-areas/:userId/
```
**Request Body:**
```json
{
  "area_ids": [1, 2, 3, 5, 8]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Areas assigned successfully",
  "assigned_count": 5,
  "removed_count": 2
}
```

---

## 🗄️ Database Schema

### Table: `user_areas`
```sql
CREATE TABLE user_areas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    area_id INTEGER NOT NULL REFERENCES shop_location(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, area_id)
);

CREATE INDEX idx_user_areas_user ON user_areas(user_id);
CREATE INDEX idx_user_areas_area ON user_areas(area_id);
```

### Table: `user_area_history`
```sql
CREATE TABLE user_area_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    area_id INTEGER REFERENCES shop_location(id) ON DELETE SET NULL,
    area_name VARCHAR(255) NOT NULL,
    area_address TEXT,
    action VARCHAR(20) NOT NULL, -- 'added', 'removed', 'updated'
    assigned_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_user ON user_area_history(user_id);
CREATE INDEX idx_history_date ON user_area_history(created_at DESC);
```

---

## 🚀 Integration Guide

### Step 1: Add Routes

```javascript
// In App.jsx or routes file
import { AreaAssign, AreaAssignView } from './features/punchin';

<Routes>
  {/* Area Assignment - Admin Only */}
  <Route 
    path="/area-assign" 
    element={
      <ProtectedRoute allowedRoles={['Admin']}>
        <AreaAssign />
      </ProtectedRoute>
    } 
  />
  
  {/* View Assigned Areas - Admin Only */}
  <Route 
    path="/area-assign-view" 
    element={
      <ProtectedRoute allowedRoles={['Admin']}>
        <AreaAssignView />
      </ProtectedRoute>
    } 
  />
</Routes>
```

### Step 2: Add to Menu Configuration

```javascript
// In menuConfig.js
{
  id: 'area-assign',
  label: 'Area Assignment',
  path: '/area-assign',
  icon: 'fa-map-marked-alt',
  category: 'Administration',
  allowedRoles: ['Admin']
},
{
  id: 'area-assign-view',
  label: 'View Assignments',
  path: '/area-assign-view',
  icon: 'fa-list-alt',
  category: 'Administration',
  allowedRoles: ['Admin']
}
```

### Step 3: Backend Implementation

Create API endpoints as specified above and implement:
1. User-area relationship management
2. History logging (on insert, update, delete)
3. Permission checks
4. Transaction handling

---

## 🧪 Testing Guide

### Functional Testing

#### Area Assignment Page
- [ ] Load users successfully
- [ ] Search users by name, email, role
- [ ] Select user and proceed to step 2
- [ ] Load areas for selected user
- [ ] Search areas by name and address
- [ ] Toggle area selection
- [ ] Select all / clear all functionality
- [ ] Progress bar updates correctly
- [ ] Save assignments successfully
- [ ] Back navigation works
- [ ] Success notification appears
- [ ] Return to step 1 after save

#### View Assigned Areas Page
- [ ] Load users in sidebar
- [ ] Search users in sidebar
- [ ] Select user and load data
- [ ] Current assignments tab displays correctly
- [ ] History tab displays correctly
- [ ] Search assigned areas
- [ ] Toggle between grid and list views
- [ ] Remove area with confirmation
- [ ] Navigate to assignment page
- [ ] Timeline displays correctly with color coding
- [ ] Empty states display correctly

### Responsive Testing
- [ ] Mobile (< 576px)
- [ ] Tablet (576px - 991px)
- [ ] Desktop (≥ 992px)
- [ ] Touch interactions
- [ ] Navigation between pages

### Security Testing
- [ ] Admin-only access enforced
- [ ] API authentication required
- [ ] CSRF protection
- [ ] Input validation
- [ ] SQL injection prevention

---

## 📊 Features Comparison

| Feature | Assignment Page | View Page |
|---------|----------------|-----------|
| Select User | ✅ Step 1 | ✅ Sidebar |
| Assign Areas | ✅ Step 2 | ❌ |
| View Current Assignments | ❌ | ✅ Tab 1 |
| View History | ❌ | ✅ Tab 2 |
| Remove Single Area | ❌ | ✅ |
| Grid/List View | ✅ | ✅ |
| Search Functionality | ✅ | ✅ |
| Statistics Dashboard | ✅ | ✅ |

---

## 🎯 User Workflows

### Workflow 1: Assign Areas to New User
1. Navigate to Area Assignment
2. Search and select the new user
3. Select multiple areas using checkboxes
4. Review progress bar
5. Click "Save Assignments"
6. See success notification
7. Automatically return to step 1

### Workflow 2: Modify Existing Assignments
1. Navigate to View Assigned Areas
2. Select user from sidebar
3. View current assignments in Tab 1
4. Click "Modify Assignments"
5. System redirects to Assignment page (pre-select user)
6. Add or remove areas
7. Save changes

### Workflow 3: Remove Single Area
1. Navigate to View Assigned Areas
2. Select user from sidebar
3. Click remove button on specific area card
4. Confirm removal
5. Area removed and history updated

### Workflow 4: Review Assignment History
1. Navigate to View Assigned Areas
2. Select user from sidebar
3. Click "Assignment History" tab
4. View timeline of all changes
5. See who made changes and when

---

## 🔒 Security Considerations

1. **Role-Based Access**
   - Only admins can access both pages
   - Enforce on frontend and backend

2. **Data Validation**
   - Validate user IDs exist
   - Validate area IDs exist
   - Prevent duplicate assignments

3. **Audit Trail**
   - Log all assignment changes
   - Track who made changes
   - Include timestamps

4. **Concurrent Updates**
   - Handle simultaneous edits
   - Use database transactions
   - Implement optimistic locking if needed

---

## 📈 Future Enhancements

1. **Bulk Operations**
   - Assign same areas to multiple users
   - Copy assignments from one user to another

2. **Area Groups**
   - Create area categories
   - Assign entire groups at once

3. **Advanced Filters**
   - Filter by region
   - Filter by assignment date
   - Filter by assignment status

4. **Reports**
   - Export assignments to CSV/PDF
   - Generate assignment reports
   - User access analytics

5. **Notifications**
   - Email users when areas are assigned
   - Notify supervisors of changes
   - Scheduled assignment reports

---

## 🛠️ Troubleshooting

### Issue: Areas not loading
**Solution:** Check API endpoint and network tab

### Issue: History not displaying
**Solution:** Verify history endpoint and data format

### Issue: Remove button not working
**Solution:** Check confirmation dialog and API call

### Issue: Search not working
**Solution:** Verify filter logic in useMemo hooks

### Issue: Styles not applied
**Solution:** Ensure SCSS files are imported

---

## 📝 Change Log

**Version 1.0.0** (October 13, 2025)
- ✅ Initial release
- ✅ Two-step wizard for area assignment
- ✅ View assigned areas with details
- ✅ Assignment history timeline
- ✅ Responsive design
- ✅ Complete documentation

---

**Created:** October 13, 2025  
**Status:** Ready for Backend Integration  
**Maintained By:** Development Team
